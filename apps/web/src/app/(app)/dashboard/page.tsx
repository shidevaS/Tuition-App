// @jsxRuntime classic
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { getSession, isAdmin } from "@/lib/session";
import { Button, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  // Differentiate based on role
  if (isAdmin(session)) {
    return <AdminDashboard />;
  }

  // Fetch user's progress and data (student view)
  const userId = session.sub;
  const [enrollments, progress, challenges, submissions] = await Promise.all([
    prisma.courseEnrollment.findMany({ where: { userId }, select: { courseId: true } }),
    prisma.lessonProgress.findMany({ where: { userId }, select: { lessonId: true, completed: true } }),
    prisma.challenge.findMany({
      where: { published: true },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, kind: true, title: true, cadence: true, difficulty: true },
    }),
    prisma.challengeSubmission.findMany({ where: { userId }, select: { challengeId: true, status: true, xpAwarded: true } }),
  ]);

  const completedLessons = progress.filter((p) => p.completed).length;
  const totalLessons = await prisma.lesson.count();
  const completedChallenges = submissions.filter((s) => s.status === "APPROVED").length;
  const totalChallenges = await prisma.challenge.count({ where: { published: true } });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome to your dashboard</p>
      </header>

      <section aria-label="Learning overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-semibold">{completedLessons}</p>
                <p className="text-sm text-muted-foreground">lessons completed</p>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2">
                <div className="h-2 rounded-full bg-primary" style={{ width: totalLessons > 0 ? `${Math.min(100, (completedLessons / totalLessons) * 100)}%` : "0%" }}></div>
              </div>
              <p className="text-xs text-muted-foreground">{totalLessons} total lessons</p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 sm:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Recent Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:space-y-0 xl:block xl:space-y-4">
              {challenges.map((ch) => (
                <div key={ch.id} className="min-w-0 border-b border-border/70 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone="neutral" className="shrink-0">{ch.kind.replace(/_/g, " ")}</Badge>
                    <span className="shrink-0 text-xs text-muted-foreground">{ch.difficulty.toLowerCase()}</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-medium" title={ch.title}>{ch.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{ch.cadence.toLowerCase()} challenge</p>
                </div>
              ))}
              {challenges.length === 0 && <p className="text-sm text-muted-foreground">New challenges will appear here.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="font-serif text-lg">XP & Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-semibold">+{submissions.reduce((sum, s) => sum + (s.xpAwarded || 0), 0)}</p>
                <p className="text-sm text-muted-foreground">XP earned</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">{completedChallenges}</p>
                <p className="text-sm text-muted-foreground">challenges approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {enrollments.length} courses enrolled
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/** Admin dashboard - shows overall platform stats */
async function AdminDashboard() {
  const [users, totalChallenges, totalLessons, totalXP] = await Promise.all([
    prisma.user.findMany({ include: { profile: true } }),
    prisma.challenge.count({ where: { published: true } }),
    prisma.lesson.count(),
    prisma.xpLog.findMany({ where: { reason: { startsWith: "Challenge" } } }),
  ]);

  const totalStudents = users.filter((u) => u.role === "STUDENT").length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalXPSum = totalXP.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Platform overview and management</p>
      </header>

      <section aria-label="Platform overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Students Card */}
        <Card className="border-0 bg-[rgb(var(--card))]">
          <CardHeader className="p-0">
            <CardTitle className="font-serif text-lg">Total Students</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-semibold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">active students</p>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2">
                <div className="h-2 rounded-full bg-primary" style={{ width: totalStudents + totalAdmins > 0 ? `${(totalStudents / (totalStudents + totalAdmins)) * 100}%` : "0%" }}></div>
              </div>
              <p className="text-xs text-muted-foreground">of {totalStudents + totalAdmins} total users</p>
            </div>
          </CardContent>
        </Card>

        {/* Admins Card */}
        <Card className="border-0 bg-[rgb(var(--card))]">
          <CardHeader className="p-0">
            <CardTitle className="font-serif text-lg">Total Admins</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-semibold">{totalAdmins}</p>
                <p className="text-sm text-muted-foreground">platform admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenges Card */}
        <Card className="border-0 bg-[rgb(var(--card))]">
          <CardHeader className="p-0">
            <CardTitle className="font-serif text-lg">Total Challenges</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-semibold">{totalChallenges}</p>
                <p className="text-sm text-muted-foreground">published challenges</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP Card */}
        <Card className="border-0 bg-[rgb(var(--card))]">
          <CardHeader className="p-0">
            <CardTitle className="font-serif text-lg">Total XP Awarded</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-semibold">{totalXPSum}</p>
                <p className="text-sm text-muted-foreground">XP awarded total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}