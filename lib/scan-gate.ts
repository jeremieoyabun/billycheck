import { prisma } from "@/lib/prisma";
export const FREE_SCAN_LIMIT = 2;
export const SCAN_PRICE_EUR = 4.99;

export interface QuotaStatus {
  canScan: boolean;
  freeRemaining: number;
  paidCredits: number;
  requiresPayment: boolean;
}

/**
 * Check if a user can perform a scan.
 */
export async function getQuotaStatus(userIdentifier: string): Promise<QuotaStatus> {
  const quota = await prisma.userQuota.findUnique({
    where: { userIdentifier },
  });

  const freeUsed = quota?.freeScansUsed ?? 0;
  const paidCredits = quota?.paidCredits ?? 0;
  const freeRemaining = Math.max(0, FREE_SCAN_LIMIT - freeUsed);

  if (freeRemaining > 0) {
    return { canScan: true, freeRemaining, paidCredits, requiresPayment: false };
  }

  if (paidCredits > 0) {
    return { canScan: true, freeRemaining: 0, paidCredits, requiresPayment: false };
  }

  return { canScan: false, freeRemaining: 0, paidCredits: 0, requiresPayment: true };
}

/**
 * Consume one scan credit.
 * Uses free scans first, then paid credits.
 * Call this AFTER a successful scan (to prevent double-spend on failures).
 */
export async function consumeScanCredit(userIdentifier: string): Promise<void> {
  const quota = await prisma.userQuota.upsert({
    where: { userIdentifier },
    create: { userIdentifier, freeScansUsed: 0, paidCredits: 0 },
    update: {},
  });

  const freeRemaining = Math.max(0, FREE_SCAN_LIMIT - quota.freeScansUsed);

  if (freeRemaining > 0) {
    // Use a free scan
    await prisma.userQuota.update({
      where: { userIdentifier },
      data: { freeScansUsed: { increment: 1 } },
    });
  } else if (quota.paidCredits > 0) {
    // Use a paid credit
    await prisma.userQuota.update({
      where: { userIdentifier },
      data: { paidCredits: { decrement: 1 } },
    });
  } else {
    throw new Error("NO_CREDITS");
  }
}

/**
 * Grant paid credits after Stripe payment.
 */
export async function grantPaidCredit(userIdentifier: string, credits: number = 1): Promise<void> {
  await prisma.userQuota.upsert({
    where: { userIdentifier },
    create: { userIdentifier, freeScansUsed: FREE_SCAN_LIMIT, paidCredits: credits },
    update: { paidCredits: { increment: credits } },
  });
}
