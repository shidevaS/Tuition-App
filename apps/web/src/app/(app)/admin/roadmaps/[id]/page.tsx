import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Select, Label, Badge } from "@/components/ui";
import { PILLARS } from "@tuiton/shared";

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: "Admin - Edit Roadmap" };

export default async function AdminRoadmapEditPage({ params }: Props) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const roadmap = await prisma.roadmap.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!roadmap) notFound();

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Edit Roadmap</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">Manage modules and lessons for {roadmap.title}</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/admin/roadmaps">Back to Roadmaps</a>
        </Button>
      </header>

      {/* Roadmap Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Roadmap Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/roadmaps/[id]" method="POST" className="space-y-4">
            <input type="hidden" name="id" value={roadmap.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" value={roadmap.slug} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pillar">Pillar</Label>
                <Select name="pillar" value={roadmap.pillar} required>
                  {PILLARS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={roadmap.title} required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" name="tagline" value={roadmap.tagline} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grade">Grade Level</Label>
                <Input id="grade" name="grade" value={roadmap.grade || ""} placeholder="9–10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color">Color</Label>
                <Input id="color" name="color" type="color" value={roadmap.color} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order">Order</Label>
                <Input id="order" name="order" type="number" value={roadmap.order} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="published">Published</Label>
                <Select name="published" value={roadmap.published.toString()}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={roadmap.description || ""} placeholder="Detailed description" rows={3} />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-lg">Modules</CardTitle>
          <Button size="sm" asChild>
            <a href={`/admin/roadmaps/${roadmap.id}/modules/new`}>Add Module</a>
          </Button>
        </CardHeader>
        <CardContent>
          {roadmap.modules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No modules yet. Click &quot;Add Module&quot; to create one.</p>
          ) : (
            <div className="space-y-4">
              {roadmap.modules.map((mod) => (
                <Card key={mod.id} className="border-border/50">
                  <CardContent className="pt-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="font-serif text-lg">{mod.title}</CardTitle>
                          <Badge variant="outline">Module {mod.order}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{mod.lessons.length} lessons</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/admin/roadmaps/${roadmap.id}/modules/${mod.id}/edit`}>Edit</a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/admin/roadmaps/${roadmap.id}/modules/${mod.id}/lessons`}>Manage Lessons</a>
                        </Button>
                        <form action="/api/admin/modules" method="POST" style={{ display: "inline" }}>
                          <input type="hidden" name="action" value="delete" />
                          <input type="hidden" name="id" value={mod.id} />
                          <input type="hidden" name="roadmapId" value={roadmap.id} />
                          <Button type="submit" variant="destructive" size="sm" onClick={(e) => {
                            if (!confirm("Delete this module and all its lessons?")) e.preventDefault();
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