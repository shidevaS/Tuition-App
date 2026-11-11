import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

/** DELETE - Remove a course from the user's wishlist */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const wishlistItem = await prisma.wishlist.findUnique({
    where: { id },
  });

  if (!wishlistItem || wishlistItem.userId !== session.sub) {
    return NextResponse.json({ error: "Not found or not your wishlist item" }, { status: 404 });
  }

  await prisma.wishlist.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
