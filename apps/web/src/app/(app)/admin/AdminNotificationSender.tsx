"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea, Label, Select } from "@/components/ui";

export function AdminNotificationSender() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [href, setHref] = useState("");
  const [type, setType] = useState("system");
  const [target, setTarget] = useState("all"); // "all" | "specific"
  const [specificUserId, setSpecificUserId] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const types = [
    { value: "system", label: "System" },
    { value: "challenge", label: "Challenge" },
    { value: "course", label: "Course" },
    { value: "certification", label: "Certification" },
    { value: "competition", label: "Competition" },
    { value: "course_enrollment", label: "Course Enrollment" },
    { value: "competition_result", label: "Competition Result" },
    { value: "ai_interaction", label: "AI Interaction" },
  ];

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          href: href || undefined,
          userId: target === "specific" ? specificUserId || undefined : undefined,
          type,
        }),
      });

      if (res.ok) {
        setSent(true);
        setTitle("");
        setBody("");
        setHref("");
        setTarget("all");
        setSpecificUserId("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send notification");
      }
    } catch {
      setError("Failed to send notification. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="border-[rgb(var(--primary)/0.4)]">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Send Notification to Students</CardTitle>
        <CardDescription>
          Send a real-time notification or alert to all students or a specific student.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Notification sent successfully!
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New math challenge available"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter your notification message..."
                rows={3}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="href">Link (optional)</Label>
              <Input
                id="href"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                placeholder="/dashboard or /challenges"
                type="url"
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Notification Type</Label>
              <Select id="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full">
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="target">Send To</Label>
              <Select id="target" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full">
                <option value="all">All Students</option>
                <option value="specific">Specific Student (by User ID)</option>
              </Select>
            </div>
            {target === "specific" && (
              <div className="space-y-1.5">
                <Label htmlFor="specificUserId">Student User ID</Label>
                <Input
                  id="specificUserId"
                  value={specificUserId}
                  onChange={(e) => setSpecificUserId(e.target.value)}
                  placeholder="Enter the student's user ID"
                  className="w-full"
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sending…" : "Send Notification"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
