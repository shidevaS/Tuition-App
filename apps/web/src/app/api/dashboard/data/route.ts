import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.sub;

  const [enrollments, progress, challenges, submissions, profile] = await Promise.all([
    prisma.courseEnrollment.findMany({ where: { userId }, select: { courseId: true } }),
    prisma.lessonProgress.findMany({ where: { userId }, select: { lessonId: true, completed: true } }),
    prisma.challenge.findMany({
      where: { published: true },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, kind: true, title: true, cadence: true, difficulty: true },
    }),
    prisma.challengeSubmission.findMany({ where: { userId }, select: { challengeId: true, status: true, xpAwarded: true } }),
    prisma.studentProfile.findUnique({ where: { userId } }),
  ]);

  const completedLessons = progress.filter((p) => p.completed).length;
  const totalLessons = await prisma.lesson.count();
  const completedChallenges = submissions.filter((s) => s.status === "APPROVED").length;
  const totalChallenges = await prisma.challenge.count({ where: { published: true } });

  return NextResponse.json({
    completedLessons,
    totalLessons,
    activeChallenges: challenges.length,
    totalChallenges,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    streak: profile?.streak || 0,
    enrollments: enrollments.length,
  });
}