import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

/**
 * Messages API - Student-Admin Communication Hub
 * 
 * Endpoints:
 * - GET /api/messages - List messages for a user (received or sent)
 * - POST /api/messages - Send a new message
 */

// GET - List messages received by a user (or sent by them)
export async function GET(
  req: Request
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get("receiverId"); // optional: filter by specific receiver
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const where: any = {
    receiverId: session.sub,
  };

  if (receiverId) {
    where.receiverId = receiverId;
  }

  if (unreadOnly) {
    where.read = false;
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(messages);
}

// POST - Send a new message
export async function POST(
  req: Request
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { receiverId, content, type } = body;

  if (!receiverId || !content) {
    return NextResponse.json({ error: "receiverId and content are required" }, { status: 400 });
  }

  // Prevent users from messaging themselves
  if (receiverId === session.sub) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  // Verify the receiver exists
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.sub,
      receiverId,
      content: content.trim(),
      type: type || "direct",
      read: false,
    },
  });

  // Create notification for the receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      title: "New message",
      body: `You have a new message from ${session.name || session.email}`,
      type: "message",
      relatedId: message.id,
    },
  });

  return NextResponse.json(message);
}