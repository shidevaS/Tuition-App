import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

/**
 * Daily Topics API - "1 New Topic Every Day" feature
 * 
 * Endpoints:
 * - GET /api/daily-topics - List published daily topics (filtered by dayKey)
 * - POST /api/daily-topics - Create a new daily topic (admin only)
 */

// GET - List published daily topics
export async function GET(
  req: Request
) {
  const { searchParams } = new URL(req.url);
  const dayKey = searchParams.get("dayKey"); // yyyymmdd format
  const published = searchParams.get("published") !== "false"; // default true

  const where: any = {
    published,
  };

  if (dayKey) {
    where.dayKey = dayKey;
  }

  const topics = await prisma.dailyTopic.findMany({
    where,
    orderBy: { order: "asc" },
    take: 10,
  });

  return NextResponse.json(topics);
}

// POST - Create a new daily topic (admin only)
export async function POST(
  req: Request
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
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
      published: published ?? true,
    },
  });

  return NextResponse.json(topic);
}