import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import CommunityClient from "./CommunityClient";

import { redirect } from "next/navigation";

export const metadata = { title: "Community Forum" };

export default async function CommunityPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const [topicsRaw, user] = await Promise.all([
    prisma.forumTopic.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.user.findUnique({ where: { id: session.sub }, select: { id: true, name: true, role: true } }),
  ]);

  const topics = topicsRaw.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return <CommunityClient initialTopics={topics} sessionUser={user!} />;
}