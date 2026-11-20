import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession, isAdmin } from "@/lib/session";

/**
 * Admin Mentorship Requests Management API
 * 
 * Endpoints:
 * - GET /api/admin/mentorship-requests - List all mentorship requests
 * - PATCH /api/admin/mentorship-requests/[id] - Update a mentorship request status/assignment
 */

// GET - List all mentorship requests
export async function GET(
  req: Request
) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // filter by status
  const category = searchParams.get("category"); // filter by category

  const where: any = {};

  if (status) {
    where.status = status.trim();
  }

  if (category) {
    where.category = category.trim();
  }

  const requests = await prisma.mentorshipRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(requests);
}

// PATCH - Update mentorship request status/assignment
export async function PATCH(
  req: Request
) {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized - Admin required" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status, assignedTo } = body;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const updateData: any = {};

  if (status) {
    updateData.status = status.trim();
  }

  if (assignedTo) {
    updateData.assignedTo = assignedTo.trim();
    updateData.assignedAt = new Date();
  }

  // If marking as resolved, add resolvedAt
  if (status === "RESOLVED") {
    updateData.resolvedAt = new Date();
  }

  const request = await prisma.mentorshipRequest.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(request);
}