import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

/**
 * Mentorship Requests API - 1-on-1 Personal Guidance feature
 * 
 * Endpoints:
 * - GET /api/mentorship-requests - List user's mentorship requests
 * - POST /api/mentorship-requests - Submit a new mentorship request
 */

// GET - List user's mentorship requests
export async function GET(
  req: Request
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.mentorshipRequest.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(requests);
}

// POST - Submit a new mentorship request
export async function POST(
  req: Request
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { category, title, description, priority } = body;

  if (!category || !title || !description) {
    return NextResponse.json({ error: "Category, title, and description are required" }, { status: 400 });
  }

  const mentorshipRequest = await prisma.mentorshipRequest.create({
    data: {
      userId: session.sub,
      category: category.trim(),
      title: title.trim(),
      description: description.trim(),
      priority: priority || "MEDIUM",
      status: "OPEN",
    },
  });

  // Create notification for the student
  await prisma.notification.create({
    data: {
      userId: session.sub,
      title: "Mentorship request submitted",
      body: `Your request "${title}" has been sent to a mentor.`,
      type: "mentorship_request",
      relatedId: mentorshipRequest.id,
    },
  });

  return NextResponse.json(mentorshipRequest);
}