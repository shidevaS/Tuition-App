"use client";

import Link from "next/link";
import { APP_NAME, PILLARS } from "@tuiton/shared";
import { Logo } from "@/components/logo";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui";

const FEATURES = [
  { title: "Live & on-demand", body: "Every topic exists both as a live class on the calendar and as integrated material in the library — miss one, the recording lands in context the same night." },
  { title: "Two pillars", body: "School subjects and an Innovation Lab — coding, prompt engineering, AI tools, app-building, cyber basics — under one roof, one profile, one streak." },
  { title: "Challenges build the habit", body: "A compact daily task keeps the streak alive. Weekly challenges earn badges; monthly capstones earn a feature and a certificate." },
  { title: "A profile that earns its keep", body: "A shareable portfolio of projects and prompts, a skill tree, and progress dashboards — not a vanity page." },
] as const;

const HERO_CALLS_TO_ACTION = [
  { label: "Sign up free", href: "/register", variant: "primary" },
  { label: "Log in", href: "/login", variant: "ghost" },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <Logo href="/" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Join a live class</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:pt-24">
          <Badge tone="gold" className="mb-6">Build Roadmap · Phase 1 · 2026</Badge>
          <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            Tuition meets the{" "}
            <span className="text-[rgb(var(--primary))]">AI&nbsp;studio</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            A learning platform that blends school-subject tuition with an AI & innovation track — live classes plus a pre-integrated content library, and growth through daily, weekly and monthly challenges.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {HERO_CALLS_TO_ACTION.map((cta) => (
              <Button key={cta.label} size="lg" variant={cta.variant} asChild>
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ))}
          </div>
        </section>

        {/* Pillars */}
        <section className="border-y border-border bg-[rgb(var(--card))]">
          <div className="mx-auto grid max-w-6xl gap-px px-5 py-12 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <Card key={p.id} className="border-0 bg-transparent p-6">
                <CardHeader className="p-0">
                  <CardTitle className="font-serif text-2xl">{p.label}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <p className="text-muted-foreground">{p.tagline}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="mb-8 font-serif text-3xl font-semibold">One roof, two pillars</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Card key={f.title} className="bg-[rgb(var(--card))]">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Chatbot Section */}
        <section className="mx-auto max-w-6xl px-5 py-14 border-t border-border">
          <h2 className="mb-6 font-serif text-3xl font-semibold">AI Tutoring Assistant</h2>
          <p className="mb-4 text-lg text-muted-foreground">
            Get instant help with subjects, coding, prompt engineering, and more. Ask a question below or browse recent topics.
          </p>
          <div className="border rounded-lg bg-[rgb(var(--card))] p-4 min-h-[300px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 text-sm text-muted-foreground" id="chat-history">
              <p className="text-muted-foreground small">Start a conversation to see AI responses here...</p>
            </div>
            <div className="p-3 border-t border-border">
              <textarea
                className="w-full p-2 rounded border outline-none resize-none"
                placeholder="Ask AI about math, coding, or anything..."
                rows={3}
                id="chat-input"
              ></textarea>
              <Button size="sm" className="mt-2 w-full">
                Send
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 {APP_NAME}. Hosted by Shivani & Devendra.</span>
          <span className="text-xs">Free-first · Live classes · Innovation Lab</span>
        </div>
      </footer>
    </div>
  );
}
