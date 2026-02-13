import { NextResponse } from "next/server";
import { getUserIdentifier, setUserIdCookie } from "@/lib/user-id.server";
import { getQuotaStatus } from "@/lib/scan-gate";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const uid = await getUserIdentifier(req);
  await setUserIdCookie(uid);

  const status = await getQuotaStatus(uid);

  return NextResponse.json({
    userIdentifier: uid,
    ...status,
  });
}
