export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/brevo";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const provider = typeof body.provider === "string" ? body.provider : "";
  const plan = typeof body.plan === "string" ? body.plan : "";
  const vertical = typeof body.vertical === "string" ? body.vertical : "";
  const rank = typeof body.rank === "number" ? body.rank : -1;
  const savings = typeof body.savings === "number" ? body.savings : 0;

  // Find the scan to get the associated email
  const scan = await prisma.scan.findUnique({
    where: { id },
    select: { email: true },
  });

  if (!scan?.email) {
    // No email on this scan — nothing to track in Brevo
    return Response.json({ ok: true, tracked: false });
  }

  // Send event to Brevo (fire-and-forget)
  trackEvent(scan.email, "offer_clicked", {
    SCAN_ID: id,
    PROVIDER: provider,
    PLAN: plan,
    VERTICAL: vertical,
    RANK: rank,
    SAVINGS_EUR: savings,
  });

  return Response.json({ ok: true, tracked: true });
}
