export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getUserIdentifier, setUserIdCookie } from "@/lib/user-id.server";

export async function GET() {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return Response.json({ ok: true, scans });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Get user identifier for quota tracking
  const uid = body.userIdentifier || (await getUserIdentifier(req));
  await setUserIdCookie(uid);

  const scan = await prisma.scan.create({
    data: {
      status: "UPLOADED",
      fileKey: body.fileKey ?? null,
      originalName: body.originalName ?? null,
      mimeType: body.mimeType ?? null,
      size: body.size ?? null,
      engagement: body.engagement ?? null,
      userIdentifier: uid,
    },
  });

  return Response.json({ ok: true, scan });
}
