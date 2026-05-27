import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FocusForge — AI-Powered Daily Planner",
  description: "Turn your messy to-do list into a smart daily schedule powered by AI. Free to use, no signup friction.",
  keywords: ["productivity", "AI planner", "daily schedule", "task manager", "focus"],
  authors: [{ name: "Manya Chourasiya" }],
  openGraph: {
    title: "FocusForge — AI-Powered Daily Planner",
    description: "Turn your messy to-do list into a smart daily schedule powered by AI.",
    url: "https://focusforge-nine-theta.vercel.app",
    siteName: "FocusForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusForge — AI-Powered Daily Planner",
    description: "Turn your messy to-do list into a smart daily schedule powered by AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
