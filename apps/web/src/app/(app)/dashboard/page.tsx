// @jsxRuntime classic
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { PILLARS } from "@tuiton/shared";
import { getSession } from "@/lib/session";
import { Button, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  // Differentiate based on role
  if (session.role === "ADMIN") {
    return <AdminDashboard />;
  }

  // Fetch user's progress and data (student view)
  const userId = session.sub;
  const [enrollments, progress, challenges, submissions] = await Promise.all([
    prisma.courseEnrollment.findMany({ where: { userId }, select: { courseId: true } }),
    prisma.lessonProgress.findMany({ where: { userId }, select: { lessonId: true, completed: true } }),
    prisma.challenge.findMany({ where: { published: true }, take: 5, orderBy: { createdAt: "desc" } }),
    prisma.challengeSubmission.findMany({ where: { userId }, select: { challengeId: true, status: true, xpAwarded: true } }),
  ]);

  const completedLessons = progress.filter((p) => p.completed).length;
  const totalLessons = await prisma.lesson.count();
  const completedChallenges = submissions.filter((s) => s.status === "APPROVED").length;
  const totalChallenges = await prisma.challenge.count({ where: { published: true } });

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome to your dashboard</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Card */}
        <Card className="border-0 bg-[rgb(var(--card))]">
          <CardHeader className="p-0">
            <CardTitle className="font-serif text-lg">Learning Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-semibold">{completedLessons}</p>
                <p className="text-sm text-muted-foreground">lessons completed</p>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2">
                <div className="h-2 rounded-full bg-primary" style={{ width: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0 }}></div>
              </div>
              <p className="text-xs text-muted-foreground">{totalLessons} total lessons</p>
            </div>
          </CardContent>
        </Card>

        {/* Challenges Card */}
        <Card className="border-0 bg-[rgb(var(--card))]">
          <CardHeader className="p-0">
            <CardTitle className="font-serif text-lg">Recent Challenges</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {challenges.map((ch) => (
                <div key={ch.id} className="flex items-center gap-3 text-sm">
                  <Badge tone="neutral" className="min-w-8">
                    {ch.kind}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium truncate">{ch.title}</p>
                    <p className="text-xs text-muted-foreground">{ch.cadence} {ch.difficulty}</p>
                  </div>
                  <Badge tone={ch.difficulty === "BEGINNER" ? "neutral" : ch.difficulty === "INTERMEDIATE" ? "teal" : "gold"} className="min-w-8">
                    {ch.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* XP Card */}
        <Card className="border-0 bg-[rgb(var(--card))]">
          <CardHeader className="p-0">
            <CardTitle className="font-serif text-lg">XP & Badges</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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

        {/* Enrolled Courses Card */}
        <Card className="border-0 bg-[rgb(var(--card))]">
          <CardHeader className="p-0">
            <CardTitle className="font-serif text-lg">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              {enrollments.length} courses enrolled
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/roadmaps">View all courses</Link>
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
    <div className="min-h-screen bg-background p-4">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and management</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="h-2 rounded-full bg-primary" style={{ width: totalStudents > 0 ? (totalStudents / (totalStudents + totalAdmins)) * 100 : 0 }}></div>
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