// @jsxRuntime classic
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in with your username and password to continue learning.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 rounded-lg border border-[rgb(var(--primary)/0.3)] bg-[rgb(var(--primary)/0.08)] px-4 py-3">
          <p className="text-sm font-semibold">Your login details</p>
          <p className="mt-1 text-sm text-muted-foreground">
            <strong>Username:</strong> Your email address. <strong>Password:</strong> Your account password.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">Use the seeded demo: <code>email: student@tuiton.com, password: tuiton123</code></p>
        </div>
        <LoginForm />
      </CardContent>
    </Card>
  );
}