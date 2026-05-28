"use client";

import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, setDoc, getDoc, collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";
import { signOut } from "firebase/auth";
import jsPDF from "jspdf";

interface Task {
  text: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  estimate: string;
}

interface ScheduleItem {
  time: string;
  task: string;
  duration: string;
  tip: string;
}

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [estimate, setEstimate] = useState("");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<{id: string, date: string, schedule: ScheduleItem[]}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [streak, setStreak] = useState(0);
  const [motivation, setMotivation] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
    } else {
      loadData();
    }
  }, [user, loading, router]);

  useEffect(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    const timer = setTimeout(() => {
      const newTasks = tasks.map(t => ({ ...t, done: false }));
      setTasks(newTasks);
      setSchedule([]);
      saveData(newTasks, []);
    }, msUntilMidnight);
    return () => clearTimeout(timer);
  }, [tasks]);

  const loadData = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setTasks(data.tasks || []);
      setSchedule(data.schedule || []);
      setStreak(data.streak || 0);
    }

    const historyRef = collection(db, "users", user.uid, "history");
    const historyQuery = query(historyRef, orderBy("date", "desc"));
    const historySnap = await getDocs(historyQuery);
    const historyData = historySnap.docs.map(d => ({
      id: d.id,
      date: d.data().date,
      schedule: d.data().schedule,
    }));
    setHistory(historyData);
  };

  const saveData = async (newTasks: Task[], newSchedule: ScheduleItem[], newStreak?: number) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, {
      tasks: newTasks,
      schedule: newSchedule,
      streak: newStreak ?? streak,
      lastActive: new Date().toDateString(),
    });
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  const addTask = () => {
    if (!input.trim()) return;
    const newTasks = [...tasks, { text: input.trim(), done: false, priority, estimate: estimate || "30 mins" }];
    setTasks(newTasks);
    setInput("");
    setEstimate("");
    setPriority("medium");
    saveData(newTasks, schedule);
  };

  const deleteTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    saveData(newTasks, schedule);
  };

  const toggleTask = async (index: number) => {
    const newTasks = tasks.map((task, i) =>
      i === index ? { ...task, done: !task.done } : task
    );
    setTasks(newTasks);
    const allDone = newTasks.every(t => t.done) && newTasks.length > 0;
    let newStreak = streak;
    if (allDone) {
      newStreak = streak + 1;
      setStreak(newStreak);
    }
    saveData(newTasks, schedule, newStreak);
  };

  const clearDay = async () => {
    const confirmed = window.confirm("Clear all tasks and schedule?");
    if (!confirmed) return;
    setTasks([]);
    setSchedule([]);
    setMotivation("");
    saveData([], []);
  };

  const exportPDF = () => {
    const pdf = new jsPDF();

    // Header
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, 210, 40, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text("FocusForge", 20, 18);
    pdf.setFontSize(10);
    pdf.setTextColor(180, 180, 180);
    pdf.text("AI-Powered Daily Schedule", 20, 26);
    pdf.text(new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }), 20, 34);

    let y = 55;

    // Motivation
    if (motivation) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`"${motivation}"`, 20, y);
      y += 12;
    }

    // Schedule
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Your AI Schedule", 20, y);
    y += 8;

    schedule.forEach((item) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      pdf.setDrawColor(230, 230, 230);
      pdf.setFillColor(248, 248, 248);
      pdf.roundedRect(15, y, 180, 22, 3, 3, "FD");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${item.time} — ${item.task}`, 20, y + 8);
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      // Fixed: replaced 💡 emoji with plain "Tip:" text
      pdf.text(`${item.duration}  |  Tip: ${item.tip}`, 20, y + 16);
      y += 28;
    });

    // Tasks
    y += 5;
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Tasks", 20, y);
    y += 8;

    tasks.forEach((task) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      // Fixed: replaced ✓/○ with [x]/[ ] and removed priority color emojis
      const priorityLabel = task.priority === "high" ? "high" : task.priority === "medium" ? "medium" : "low";
      pdf.setFontSize(10);
      pdf.setTextColor(task.done ? 150 : 0, task.done ? 150 : 0, task.done ? 150 : 0);
      pdf.text(`${task.done ? "[x]" : "[ ]"} ${task.text} (${priorityLabel} priority · ${task.estimate})`, 20, y);
      y += 8;
    });

    pdf.save("focusforge-schedule.pdf");
  };

  const generateSchedule = async () => {
    if (tasks.length === 0) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.map(t => `${t.text} (priority: ${t.priority}, estimate: ${t.estimate})`)
        }),
      });
      const data = await res.json();
      const newSchedule = data.schedule || [];
      setSchedule(newSchedule);
      setMotivation(data.motivation || "");
      saveData(tasks, newSchedule);
      const historyRef = collection(db, "users", user!.uid, "history");
      await addDoc(historyRef, {
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        schedule: newSchedule,
      });
      await loadData();
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const priorityConfig = {
    high: { label: "🔴 High", color: "text-red-400 border-red-400/30 bg-red-400/10" },
    medium: { label: "🟡 Medium", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
    low: { label: "🟢 Low", color: "text-green-400 border-green-400/30 bg-green-400/10" },
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-black text-white p-8">

      {/* Navbar */}
      <nav className="flex items-center justify-between mb-12">
        <div className="flex flex-col">
          <span className="text-xl font-bold">FocusForge ⚡</span>
          <span className="text-white/40 text-xs">Hi, {user?.displayName} 👋</span>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span className="text-orange-400 text-sm font-semibold">🔥 {streak} day streak</span>
          )}
          <button
            onClick={async () => {
              await signOut(auth);
              await new Promise(resolve => setTimeout(resolve, 500));
              window.location.href = "/";
            }}
            className="bg-white/10 text-white px-4 py-2 rounded-full text-sm hover:bg-white/20 transition"
          >
            Sign out
          </button>
        </div>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Your Day</h1>
      <p className="text-white/50 mb-8">Add your tasks and let AI build your schedule.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT COLUMN */}
        <div>
          {/* Task Input */}
          <div className="flex gap-3 mb-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Add a task..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/30"
            />
            <button onClick={addTask} className="bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
              Add
            </button>
          </div>

          {/* Priority + Estimate */}
          <div className="flex gap-3 mb-6">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm outline-none"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <input
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
              placeholder="Time estimate (e.g. 1 hour)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/30 outline-none focus:border-white/30"
            />
          </div>

          {/* Progress Bar */}
          {tasks.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/40 mb-2">
                <span>{completedCount}/{tasks.length} tasks done</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="flex flex-col gap-3 mb-6">
            {tasks.map((task, i) => (
              <div key={i} className={`border rounded-xl px-4 py-3 flex items-center justify-between transition ${task.done ? "bg-white/5 border-white/5 opacity-50" : "bg-white/5 border-white/10"}`}>
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleTask(i)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${task.done ? "bg-white border-white" : "border-white/30 hover:border-white/60"}`}
                  >
                    {task.done && <span className="text-black text-xs">✓</span>}
                  </button>
                  <div className="flex flex-col">
                    <span className={task.done ? "line-through text-white/40 text-sm" : "text-white/80 text-sm"}>{task.text}</span>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityConfig[task.priority]?.color || priorityConfig.medium.color}`}>
                        {priorityConfig[task.priority]?.label || "🟡 Medium"}
                      </span>
                      <span className="text-xs text-white/30">⏱ {task.estimate}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteTask(i)} className="text-white/30 hover:text-red-400 transition text-lg ml-2">✕</button>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-8 flex-wrap">
            {tasks.length > 0 && (
              <>
                <button
                  onClick={generateSchedule}
                  disabled={generating}
                  className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {generating ? "Generating..." : "⚡ Generate My Day"}
                </button>
                <button
                  onClick={clearDay}
                  className="bg-white/10 text-white/60 px-6 py-3 rounded-xl text-sm hover:bg-red-500/20 hover:text-red-400 transition"
                >
                  🗑 Clear Day
                </button>
                {schedule.length > 0 && (
                  <button
                    onClick={exportPDF}
                    className="bg-white/10 text-white/60 px-6 py-3 rounded-xl text-sm hover:bg-blue-500/20 hover:text-blue-400 transition"
                  >
                    📄 Export PDF
                  </button>
                )}
              </>
            )}
          </div>

          {/* History Section */}
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-white/40 text-sm hover:text-white/70 transition mb-4"
            >
              {showHistory ? "▲ Hide history" : "▼ Show past schedules"}
            </button>
            {showHistory && (
              <div className="flex flex-col gap-6">
                {history.length === 0 && (
                  <p className="text-white/30 text-sm">No past schedules yet.</p>
                )}
                {history.map((item) => (
                  <div key={item.id} className="border border-white/10 rounded-2xl p-5">
                    <p className="text-white/40 text-sm mb-4">📅 {item.date}</p>
                    <div className="flex flex-col gap-3">
                      {item.schedule.map((s, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">{s.task}</span>
                            <span className="text-white/40 text-xs">{s.time}</span>
                          </div>
                          <div className="text-white/40 text-xs">{s.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Schedule */}
        <div>
          {motivation && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
              <p className="text-white/60 text-sm italic">💬 {motivation}</p>
            </div>
          )}
          {schedule.length > 0 && (
            <>
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
            </>
          )}
        </div>

      </div>
    </main>
  );
}