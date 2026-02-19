import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdentifier } from "@/lib/user-id.server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const REFERRAL_BONUS = 2;
const REF_COOKIE = "bc_ref";

export async function POST() {
  const jar = await cookies();
  const refCode = jar.get(REF_COOKIE)?.value;

  if (!refCode) {
    return NextResponse.json({ ok: false, reason: "no_ref" });
  }

  const referredId = await getUserIdentifier();

  // Idempotent: already claimed → no-op
  const existing = await prisma.referralClaim.findUnique({ where: { referredId } });
  if (existing) {
    return NextResponse.json({ ok: true, reason: "already_claimed" });
  }

  // Look up referrer
  const referrerQuota = await prisma.userQuota.findFirst({
    where: { referralCode: refCode },
  });
  if (!referrerQuota) {
    return NextResponse.json({ ok: false, reason: "invalid_code" });
  }

  // No self-referral
  if (referrerQuota.userIdentifier === referredId) {
    return NextResponse.json({ ok: false, reason: "self_referral" });
  }

  // Grant +2 to both + record claim (atomic)
  await prisma.$transaction([
    prisma.userQuota.update({
      where: { userIdentifier: referrerQuota.userIdentifier },
      data: { paidCredits: { increment: REFERRAL_BONUS } },
    }),
    prisma.userQuota.upsert({
      where: { userIdentifier: referredId },
      create: { userIdentifier: referredId, freeScansUsed: 0, paidCredits: REFERRAL_BONUS },
      update: { paidCredits: { increment: REFERRAL_BONUS } },
    }),
    prisma.referralClaim.create({
      data: {
        referralCode: refCode,
        referrerId: referrerQuota.userIdentifier,
        referredId,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, bonus: REFERRAL_BONUS });
}
