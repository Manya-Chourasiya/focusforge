"use client";

import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

interface ScheduleItem {
  time: string;
  task: string;
  duration: string;
  tip: string;
}

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [tasks, setTasks] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [generating, setGenerating] = useState(false);

  const loadData = async (uid: string) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setTasks(data.tasks || []);
      setSchedule(data.schedule || []);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
    } else {
      loadData(user.uid);
    }
  }, [user, loading]);

  const saveData = async (newTasks: string[], newSchedule: ScheduleItem[]) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { tasks: newTasks, schedule: newSchedule });
  };

  const addTask = () => {
    if (!input.trim()) return;
    const newTasks = [...tasks, input.trim()];
    setTasks(newTasks);
    setInput("");
    saveData(newTasks, schedule);
  };

  const deleteTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    saveData(newTasks, schedule);
  };

  const generateSchedule = async () => {
    if (tasks.length === 0) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      const data = await res.json();
      const newSchedule = data.schedule || [];
      setSchedule(newSchedule);
      saveData(tasks, newSchedule);
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading...
    </div>
  );

  if (!user) return null;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <nav className="flex items-center justify-between mb-12">
        <span className="text-xl font-bold">FocusForge ⚡</span>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm">Hi, {user?.displayName} 👋</span>
          <button
            onClick={handleSignOut}
            className="bg-white/10 text-white px-4 py-2 rounded-full text-sm hover:bg-white/20 transition"
          >
            Sign out
          </button>
        </div>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Your Day</h1>
      <p className="text-white/50 mb-8">Add your tasks and let AI build your schedule.</p>

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

      <div className="flex flex-col gap-3 max-w-xl mb-8">
        {tasks.map((task, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 flex items-center justify-between">
            <span>{task}</span>
            <button
              onClick={() => deleteTask(i)}
              className="text-white/30 hover:text-red-400 transition text-lg"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {tasks.length > 0 && (
        <button
          onClick={generateSchedule}
          disabled={generating}
          className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50 mb-10"
        >
          {generating ? "Generating..." : "⚡ Generate My Day"}
        </button>
      )}

      {schedule.length > 0 && (
        <div className="max-w-xl">
          <h2 className="text-xl font-bold mb-4">Your AI Schedule</h2>
          <div className="flex flex-col gap-4">
            {schedule.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{item.task}</span>
                  <span className="text-white/40 text-sm">{item.time}</span>
                </div>
                <div className="text-white/40 text-sm mb-2">{item.duration}</div>
                <div className="text-white/60 text-sm">💡 {item.tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}