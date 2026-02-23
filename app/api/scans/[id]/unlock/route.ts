export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import {
  addToList,
  upsertContact,
  BREVO_LIST_ELECTRICITY,
  BREVO_LIST_TELECOM,
} from "@/lib/brevo";

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

  // Extract data from scan results for Brevo attributes
  const resultJson = scan.resultJson as Record<string, unknown> | null;
  const vertical = resultJson?.vertical === "telecom" ? "telecom" : "electricity";
  const listId = vertical === "telecom" ? BREVO_LIST_TELECOM : BREVO_LIST_ELECTRICITY;

  // Build Brevo contact attributes from scan data
  const attributes: Record<string, string | number | boolean> = {
    VERTICAL: vertical,
    SCAN_ID: id,
  };

  const bill = resultJson?.bill as Record<string, unknown> | undefined;
  const offers = resultJson?.offers as Array<Record<string, unknown>> | undefined;

  if (bill?.provider) {
    attributes.CURRENT_PROVIDER = String(bill.provider);
  }

  if (offers && offers.length > 0) {
    const best = offers[0];
    attributes.BEST_PROVIDER = String(best.provider ?? "");
    attributes.BEST_PLAN = String(best.plan ?? "");

    const savings = Number(best.estimated_savings ?? best.savings_eur ?? 0);
    if (savings > 0) {
      attributes.SAVINGS_EUR = Math.round(savings);
    }
  }

  if (bill?.total_annual_ttc_eur) {
    attributes.ANNUAL_BILL_EUR = Math.round(Number(bill.total_annual_ttc_eur));
  }

  // Sync to Brevo (fire-and-forget, don't block the response)
  addToList(email, listId);
  upsertContact(email, attributes, [listId]);

  return Response.json({ ok: true });
}
