import { redirect } from "next/navigation";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Select, Label } from "@/components/ui";
import { PILLARS } from "@tuiton/shared";
import { notFound } from "next/navigation";

export const metadata = { title: "Admin - Roadmaps" };

export default async function AdminRoadmapsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const roadmaps = await prisma.roadmap.findMany({
    orderBy: [{ pillar: "asc" }, { order: "asc" }],
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Manage Roadmaps</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Create and manage learning roadmaps. Each roadmap contains modules and lessons.
        </p>
      </header>

      {/* Create Roadmap Form */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Create New Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/roadmaps" method="POST" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" placeholder="maths-ix-x" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pillar">Pillar</Label>
                <Select name="pillar" required>
                  {PILLARS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Mathematics (IX–X)" required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" name="tagline" placeholder="Board-aligned Algebra, Geometry, Trigonometry & Statistics" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grade">Grade Level</Label>
                <Input id="grade" name="grade" placeholder="9–10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color">Color</Label>
                <Input id="color" name="color" type="color" defaultValue="#166534" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order">Order</Label>
                <Input id="order" name="order" type="number" defaultValue="0" required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Detailed description of the roadmap" rows={3} />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit">Create Roadmap</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Roadmaps List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Existing Roadmaps</CardTitle>
        </CardHeader>
        <CardContent>
          {roadmaps.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No roadmaps yet. Create one above.</p>
          ) : (
            <div className="space-y-4">
              {roadmaps.map((rm) => (
                <Card key={rm.id} className="border-border/50">
                  <CardContent className="pt-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="font-serif text-lg">{rm.title}</CardTitle>
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: rm.color }} />
                          <span className="text-xs text-muted-foreground">{rm.pillar}</span>
                          <span className="text-xs text-muted-foreground">{rm.grade || "All grades"}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{rm.tagline}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{rm.modules.length} modules</span>
                          <span>•</span>
                          <span>{rm.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
                          <span>•</span>
                          <span>Order: {rm.order}</span>
                          <span>•</span>
                          <span>{rm.published ? "Published" : "Draft"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/admin/roadmaps/${rm.id}/edit`}>Edit</a>
                        </Button>
                        <form action="/api/admin/roadmaps" method="POST" style={{ display: "inline" }}>
                          <input type="hidden" name="action" value="delete" />
                          <input type="hidden" name="id" value={rm.id} />
                          <Button type="submit" variant="destructive" size="sm" onClick={(e) => {
                            if (!confirm("Delete this roadmap and all its content?")) e.preventDefault();
                          }}>
                            Delete
                          </Button>
                        </form>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}