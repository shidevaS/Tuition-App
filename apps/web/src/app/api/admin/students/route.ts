import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession, isAdmin } from "@/lib/session";
import { z } from "zod";

const updateStudentSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  grade: z.string().trim().optional(),
  school: z.string().trim().optional(),
  role: z.enum(["STUDENT", "ADMIN"]).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Prevent changing role to ADMIN unless the email is one of the designated admins
  if (parsed.data.role === "ADMIN" && parsed.data.email && !["shivani@tuiton.app", "devendra@tuiton.app"].includes(parsed.data.email)) {
    return NextResponse.json({ error: "Only Shivani Sharma and Devendra Sharma can be admins" }, { status: 403 });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.email) updateData.email = parsed.data.email;
  if (parsed.data.role) updateData.role = parsed.data.role;

  const profileUpdate: Record<string, unknown> = {};
  if (parsed.data.grade !== undefined) profileUpdate.grade = parsed.data.grade;
  if (parsed.data.school !== undefined) profileUpdate.school = parsed.data.school;

  const student = await prisma.user.update({
    where: { id },
    data: {
      ...updateData,
      profile: existing.profile
        ? { update: profileUpdate }
        : { create: { grade: parsed.data.grade || "", school: parsed.data.school || "" } },
    },
    include: { profile: true },
  });

  return NextResponse.json(student);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  if (existing.role === "ADMIN") {
    return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
