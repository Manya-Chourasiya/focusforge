"use client";

import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function AuthButton() {
  const [user] = useAuthState(auth);

  const login = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-white/70 text-sm">Hi, {user.displayName}</span>
        <button
          onClick={logout}
          className="bg-white/10 text-white px-4 py-2 rounded-full text-sm hover:bg-white/20 transition"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition"
    >
      Get Started
    </button>
  );
}