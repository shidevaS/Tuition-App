import { redirect } from "next/navigation";
import { prisma } from "@tuiton/db";
import { getSession, isAdmin } from "@/lib/session";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { StudentListClient } from "./StudentListClient";

export const metadata = { title: "Admin - Students" };

export default async function AdminStudentsPage() {
  const session = await getSession();
  if (!session || !isAdmin(session)) redirect("/dashboard");

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Manage Students</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Onboard, view, and manage student accounts. Only Shivani &amp; Devendra can access this panel.
          </p>
        </div>
        <Button asChild>
          <a href="/admin">Back to Admin Console</a>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Student Directory</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <StudentListClient initialStudents={students} />
        </CardContent>
      </Card>
    </div>
  );
}

