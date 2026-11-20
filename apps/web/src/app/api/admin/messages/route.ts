import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession, isAdmin } from "@/lib/session";

/**
 * Admin Messages Management API
 * 
 * Endpoints:
 * - GET /api/admin/messages - List all messages (sent/received)
 * - PATCH /api/admin/messages/[id] - Mark a message as read
 * - DELETE /api/admin/messages/[id] - Delete a message
 */

// GET - List all messages
export async function GET(
  req: Request
) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get("receiverId"); // filter by specific receiver
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const where: any = {};

  if (receiverId) {
    where.receiverId = receiverId;
  }

  if (unreadOnly) {
    where.read = false;
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(messages);
}

// PATCH - Mark a message as read
export async function PATCH(
  req: Request
) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 401 });
  }

  const body = await req.json();
  const { id, read } = body;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const message = await prisma.message.update({
    where: { id },
    data: { read: read !== false }, // set to true if read param is truthy
  });

  return NextResponse.json(message);
}

// DELETE - Delete a message
export async function DELETE(
  req: Request
) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID parameter required" }, { status: 400 });
  }

  await prisma.message.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}