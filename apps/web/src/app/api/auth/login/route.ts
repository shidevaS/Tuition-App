import { NextResponse, type NextRequest } from "next/server";
import { prisma, verifyPassword } from "@tuiton/db";
import { z } from "zod";
import { createSession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const role: "ADMIN" | "STUDENT" = user.role === "ADMIN" ? "ADMIN" : "STUDENT";
  const actor = { sub: user.id, email: user.email, name: user.name, role };
  const token = await createSession(actor);

  return NextResponse.json({
    token,
    user: actor,
    redirectTo: role === "ADMIN" ? "/admin" : "/dashboard",
  });
}
