export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Brevo list IDs
const BREVO_LIST_ELECTRICITY = 3;
const BREVO_LIST_TELECOM = 4;

async function addToBrevo(email: string, listId: number) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY not set — skipping Brevo sync");
    return;
  }

  try {
    const res = await fetch(
      `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
          accept: "application/json",
        },
        body: JSON.stringify({ emails: [email] }),
      }
    );

    // 400/409 = already in list, that's fine
    if (!res.ok && res.status !== 400 && res.status !== 409) {
      const text = await res.text().catch(() => "");
      console.error("Brevo error:", res.status, text);
    }
  } catch (err) {
    console.error("Brevo fetch failed:", err);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "Email invalide" }, { status: 400 });
  }

  // Find the scan
  const scan = await prisma.scan.findUnique({ where: { id } });
  if (!scan) {
    return Response.json({ ok: false, error: "Scan introuvable" }, { status: 404 });
  }

  // Store email on scan
  await prisma.scan.update({
    where: { id },
    data: { email },
  });

  // Also persist on UserQuota for cross-session identification
  if (scan.userIdentifier) {
    await prisma.userQuota.upsert({
      where: { userIdentifier: scan.userIdentifier },
      create: { userIdentifier: scan.userIdentifier, email },
      update: { email },
    });
  }

  // Determine vertical from resultJson
  const resultJson = scan.resultJson as Record<string, unknown> | null;
  const vertical = resultJson?.vertical === "telecom" ? "telecom" : "electricity";
  const listId = vertical === "telecom" ? BREVO_LIST_TELECOM : BREVO_LIST_ELECTRICITY;

  // Sync to Brevo (fire-and-forget, don't block the response)
  addToBrevo(email, listId);

  return Response.json({ ok: true });
}
