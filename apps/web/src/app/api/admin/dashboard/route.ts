import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession, isAdmin } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [users, students, admins, challenges, submissions, xp] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.challenge.count(),
    prisma.challengeSubmission.count(),
    prisma.xpLog.aggregate({ _sum: { amount: true } }),
  ]);

  return NextResponse.json({
    users,
    students,
    admins,
    challenges,
    submissions,
    totalXP: xp._sum.amount ?? 0,
  });
}
