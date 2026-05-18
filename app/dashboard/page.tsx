"use client";

import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <nav className="flex items-center justify-between mb-12">
        <span className="text-xl font-bold">FocusForge ⚡</span>
        <span className="text-white/50 text-sm">Hi, {user?.displayName} 👋</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Your Day</h1>
      <p className="text-white/50 mb-8">Add your tasks and let AI build your schedule.</p>

      {/* Task input coming next */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-xl">
        <p className="text-white/30 text-sm">Task input coming soon...</p>
      </div>
    </main>
  );
}