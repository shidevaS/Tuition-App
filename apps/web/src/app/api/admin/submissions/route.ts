import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession, isAdmin } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const submissions = await prisma.challengeSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
      challenge: { select: { id: true, title: true, kind: true, xp: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(submissions);
}