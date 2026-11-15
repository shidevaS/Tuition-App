import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession, isAdmin } from "@/lib/session";
import { z } from "zod";

const sendNotificationSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(1000),
  href: z.string().trim().optional(),
  userId: z.string().optional(), // if not specified, send to all students
  type: z.enum(["challenge", "course", "certification", "competition", "system", "course_enrollment", "competition_result", "ai_interaction"]).default("system"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = sendNotificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, body: notificationBody, href, userId, type } = parsed.data;

  let notification;
  if (userId) {
    // Send to a specific user
    notification = await prisma.notification.create({
      data: {
        userId,
        title,
        body: notificationBody,
        href,
        type,
      },
    });
  } else {
    // Send to all students
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true },
    });

    notification = await prisma.notification.create({
      data: {
        userId: students[0]?.id || "",
        title,
        body: notificationBody,
        href,
        type,
      },
    });

    // Create notifications for all students
    await prisma.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        title,
        body: notificationBody,
        href,
        type,
      })),
    });
  }

  return NextResponse.json({ success: true, notification });
}
