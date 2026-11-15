import { NextResponse, type NextRequest } from "next/server";
import { hashPassword, prisma } from "@tuiton/db";
import { z } from "zod";
import { createSession } from "@/lib/session";

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a name, valid email, and password with at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hashPassword(parsed.data.password),
      role: "STUDENT",
      pillar: "subjects",
      profile: { create: { grade: "", school: "" } },
    },
  });

  const actor = { sub: user.id, email: user.email, name: user.name, role: "STUDENT" as const };
  const token = await createSession(actor);

  return NextResponse.json({ token, user: actor, redirectTo: "/dashboard" }, { status: 201 });
}
