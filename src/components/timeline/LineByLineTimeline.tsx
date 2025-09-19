// src/components/script/LineByLineTimeline.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BackendSubmission, BackendLine } from "@/types/auth";

// Helper function to format timestamps
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface Props {
  submission: BackendSubmission;
  onSelectLine: (lineIndex: number, line: BackendLine) => void;
  onBackToInput: () => void;
  realTimeStatus?: string; // For WebSocket updates
}

export default function LineByLineTimeline({
  submission,
  onSelectLine,
  onBackToInput,
  realTimeStatus,
}: Props) {
  // Debug: Log submission data to see if bonus line exists
  useEffect(() => {
    console.log("📊 [TIMELINE DEBUG] Submission data:", {
      id: submission._id,
      status: submission.status,
      totalLines: submission.lines?.length || 0,
      lines: submission.lines?.map((line) => ({
        lineNumber: line.line_number,
        text: line.line_text?.substring(0, 50) + "...",
        videoCount: line.videos?.length || 0,
        isBonus:
          line.line_text?.includes("🌟") ||
          line.line_text?.includes("Trending"),
      })),
    });
  }, [submission]);

  const [lineStatuses, setLineStatuses] = useState<
    Array<"processing" | "ready" | "completed">
  >(submission.lines.map(() => "processing"));

  // Update statuses based on submission data and real-time updates
  useEffect(() => {
    if (submission.status === "completed") {
      // All lines are ready for feedback
      setLineStatuses(
        submission.lines.map((line) => {
          // Check if all videos in this line have feedback
          const allVideosFeedback = line.videos.every(
            (video) =>
              video.feedback.rating !== null && video.feedback.text !== null,
          );
          return allVideosFeedback ? "completed" : "ready";
        }),
      );
    } else if (submission.status === "processing") {
      // Show processing animation
      const timeouts: NodeJS.Timeout[] = [];
      submission.lines.forEach((_, idx) => {
        const t = setTimeout(() => {
          setLineStatuses((old) =>
            old.map((s, i) => (i === idx ? "processing" : s)),
          );
        }, 500 * idx);
        timeouts.push(t);
      });
      return () => timeouts.forEach(clearTimeout);
    }
  }, [submission.status, submission.lines]);

  // Update individual line status when feedback changes
  useEffect(() => {
    setLineStatuses((prev) =>
      prev.map((status, idx) => {
        const line = submission.lines[idx];
        if (!line) return status;

        // Check if all videos have feedback
        const allVideosFeedback = line.videos.every(
          (video) =>
            video.feedback.rating !== null && video.feedback.text !== null,
        );

        if (allVideosFeedback) return "completed";
        if (submission.status === "completed") return "ready";
        return "processing";
      }),
    );
  }, [submission.lines, submission.status]);

  const getLineStatusText = (line: BackendLine, status: string) => {
    switch (status) {
      case "processing":
        return realTimeStatus || "Processing...";
      case "ready":
        return `Ready – Review ${line.videos.length} AI-selected clips`;
      case "completed":
        const feedbackCount = line.videos.filter(
          (v) => v.feedback.rating !== null,
        ).length;
        const avgRating =
          line.videos
            .filter((v) => v.feedback.rating !== null)
            .reduce((sum, v) => sum + (v.feedback.rating || 0), 0) /
          feedbackCount;
        return `Feedback saved: ${avgRating.toFixed(1)}★ for ${feedbackCount} videos`;
      default:
        return "Unknown status";
    }
  };

  return (
    <div className="flex-1 px-7 pt-8 pb-6 overflow-y-auto transition-all duration-300">
      <div className="flex items-center gap-2 mb-7">
        <button
          onClick={onBackToInput}
          className="rounded-full p-2 bg-[#312b4c]/55 hover:bg-[#3b3267]/80 text-[#baaafc] font-bold text-xs shadow-sm transition mr-2 border border-[#7867ba28]"
        >
          ← New Script
        </button>
        <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#cebee1] via-[#988de6] to-[#715ed2] bg-clip-text text-transparent select-none tracking-tight">
          Timeline
        </h2>
        <span className="ml-3 text-[#d6cef7b2] text-lg">
          {(() => {
            const bonusLines = submission.lines.filter(
              (line) =>
                line.line_text?.includes("🌟") ||
                line.line_text?.includes("Trending") ||
                line.line_text?.toLowerCase().includes("context") ||
                line.search_phrase?.toLowerCase().includes("context"),
            );
            const scriptLines = submission.lines.length - bonusLines.length;
            return `${scriptLines} Lines${bonusLines.length > 0 ? ` + ${bonusLines.length} Bonus` : ""} • ${submission.status}`;
          })()}
        </span>
      </div>

      {/* Processing status indicator */}
      {realTimeStatus && submission.status === "processing" && (
        <div className="mb-6 p-4 bg-gradient-to-r from-[#7c5dfa]/20 to-[#bb80ff]/20 border border-[#7c5dfa]/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-[#7c5dfa] animate-pulse"></div>
            <span className="text-[#e5d9ff] font-medium">{realTimeStatus}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {submission.lines.map((line, idx) => {
          // Detect if this is a bonus line - only based on content markers
          const isBonus =
            line.line_text?.includes("🌟") ||
            line.line_text?.includes("Trending") ||
            line.line_text?.toLowerCase().includes("context") ||
            line.search_phrase?.toLowerCase().includes("context");

          return (
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
                  ${
                    lineStatuses[idx] === "processing"
                      ? "bg-white/4 opacity-60"
                      : lineStatuses[idx] === "completed"
                        ? "bg-gradient-to-r from-[#7f80d27a] to-[#d2cdfab4]"
                        : isBonus
                          ? "bg-gradient-to-r from-[#ff9500]/20 via-[#ffb84d]/15 to-[#ffd700]/20 border-[#ff9500]/30" // Gold gradient for bonus
                          : "bg-gradient-to-r from-[#7c5dfa]/75 via-[#beacf790]/70 to-[#aa9efd]/70"
                  }
                  cursor-pointer group hover:scale-[1.01] hover:shadow-[0_3px_32px_0_rgba(120,110,220,0.08)]
                  transition-all duration-200
                `}
                onClick={() =>
                  lineStatuses[idx] !== "processing" && onSelectLine(idx, line)
                }
                tabIndex={lineStatuses[idx] !== "processing" ? 0 : undefined}
                aria-disabled={lineStatuses[idx] === "processing"}
                style={{
                  pointerEvents:
                    lineStatuses[idx] === "processing" ? "none" : "auto",
                }}
              >
                <div className="flex flex-col flex-1">
                  <span
                    className={`text-lg font-semibold ${
                      lineStatuses[idx] === "completed"
                        ? "text-[#b48bf7]"
                        : isBonus
                          ? "text-[#ffb84d]" // Gold text for bonus
                          : "text-white/95"
                    }`}
                  >
                    {isBonus ? "🌟 " : ""}Line {line.line_number}:{" "}
                    {line.line_text}
                  </span>
                  <span className="text-xs text-[#ede7fbcc] mt-1">
                    {getLineStatusText(line, lineStatuses[idx])}
                  </span>
                  {lineStatuses[idx] !== "processing" && (
                    <span className="text-xs text-[#c4b8f5]/70 mt-0.5">
                      {isBonus ? "Context" : "Search"}: &quot;
                      {line.search_phrase}&quot;
                    </span>
                  )}
                  {/* Display video timestamps if available */}
                  {line.videos &&
                    line.videos.length > 0 &&
                    lineStatuses[idx] !== "processing" && (
                      <div className="text-xs text-white/60 mt-1">
                        {line.videos.map((video, vidIdx) => (
                          <span key={vidIdx} className="mr-3">
                            {formatTime(video.start_timestamp)} -{" "}
                            {formatTime(video.end_timestamp)}
                          </span>
                        ))}
                      </div>
                    )}
                </div>

                {/* Add bonus indicator */}
                {isBonus && (
                  <div className="mr-3">
                    <span className="text-xs bg-gradient-to-r from-[#ff9500] to-[#ffd700] text-black px-2 py-1 rounded-full font-semibold">
                      BONUS
                    </span>
                  </div>
                )}

                <div className="ml-5">
                  {lineStatuses[idx] === "processing" && (
                    <div className="h-5 w-5 rounded-full bg-[#7c5dfa]/30 animate-pulse shadow-lg" />
                  )}
                  {lineStatuses[idx] === "ready" && (
                    <div className="h-5 w-5 rounded-full bg-[#ae82fc]/50 flex items-center justify-center shadow">
                      <span className="text-white font-bold text-lg select-none">
                        →
                      </span>
                    </div>
                  )}
                  {lineStatuses[idx] === "completed" && (
                    <div className="h-5 w-5 rounded-full bg-[#a197f8] flex items-center justify-center shadow">
                      <span className="text-white font-extrabold text-lg">
                        ✓
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="pb-2" />
      <div className="flex justify-end mt-10">
        <span className="text-[#adaacd]/70 text-xs select-none">
          Xleos AI Script Timeline • {new Date().toLocaleDateString()} • ID:{" "}
          {submission._id.slice(-8)}
        </span>
      </div>
    </div>
  );
}
