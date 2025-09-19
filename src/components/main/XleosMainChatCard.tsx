"use client";
import React, { useRef, useState, useEffect } from "react";
import { ArrowUpCircle } from "lucide-react";

interface MainChatProps {
  onSubmitScript: (script: string) => void;
  maxLength?: number;
}

export default function XleosMainChatCard({
  onSubmitScript,
  maxLength = 1000,
}: MainChatProps) {
  const [input, setInput] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmitScript(input);
      setInput("");
    }
  };

  const charsLeft = maxLength - input.length;

  return (
    <div className="flex flex-col items-center justify-center flex-1 pt-14 pb-10 px-10 relative min-h-[420px]">
      <h2 className="text-[2.3rem] md:text-5xl font-extrabold leading-tight text-center bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4 drop-shadow">
        What Would You Like To{" "}
        <span className="font-black text-[#c09dff]">Create?</span>
      </h2>
      <p className="text-lg md:text-xl text-white/80 mt-2 text-center max-w-lg mb-1">
        Describe your vision and our AI will curate the perfect stock clips for
        your content.
      </p>
      {/* The fancy input bar below */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="absolute left-0 bottom-0 w-full px-10 pb-7 flex items-center gap-3 bg-transparent"
        autoComplete="off"
        style={{ backdropFilter: "blur(1.5px)" }}
      >
        <div className="flex-1 relative">
          <textarea
            className="w-full rounded-xl border border-white/14 px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-[#b096f3]/35 transition placeholder:text-white/50 shadow-md resize-none bg-transparent"
            placeholder="Enter Your Script"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            style={{ minHeight: 44, maxHeight: 80, background: "transparent" }}
            maxLength={maxLength}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {/* Counter to the left of the button */}
          <div className="absolute bottom-2 right-14 text-xs text-white/60 select-none">
            {input.length} / {maxLength}
          </div>
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#7c5dfa] to-[#bb80ff] p-2 flex items-center justify-center shadow hover:scale-110 active:scale-95 transition"
            tabIndex={-1}
          >
            <ArrowUpCircle className="w-7 h-7 text-white" />
          </button>
        </div>
      </form>
      <div ref={messagesEnd} />
    </div>
  );
}
