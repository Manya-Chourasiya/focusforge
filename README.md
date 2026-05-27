# FocusForge ⚡

> An AI-powered productivity dashboard that turns your to-do list into a smart daily schedule.

🔗 **Live Demo:** [focusforge-nine-theta.vercel.app](https://focusforge-nine-theta.vercel.app)

---

## What it does

FocusForge lets you add your tasks for the day and uses AI to generate a prioritized, time-blocked schedule — automatically. No more staring at a blank calendar wondering where to start.

## Features

- 🔐 Google login via Firebase Auth
- ✅ Add, complete and delete tasks
- ⚡ AI-generated daily schedule (powered by Groq + LLaMA 3)
- 📊 Progress bar and streak counter
- 📅 Schedule history — view past plans
- 💾 Data persists across sessions via Firestore
- 📱 Mobile responsive

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| AI | Groq API (LLaMA 3.3 70B) |
| Hosting | Vercel |

## Getting Started

```bash
git clone https://github.com/Manya-Chourasiya/focusforge.git
cd focusforge
npm install
```

Create a `.env.local` file with:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GROQ_API_KEY=
```

Then run:

```bash
npm run dev
```

## Author

**Manya Chourasiya** — B.Tech CSE, Avantika University  
[LinkedIn](https://linkedin.com/in/manya-chourasiya) · [GitHub](https://github.com/Manya-Chourasiya)