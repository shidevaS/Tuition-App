import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Label } from "@/components/ui";

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: "Admin - New Module" };

export default async function AdminNewModulePage({ params }: Props) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const roadmap = await prisma.roadmap.findUnique({ where: { id } });
  if (!roadmap) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">New Module</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">Add a module to {roadmap.title}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Module Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/modules" method="POST" className="space-y-4">
            <input type="hidden" name="roadmapId" value={roadmap.id} />
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Algebra" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Polynomials, equations, inequalities" rows={3} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order">Order</Label>
              <Input id="order" name="order" type="number" defaultValue="0" required />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit">Create Module</Button>
              <Button variant="outline" asChild>
                <a href={`/admin/roadmaps/${roadmap.id}`}>Cancel</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}