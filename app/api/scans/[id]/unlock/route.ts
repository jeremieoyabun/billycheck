export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  return Response.json({ ok: true });
}
