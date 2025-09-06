'use client'
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// CENTRALIZE TYPES IF NEEDED
type ScriptSession = {
  id: string;
  script: string;
  lines: string[];
  feedback: { [lineIdx: number]: { rating: number; comment: string } };
};

interface HistoryCardProps {
  sessions: ScriptSession[];
  onSelectSession: (id: string) => void;
  onBack: () => void;
}

export default function HistoryCard({ sessions, onSelectSession, onBack }: HistoryCardProps) {
  const [search, setSearch] = useState("");

  // Filter and sort history (most recent first)
  const sessionsToShow = sessions
    .filter(s => !search.length || s.script.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => parseInt(b.id) - parseInt(a.id));

  return (
    <motion.div
      className="flex-1 flex flex-col bg-black/70 backdrop-blur-xl px-8 pt-11 pb-7 min-h-[600px] relative"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 25 }}
      transition={{ duration: 0.16, type: "tween" }}
    >
      <div className="flex items-center mb-7 gap-5">
        <button
          onClick={onBack}
          className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-purple-200 font-medium text-xs shadow transition mr-2"
        >
          &larr; Back
        </button>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-300 to-purple-500 bg-clip-text text-transparent select-none tracking-tight">
          History
        </h2>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search scripts..."
          className="ml-auto px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white/85 font-medium shadow text-base focus:outline-none"
        />
      </div>
      {sessionsToShow.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-white/60 font-medium gap-2">
          <div className="text-3xl mb-2">No scripts found</div>
          <div className="text-base">Try a different search.</div>
        </div>
      )}
      <div className="flex flex-col gap-5 mt-4">
        {sessionsToShow.map((sess, idx) => (
          <motion.div
            key={sess.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, type: "tween" }}
          >
            <button
              onClick={() => onSelectSession(sess.id)}
              className="w-full flex flex-col text-left bg-gradient-to-br from-purple-500/10 to-black/40 hover:from-purple-500/20 hover:to-black/70 rounded-xl border border-white/10 shadow-md p-6 transition-all duration-300"
            >
              <div className="font-bold text-lg text-white/90 line-clamp-2 mb-1">
                {sess.script.substr(0, 80)}{sess.script.length > 80 ? "…" : ""}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-purple-200 text-xs font-semibold">{sess.lines.length} scenes</span>
                <span className="text-white/50 text-xs">{Object.keys(sess.feedback).length} rated</span>
                <span className="text-white/30 text-xs ml-auto">
                  {new Date(Number(sess.id)).toLocaleString()}
                </span>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
      <div className="pb-2" />
    </motion.div>
  );
}
