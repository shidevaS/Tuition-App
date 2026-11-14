"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";

type AppNavigationProps = {
  isAdmin: boolean;
};

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/courses", label: "Courses" },
  { href: "/tutor", label: "AI Tutor" },
  { href: "/live", label: "Live Classes" },
  { href: "/challenges", label: "Challenges" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
  { href: "/community", label: "Community" },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export function AppNavigation({ isAdmin }: AppNavigationProps) {
  const pathname = usePathname();
  const items = isAdmin ? [...links, { href: "/admin", label: "Admin console" }] : links;
  const primaryItems = items.slice(0, 4);
  const moreItems = items.slice(4);

  function renderLinks(linkItems: typeof items, mobile = false) {
    return linkItems.map(({ href, label }) => {
      const active = isActivePath(pathname, href);
      return (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={[
            "whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors",
            active
              ? "bg-[rgb(var(--primary)/0.12)] font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            mobile ? "block" : "",
          ].join(" ")}
        >
          {label}
        </Link>
      );
    });
  }

  return (
    <nav aria-label="Main navigation" className="border-b border-border bg-background/50">
      <div className="hidden items-center gap-1 xl:flex">
        {renderLinks(primaryItems)}
        {moreItems.length > 0 && (
          <details className="relative">
            <summary className={`flex h-10 cursor-pointer list-none items-center gap-1 rounded-md px-3 text-sm transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden ${moreItems.some(({ href }) => isActivePath(pathname, href)) ? "bg-[rgb(var(--primary)/0.12)] font-medium text-foreground" : "text-muted-foreground"}`}>
              More
              <ChevronDown size={15} aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
              <div className="space-y-1">{renderLinks(moreItems, true)}</div>
            </div>
          </details>
        )}
      </div>
      <details className="relative xl:hidden">
        <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted [&::-webkit-details-marker]:hidden">
          <Menu size={17} aria-hidden="true" />
          Menu
        </summary>
        <div className="absolute right-0 top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-2 shadow-lg">
          <div className="space-y-1">{renderLinks(items, true)}</div>
        </div>
      </details>
    </nav>
  );
}
