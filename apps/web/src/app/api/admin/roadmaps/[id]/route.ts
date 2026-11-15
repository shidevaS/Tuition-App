import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession, isAdmin } from "@/lib/session";
import { z } from "zod";

const roadmapSchema = z.object({
  slug: z.string().trim().min(1).max(100),
  pillar: z.enum(["subjects", "innovation"]),
  title: z.string().trim().min(1).max(200),
  tagline: z.string().trim().min(1).max(500),
  grade: z.string().trim().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#166534"),
  order: z.number().int().default(0),
  description: z.string().trim().max(5000).optional(),
  published: z.boolean().default(true),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = roadmapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid roadmap data", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.roadmap.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
  }

  // Check if slug is being changed and if it conflicts
  if (parsed.data.slug !== existing.slug) {
    const slugConflict = await prisma.roadmap.findUnique({ where: { slug: parsed.data.slug } });
    if (slugConflict) {
      return NextResponse.json({ error: "Roadmap with this slug already exists" }, { status: 400 });
    }
  }

  const roadmap = await prisma.roadmap.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(roadmap);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.roadmap.delete({ where: { id } });
  return NextResponse.json({ success: true });
}