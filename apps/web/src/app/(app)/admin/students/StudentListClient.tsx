"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  profile: { grade?: string | null; school?: string | null } | null;
}

export function StudentListClient({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);

  async function handleSave(student: Student, name: string, email: string, grade: string, school: string) {
    try {
      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: student.id, name, email, grade, school }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...updated } : s)));
      } else {
        alert("Failed to update student");
      }
    } catch {
      alert("Failed to update student");
    }
  }

  async function handleDelete(student: Student) {
    if (!confirm(`Delete student ${student.name}?`)) return;
    try {
      const res = await fetch(`/api/admin/students?id=${student.id}`, { method: "DELETE" });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
      } else {
        alert("Failed to delete student");
      }
    } catch {
      alert("Failed to delete student");
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">Name</th>
            <th className="pb-3 pr-4 font-medium">Email</th>
            <th className="pb-3 pr-4 font-medium">Grade</th>
            <th className="pb-3 pr-4 font-medium">School</th>
            <th className="pb-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-muted-foreground">
                No students found. Students appear here when they register.
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StudentRow({
  student,
  onSave,
  onDelete,
}: {
  student: Student;
  onSave: (student: Student, name: string, email: string, grade: string, school: string) => void;
  onDelete: (student: Student) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [grade, setGrade] = useState(student.profile?.grade || "");
  const [school, setSchool] = useState(student.profile?.school || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(student, name, email, grade, school);
      setEditing(false);
    } catch {
      alert("Failed to update student");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete student ${student.name}?`)) return;
    setDeleting(true);
    try {
      await onDelete(student);
    } catch {
      alert("Failed to delete student");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-3 pr-4 font-medium">{student.name}</td>
      <td className="py-3 pr-4 text-muted-foreground">{student.email}</td>
      <td className="py-3 pr-4 text-muted-foreground">{student.profile?.grade || "—"}</td>
      <td className="py-3 pr-4 text-muted-foreground">{student.profile?.school || "—"}</td>
      <td className="py-3 text-right">
        {editing ? (
          <form onSubmit={handleSave} className="flex items-center gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="w-32 text-xs" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="w-32 text-xs" />
            <Input value={grade} onChange={(e) => setGrade(e.target.value)} className="w-16 text-xs" placeholder="Grade" />
            <Input value={school} onChange={(e) => setSchool(e.target.value)} className="w-24 text-xs" placeholder="School" />
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
