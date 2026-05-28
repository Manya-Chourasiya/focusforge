"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthButton from "@/components/AuthButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen" style={{ background: "var(--bg)" }} />;
  if (user) return <div className="min-h-screen" style={{ background: "var(--bg)" }} />;

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <nav
        className="flex items-center justify-between px-8 py-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="text-xl font-bold" style={{ color: "var(--text)" }}>FocusForge ⚡</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthButton />
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center text-center flex-1 px-6 py-32 gap-6">
        <span
          className="text-sm px-4 py-1 rounded-full"
          style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
        >
          AI-Powered Productivity
        </span>
        <h1 className="text-5xl font-bold max-w-2xl leading-tight" style={{ color: "var(--text)" }}>
          Stop planning. <br /> Start doing.
        </h1>
        <p className="text-lg max-w-xl" style={{ color: "var(--text-muted)" }}>
          FocusForge turns your messy to-do list into a smart daily schedule — powered by AI.
        </p>
      </section>

      <section
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-8 py-16 max-w-5xl mx-auto w-full"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {[
          { title: "AI Scheduling", desc: "Let AI build your perfect day automatically." },
          { title: "Smart Priorities", desc: "Tasks ranked by urgency, energy, and deadlines." },
          { title: "Daily Streaks", desc: "Stay consistent and track your productivity over time." },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl p-6"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>{feature.title}</h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{feature.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}