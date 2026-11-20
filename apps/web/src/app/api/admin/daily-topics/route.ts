import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession, isAdmin } from "@/lib/session";

/**
 * Admin Daily Topics Management API
 * 
 * Endpoints:
 * - GET /api/admin/daily-topics - List all daily topics (published and unpublished)
 * - POST /api/admin/daily-topics - Create a new daily topic
 * - PATCH /api/admin/daily-topics/[id] - Update a daily topic
 * - DELETE /api/admin/daily-topics/[id] - Delete a daily topic
 */

// GET - List all daily topics
export async function GET(
  req: Request
) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published"); // filter by published status
  const kind = searchParams.get("kind"); // filter by kind

  const where: any = {};

  if (published !== undefined) {
    where.published = published === "true";
  }

  if (kind) {
    where.kind = kind.trim();
  }

  const topics = await prisma.dailyTopic.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(topics);
}

// POST - Create a new daily topic
export async function POST(
  req: Request
) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 401 });
  }

  const body = await req.json();
  const { title, summary, kind, difficulty, content, xp, order: orderInput, dayKey, published } = body;

  if (!title || !summary || !kind) {
    return NextResponse.json({ error: "Title, summary, and kind are required" }, { status: 400 });
  }

  const topic = await prisma.dailyTopic.create({
    data: {
      title: title.trim(),
      summary: summary.trim(),
      kind: kind.trim(),
      difficulty: difficulty || "BEGINNER",
      content: content?.trim() || null,
      xp: Number.isInteger(xp) && xp > 0 ? xp : 10,
      order: Number.isInteger(orderInput) && orderInput >= 0 ? orderInput : 0,
      dayKey: dayKey?.trim() || null,
      published: published !== undefined ? published === "true" : true,
    },
  });

  return NextResponse.json(topic);
}