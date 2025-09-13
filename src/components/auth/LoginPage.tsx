'use client'
import React, { useState } from "react";

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  hideTitle?: boolean;
}

export default function LoginPage({ onLogin, hideTitle }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return setErr("All fields are required!");
    setErr(null);
    onLogin(email, password);
  }

  return (
    <>
      {!hideTitle && (
        <h2 className="text-2xl font-bold text-white mb-5 text-center">Sign in to Xleos</h2>
      )}
      <form
        className="flex flex-col items-center justify-center gap-4"
        style={{ minWidth: 320 }}
        onSubmit={handle}
        autoComplete="off"
      >
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          autoFocus
          className="px-4 py-3 w-full rounded-lg bg-white/10 border border-white/10 text-white/95 shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="px-4 py-3 w-full rounded-lg bg-white/10 border border-white/10 text-white/95 shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        {err && <div className="text-sm text-red-400">{err}</div>}
        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 py-2 text-white font-semibold mt-1 shadow-md hover:scale-105 active:scale-95 transition"
        >
          Sign In
        </button>
        {/* Signup button removed */}
      </form>
    </>
  );
}
