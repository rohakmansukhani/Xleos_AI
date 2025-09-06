'use client'
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

type ScriptSession = {
  id: string;
  script: string;
  lines: string[];
  feedback: { [lineIdx: number]: { rating: number; comment: string } };
};

interface Props {
  session: ScriptSession;
  onSelectLine: (lineIdx: number) => void;
  onBackToInput: () => void;
}
// ...imports stay the same...

export default function LineByLineTimeline({ session, onSelectLine, onBackToInput }: Props) {
  const [lineStatuses, setLineStatuses] = useState<Array<'processing' | 'ready' | 'completed'>>(session.lines.map(() => 'processing'));

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    session.lines.forEach((_, idx) => {
      const t = setTimeout(() => {
        setLineStatuses(old =>
          old.map((s, i) =>
            i === idx
              ? (session.feedback[idx] ? 'completed' : 'ready')
              : s
          )
        );
      }, 1100 + 500 * idx);
      timeouts.push(t);
    });
    return () => timeouts.forEach(clearTimeout);
  }, [session.id]);

  useEffect(() => {
    setLineStatuses(stat =>
      stat.map((s, idx) =>
        session.feedback[idx] ? 'completed'
          : (s === 'completed' ? 'ready' : s)
      )
    );
  }, [session.feedback, session.id]);

  return (
    <div className="flex-1 px-7 pt-8 pb-6 overflow-y-auto transition-all duration-300">
      <div className="flex items-center gap-2 mb-7">
        <button onClick={onBackToInput}
          className="rounded-full p-2 bg-[#312b4c]/55 hover:bg-[#3b3267]/80 text-[#baaafc] font-bold text-xs shadow-sm transition mr-2 border border-[#7867ba28]">
          &larr; New Script
        </button>
        <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#cebee1] via-[#988de6] to-[#715ed2] bg-clip-text text-transparent select-none tracking-tight">
          Timeline
        </h2>
        <span className="ml-3 text-[#d6cef7b2] text-lg">{session.lines.length} Scenes</span>
      </div>
      <div className="flex flex-col gap-6">
        {session.lines.map((line, idx) => (
          <motion.div
            key={idx}
            layout
            transition={{ type: "spring", stiffness: 340, damping: 45 }}
          >
            <div
              className={`
                flex items-center justify-between py-4 px-5
                rounded-xl
                border border-[#a499cc22]
                ${lineStatuses[idx] === 'processing'
                  ? 'bg-white/4 opacity-60'
                  : lineStatuses[idx] === 'completed'
                  ? 'bg-gradient-to-r from-[#7f80d27a] to-[#d2cdfab4]'
                  : 'bg-gradient-to-r from-[#7c5dfa]/75 via-[#beacf790]/70 to-[#aa9efd]/70'}
                cursor-pointer group hover:scale-[1.01] hover:shadow-[0_3px_32px_0_rgba(120,110,220,0.08)]
                transition-all duration-200
              `}
              onClick={() => lineStatuses[idx] !== 'processing' && onSelectLine(idx)}
              tabIndex={lineStatuses[idx] !== 'processing' ? 0 : undefined}
              aria-disabled={lineStatuses[idx] === 'processing'}
              style={{ pointerEvents: lineStatuses[idx] === 'processing' ? 'none' : 'auto' }}
            >
              <div className="flex flex-col flex-1">
                <span className={
                  `text-lg font-semibold ${lineStatuses[idx] === 'completed'
                  ? 'text-[#b48bf7]' : 'text-white/95'}`
                }>
                  Scene {idx + 1}: {line}
                </span>
                <span className="text-xs text-[#ede7fbcc] mt-1">
                  {lineStatuses[idx] === 'processing' && 'Processing...'}
                  {lineStatuses[idx] === 'ready' && 'Ready – Review stock video suggestions'}
                  {lineStatuses[idx] === 'completed' && (
                    <>Feedback saved: {session.feedback[idx]?.rating}&#11088; – &quot;{session.feedback[idx]?.comment}&quot;</>
                  )}
                </span>
              </div>
              <div className="ml-5">
                {lineStatuses[idx] === 'processing' && (
                  <div className="h-5 w-5 rounded-full bg-[#7c5dfa]/30 animate-pulse shadow-lg" />
                )}
                {lineStatuses[idx] === 'ready' && (
                  <div className="h-5 w-5 rounded-full bg-[#ae82fc]/50 flex items-center justify-center shadow" >
                    <span className="text-white font-bold text-lg select-none">&#8594;</span>
                  </div>
                )}
                {lineStatuses[idx] === 'completed' && (
                  <div className="h-5 w-5 rounded-full bg-[#a197f8] flex items-center justify-center shadow">
                    <span className="text-white font-extrabold text-lg">&#10003;</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="pb-2" />
      <div className="flex justify-end mt-10">
        <span className="text-[#adaacd]/70 text-xs select-none">
          Xleos AI Script Timeline &nbsp;&nbsp;•&nbsp;&nbsp; {new Date().toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
