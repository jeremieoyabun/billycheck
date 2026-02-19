import { NextResponse } from "next/server";
import { getUserIdentifier } from "@/lib/user-id.server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

function generateCode(): string {
  // 8 uppercase hex chars — collision-safe at MVP scale
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function GET() {
  const uid = await getUserIdentifier();

  let quota = await prisma.userQuota.findUnique({ where: { userIdentifier: uid } });

  if (!quota) {
    // Create quota record with referral code
    quota = await prisma.userQuota.create({
      data: { userIdentifier: uid, referralCode: generateCode() },
    });
  } else if (!quota.referralCode) {
    // Assign code to existing quota (up to 5 attempts for uniqueness)
    let code = generateCode();
    for (let i = 0; i < 4; i++) {
      const conflict = await prisma.userQuota.findFirst({ where: { referralCode: code } });
      if (!conflict) break;
      code = generateCode();
    }
    quota = await prisma.userQuota.update({
      where: { userIdentifier: uid },
      data: { referralCode: code },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://billycheck.com";
  return NextResponse.json({
    code: quota.referralCode,
    url: `${appUrl}/?ref=${quota.referralCode}`,
  });
}
