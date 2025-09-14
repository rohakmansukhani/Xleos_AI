'use client'
import React, { useState } from "react";

export default function ScriptInputCard({ onSubmitAction }: { onSubmitAction: (script: string) => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) {
      setError("Please enter your creative vision/script.");
      return;
    }
    setError(null);
    onSubmitAction(input); // <-- DO NOT TRIM HERE, keep full multiline
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16 gap-6 transition-all duration-300"
      autoComplete="off"
    >
      <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-[#b8a8fa] to-[#7d68c1] bg-clip-text text-transparent mb-3">
        What Would You Like To Create?
      </h2>
      <p className="text-lg md:text-xl text-[#bab1df] max-w-xl mb-5">
        Describe your vision as a script or creative brief—AI will generate storyboard lines and surface the best stock video clips for each moment.
      </p>
      <textarea
        className="w-full max-w-2xl rounded-xl border border-[#7c5dfa33] px-6 py-5 text-white/90 text-lg min-h-[120px] focus:outline-none focus:ring-2  transition placeholder:text-[#cabcf7c6] resize-none"
        placeholder="Enter Your Script"
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={6}
        maxLength={1500}
        onKeyDown={e => {
          if (
            e.key === "Enter"
            && !e.shiftKey
          ) {
            e.preventDefault();
            handleSubmit();
          }
          // else allow Shift+Enter to insert a new line!
        }}
      />
      {error && <div className="text-[#ff709b] font-medium text-sm">{error}</div>}
      <button
        type="submit"
        className="rounded-full bg-gradient-to-br from-[#7c5dfa] to-[#bb80ff] px-8 py-3 text-lg text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition"
      >
        Generate Storyboard
      </button>
    </form>
  );
}
