import { cookies, headers } from "next/headers";
import { createHash } from "crypto";

const COOKIE_NAME = "bc_uid";

export async function setUserIdCookie(uid: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, uid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}

function hash(input: string) {
  return createHash("sha256").update(input).digest("hex").slice(0, 32);
}

export async function getUserIdentifier(_req?: Request): Promise<string> {
  const jar = await cookies();
  const fromCookie = jar.get(COOKIE_NAME)?.value;
  if (fromCookie) return fromCookie;

  const h = await headers();
  const ua = h.get("user-agent") ?? "unknown";
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "0.0.0.0";

  const ip24 = ip.includes(".") ? ip.split(".").slice(0, 3).join(".") : ip;
  return "fp_" + hash(`${ip24}|${ua}`);
}
