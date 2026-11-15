import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/session";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui";
import { NotificationsBell } from "@/components/notifications-bell";
import { SWRegistration } from "@/components/sw-registration";
import { PWAInstallPrompt } from "@/components/pwa-install";
import { AppNavigation } from "@/components/app-navigation";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const userIsAdmin = Boolean(session && isAdmin(session));

  return (
    <div className="flex min-h-screen flex-col">
      <SWRegistration />
      <PWAInstallPrompt />
      <header className="sticky top-0 z-20 border-b border-border bg-[rgb(var(--card))]">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex min-w-0 items-center gap-4">
            <Logo href={userIsAdmin ? "/admin" : "/dashboard"} />
            <AppNavigation isAdmin={userIsAdmin} />
          </div>
          <div className="flex items-center gap-3">
            <NotificationsBell />
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden font-medium sm:inline">{session.name}</span>
              <Badge tone={userIsAdmin ? "gold" : "teal"}>{userIsAdmin ? "Admin" : "Student"}</Badge>
            </div>
            <SignOutButton />
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-8">{children}</div>
      </main>
    </div>
  );
}