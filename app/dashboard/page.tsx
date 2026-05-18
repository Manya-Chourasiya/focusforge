"use client";

import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [tasks, setTasks] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, input.trim()]);
    setInput("");
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <nav className="flex items-center justify-between mb-12">
        <span className="text-xl font-bold">FocusForge ⚡</span>
        <span className="text-white/50 text-sm">Hi, {user?.displayName} 👋</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Your Day</h1>
      <p className="text-white/50 mb-8">Add your tasks and let AI build your schedule.</p>

      {/* Task Input */}
      <div className="flex gap-3 max-w-xl mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/30"
        />
        <button
          onClick={addTask}
          className="bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          Add
        </button>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3 max-w-xl">
        {tasks.map((task, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80">
            {task}
          </div>
        ))}
      </div>
    </main>
  );
}