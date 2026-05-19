"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold text-white">FocusForge ⚡</span>
        <AuthButton />
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-1 px-6 py-32 gap-6">
        <span className="text-sm bg-white/10 text-white/70 px-4 py-1 rounded-full">
          AI-Powered Productivity
        </span>
        <h1 className="text-5xl font-bold max-w-2xl leading-tight">
          Stop planning. <br /> Start doing.
        </h1>
        <p className="text-white/60 text-lg max-w-xl">
          FocusForge turns your messy to-do list into a smart daily schedule — powered by AI.
        </p>
        <button className="bg-white text-black px-8 py-3 rounded-full font-semibold text-base hover:bg-gray-200 transition">
          Try it free →
        </button>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-8 py-16 border-t border-white/10 max-w-5xl mx-auto w-full">
        {[
          { title: "AI Scheduling", desc: "Let AI build your perfect day automatically." },
          { title: "Smart Priorities", desc: "Tasks ranked by urgency, energy, and deadlines." },
          { title: "Daily Streaks", desc: "Stay consistent and track your productivity over time." },
        ].map((feature) => (
          <div key={feature.title} className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-white/50 text-sm">{feature.desc}</p>
          </div>
        ))}
      </section>

    </main>
  );
}