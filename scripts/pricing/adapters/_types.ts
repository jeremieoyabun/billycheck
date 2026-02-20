// scripts/pricing/adapters/_types.ts
//
// Shared adapter interface + helpers for partner pricing scrapers.

import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";

/* ──────────────────────────────────────────────
   Adapter interface
   ────────────────────────────────────────────── */

export interface AdapterContext {
  /** Fetch URL as UTF-8 text (HTML, JSON, CSV) */
  fetchText(url: string): Promise<string>;
  /** Fetch URL as raw Buffer (PDF) */
  fetchBuffer(url: string): Promise<Buffer>;
  /** Today's date as YYYY-MM-DD */
  today: string;
  /** YYYYMM for current month */
  currentMonth: string;
  /** YYYYMM for previous month */
  previousMonth: string;
  /** Logger */
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
}

export interface PartnerAdapter<T> {
  /** Unique adapter identifier (matches source registry key) */
  id: string;
  /** Human-readable label */
  label: string;
  /** Fetch and parse partner data, returning validated rows */
  fetch(ctx: AdapterContext): Promise<T[]>;
}

/* ──────────────────────────────────────────────
   Caching layer
   ────────────────────────────────────────────── */

const CACHE_DIR = path.resolve(__dirname, "../.cache");
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheMeta {
  url: string;
  etag?: string;
  lastModified?: string;
  fetchedAt: string;
}

function cacheKey(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 16);
}

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCachedMeta(url: string): CacheMeta | null {
  const metaPath = path.join(CACHE_DIR, `${cacheKey(url)}.meta.json`);
  if (!fs.existsSync(metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  } catch {
    return null;
  }
}

function getCachedData(url: string, ext: string): Buffer | null {
  const dataPath = path.join(CACHE_DIR, `${cacheKey(url)}.${ext}`);
  if (!fs.existsSync(dataPath)) return null;
  return fs.readFileSync(dataPath);
}

function writeCache(url: string, ext: string, data: Buffer, meta: CacheMeta): void {
  ensureCacheDir();
  const key = cacheKey(url);
  fs.writeFileSync(path.join(CACHE_DIR, `${key}.${ext}`), data);
  fs.writeFileSync(path.join(CACHE_DIR, `${key}.meta.json`), JSON.stringify(meta, null, 2));
}

function isCacheFresh(meta: CacheMeta): boolean {
  const fetchedAt = new Date(meta.fetchedAt).getTime();
  return Date.now() - fetchedAt < CACHE_MAX_AGE_MS;
}

/* ──────────────────────────────────────────────
   HTTP fetching with caching + conditional requests
   ────────────────────────────────────────────── */

const USER_AGENT = "BillyCheck-PricingSync/1.0 (pricing comparison)";

function rawFetch(
  url: string,
  headers: Record<string, string> = {},
): Promise<{ status: number; headers: Record<string, string>; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https://") ? https : http;
    const allHeaders: Record<string, string> = {
      "User-Agent": USER_AGENT,
      ...headers,
    };
    client
      .get(url, { headers: allHeaders }, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const respHeaders: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.headers)) {
            if (v) respHeaders[k.toLowerCase()] = Array.isArray(v) ? v[0] : v;
          }
          resolve({
            status: res.statusCode ?? 0,
            headers: respHeaders,
            body: Buffer.concat(chunks),
          });
        });
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

export interface FetchOptions {
  noCache?: boolean;
}

async function cachedFetch(url: string, ext: string, opts?: FetchOptions): Promise<Buffer> {
  if (!opts?.noCache) {
    const meta = getCachedMeta(url);
    if (meta && isCacheFresh(meta)) {
      const cached = getCachedData(url, ext);
      if (cached) return cached;
    }

    // Try conditional request
    const condHeaders: Record<string, string> = {};
    if (meta?.etag) condHeaders["If-None-Match"] = meta.etag;
    if (meta?.lastModified) condHeaders["If-Modified-Since"] = meta.lastModified;

    if (Object.keys(condHeaders).length > 0) {
      const resp = await rawFetch(url, condHeaders);
      if (resp.status === 304) {
        const cached = getCachedData(url, ext);
        if (cached) {
          // Refresh timestamp
          writeCache(url, ext, cached, { ...meta!, fetchedAt: new Date().toISOString() });
          return cached;
        }
      }
    }
  }

  // Full fetch
  const resp = await rawFetch(url);
  if (resp.status !== 200) {
    throw new Error(`HTTP ${resp.status} for ${url}`);
  }

  const meta: CacheMeta = {
    url,
    etag: resp.headers["etag"],
    lastModified: resp.headers["last-modified"],
    fetchedAt: new Date().toISOString(),
  };
  writeCache(url, ext, resp.body, meta);
  return resp.body;
}

/* ──────────────────────────────────────────────
   Build AdapterContext
   ────────────────────────────────────────────── */

export function buildContext(opts?: { noCache?: boolean; verbose?: boolean }): AdapterContext {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const prevDate = new Date(yyyy, now.getMonth() - 1, 1);
  const prevMM = String(prevDate.getMonth() + 1).padStart(2, "0");
  const prevYYYY = prevDate.getFullYear();

  return {
    today: `${yyyy}-${mm}-${dd}`,
    currentMonth: `${yyyy}${mm}`,
    previousMonth: `${prevYYYY}${prevMM}`,

    async fetchText(url: string): Promise<string> {
      const buf = await cachedFetch(url, "html", opts);
      return buf.toString("utf-8");
    },

    async fetchBuffer(url: string): Promise<Buffer> {
      return cachedFetch(url, "pdf", opts);
    },

    log(...args: unknown[]) {
      if (opts?.verbose !== false) console.log("[adapter]", ...args);
    },
    warn(...args: unknown[]) {
      console.warn("[adapter]", ...args);
    },
  };
}

/* ──────────────────────────────────────────────
   Shared helpers
   ────────────────────────────────────────────── */

/** Slugify a string: lowercase, spaces → underscores, strip non-alphanum */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[àáâãä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[ïî]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[üû]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Parse a European number string: "12,345" → 12.345, "0,0829" → 0.0829 */
export function parseEuroNum(s: string): number | null {
  if (!s) return null;
  const cleaned = s.replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/** Monthly price → annual */
export function monthlyToAnnual(monthly: number): number {
  return Math.round(monthly * 12 * 100) / 100;
}

/** Parse data amount like "30 GB", "150GB", "Illimité" → number | null */
export function parseDataGb(s: string): number | null {
  if (!s) return null;
  if (/illimit/i.test(s)) return 9999;
  const m = s.match(/([\d.,]+)\s*(?:GB|Go)/i);
  if (!m) return null;
  return parseEuroNum(m[1]);
}

/** Extract first price-like value from text: "14,99 €/mois" → 14.99 */
export function parsePriceFromText(text: string): number | null {
  const m = text.match(/([\d]+[.,][\d]{2,4})\s*€/);
  if (!m) return null;
  return parseEuroNum(m[1]);
}

/** Assert a price is within a sane range for electricity €/kWh */
export function assertElecPrice(price: number, label: string): void {
  if (price < 0.01 || price > 1.0) {
    throw new Error(`${label}: price ${price} €/kWh outside sane range [0.01, 1.0]`);
  }
}

/** Sleep for ms */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
