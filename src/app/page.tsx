"use client";
import React, { useState, useEffect, useRef } from "react";
import ChatNavbar from "../components/layout/ChatNavbar";
import XleosMainChatCard from "../components/main/XleosMainChatCard";
import LineByLineTimeline from "../components/timeline/LineByLineTimeline";
import VideoSelectionPanel from "../components/timeline/VideoSelectionPanel";
import HistoryCard from "../components/history/HistoryCard";
import LoadingScreen from "../components/ui/LoadingScreen";
import WaitlistModal from "../components/main/WaitlistModal";
import AuthModal from "../components/auth/AuthModal";
import { useAuth } from "../contexts/AuthContext";
import ChatLimitNotification from "../components/notifications/ChatLimitNotification";
import { useRouter } from "next/navigation";
import { chatApi } from "../lib/api";
import { BackendSubmission, BackendLine } from "../types/auth";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  // Use auth context
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    approvalStatus,
    chatUsage,
    logout,
    incrementChatUsage,
    checkUserStatus,
  } = useAuth();

  const [realTimeStatus, setRealTimeStatus] = useState<string>("");
  const [activeView, setActiveView] = useState<
    "input" | "timeline" | "history"
  >("input");
  const [currentSubmission, setCurrentSubmission] =
    useState<BackendSubmission | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [videoModalState, setVideoModalState] = useState<null | {
    lineIndex: number;
    line: BackendLine;
  }>(null);

  // Chat limit and pending approval notifications
  const [showChatLimitModal, setShowChatLimitModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Polling state
  const pollingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeout.current) clearTimeout(pollingTimeout.current);
    };
  }, []);

  // Handle authentication status
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode("signup");
      setShowPendingModal(false);
      return;
    }

    setShowAuthModal(false);

    if (approvalStatus === "pending") {
      setShowPendingModal(true);
      return;
    } else {
      setShowPendingModal(false);
    }
  }, [isAuthenticated, approvalStatus, authLoading]);

  // Polling function
  const pollForResults = async (submissionId: string, attempt = 0) => {
    try {
      setRealTimeStatus("Checking for results...");
      const resultsData = await chatApi.getResults(submissionId);

      if (!resultsData || resultsData.error) {
        // Results not ready, poll again after delay
        if (attempt < 30) {
          // Limit attempts to avoid infinite polling
          pollingTimeout.current = setTimeout(() => {
            pollForResults(submissionId, attempt + 1);
          }, 2000); // 2 seconds debounce
        } else {
          setProcessing(false);
          setRealTimeStatus("Results not available. Please try again later.");
        }
        return;
      }

      // Check the status field from API response
      if (resultsData.status === "processing") {
        // Keep polling until status is 'completed'
        if (attempt < 30) {
          pollingTimeout.current = setTimeout(() => {
            pollForResults(submissionId, attempt + 1);
          }, 2000);
        } else {
          setProcessing(false);
          setRealTimeStatus("Results not available. Please try again later.");
        }
        return;
      }

      // If status is 'completed', update state and show results
      setProcessing(false);
      setRealTimeStatus("");
      setCurrentSubmission({
        ...resultsData,
        status: "completed",
        lines: resultsData.lines || [],
      });
      setActiveView("timeline");
    } catch (error: unknown) {
      setProcessing(false);
      const errorMessage =
        typeof error === "object" && error && "message" in error
          ? (error as { message?: string }).message ||
            "Failed to fetch results."
          : "Failed to fetch results.";
      setRealTimeStatus(errorMessage);
      console.error("Polling error:", error);
    }
  };

  // Fetch submission results from backend
  const fetchSubmissionResults = async (submissionId: string) => {
    try {
      console.log("🔍 Fetching results for submission:", submissionId);

      const resultsData = await chatApi.getResults(submissionId);

      if (!resultsData || resultsData.error) {
        console.log("❌ Failed to fetch results:", resultsData?.error);
        return null;
      }

      console.log("✅ Results fetched:", resultsData);

      // Update current submission with complete results
      const updatedSubmission = {
        ...resultsData,
        status: "completed",
        lines: resultsData.lines || [],
      };

      setCurrentSubmission(updatedSubmission);
      console.log(
        "✅ Submission updated with results, lines count:",
        resultsData.lines?.length || 0,
      );

      return resultsData;
    } catch (error) {
      console.error("Failed to fetch submission results:", error);
      return null;
    }
  };

  const handleNewSession = () => {
    if (approvalStatus === "pending") {
      setShowPendingModal(true);
      return;
    }

    // Clear any polling timeouts
    if (pollingTimeout.current) {
      clearTimeout(pollingTimeout.current);
    }

    setCurrentSubmission(null);
    setActiveView("input");
    setRealTimeStatus("");
    setProcessing(false);
  };

  const handleScriptSubmit = async (script: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (approvalStatus === "pending") {
      setShowPendingModal(true);
      return;
    }

    if (approvalStatus !== "approved") {
      return;
    }

    if (script.length > 1000) {
      return;
    }

    if (chatUsage.remaining <= 0 && !user?.is_admin) {
      setShowChatLimitModal(true);
      return;
    }

    try {
      setProcessing(true);
      setRealTimeStatus("Submitting script...");

      if (
        chatUsage.used === 0 ||
        (chatUsage.remaining <= 2 && !user?.is_admin)
      ) {
        setShowChatLimitModal(true);
      }

      const submissionData = await chatApi.submitScript(script);

      if (
        !submissionData ||
        submissionData.error ||
        !submissionData.submission_id
      ) {
        setProcessing(false);
        setRealTimeStatus(submissionData?.message || "Failed to submit script");
        return;
      }

      if (!user?.is_admin) {
        await incrementChatUsage();
      }

      const newSubmission: BackendSubmission = {
        _id: submissionData.submission_id,
        user_id: user?.email || "",
        submission_timestamp: new Date().toISOString(),
        script_text: script,
        status: "processing",
        message: "Processing started",
        lines: [],
      };

      setCurrentSubmission(newSubmission);
      setActiveView("timeline");

      // Start polling for results
      pollForResults(submissionData.submission_id);
    } catch (error: unknown) {
      setProcessing(false);
      const errorMessage =
        typeof error === "object" && error && "message" in error
          ? (error as { message?: string }).message
          : "Failed to submit script";
      setRealTimeStatus(errorMessage || "Failed to submit script");
      console.error("Script submission failed:", error);
    }
  };

  const handleOpenVideoModal = (lineIndex: number, line: BackendLine) => {
    setVideoModalState({ lineIndex, line });
  };

  const handleVideoFeedback = async (feedback: {
    [videoIndex: number]: { rating: number; comment: string };
  }) => {
    if (!currentSubmission || videoModalState === null) return;

    try {
      const updatedSubmission = { ...currentSubmission };
      const line = updatedSubmission.lines[videoModalState.lineIndex];

      if (line) {
        Object.entries(feedback).forEach(([videoIndex, fb]) => {
          const vIndex = parseInt(videoIndex);
          if (line.videos[vIndex]) {
            line.videos[vIndex].feedback = {
              rating: fb.rating,
              text: fb.comment,
            };
          }
        });
      }

      setCurrentSubmission(updatedSubmission);
    } catch (error) {
      console.error("Failed to handle feedback:", error);
    } finally {
      setVideoModalState(null);
    }
  };

  const handleOpenHistory = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (approvalStatus === "pending") {
      setShowPendingModal(true);
      return;
    }

    setActiveView("history");
  };

  const handleSelectHistoricalSession = async (
    submission: BackendSubmission,
  ) => {
    console.log(
      "📁 [HISTORY] Selected submission:",
      submission._id,
      "Status:",
      submission.status,
    );

    setCurrentSubmission(submission);
    setActiveView("timeline");

    if (
      submission.status === "completed" &&
      (!submission.lines || submission.lines.length === 0)
    ) {
      console.log(
        "🔄 [HISTORY] Fetching fresh results for completed submission",
      );
      await fetchSubmissionResults(submission._id);
    }
  };

  // Debugging: log key state transitions
  useEffect(() => {
    console.log("📊 [STATE DEBUG]", {
      activeView,
      processing,
      currentSubmission: currentSubmission
        ? {
            id: currentSubmission._id,
            status: currentSubmission.status,
            linesCount: currentSubmission.lines?.length || 0,
          }
        : null,
      realTimeStatus,
    });
  }, [activeView, processing, currentSubmission, realTimeStatus]);

  const handleCloseAuth = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      await checkUserStatus();
      if (approvalStatus === "approved") {
        setShowPendingModal(false);
      }
    } catch (error) {
      console.error("Failed to refresh status:", error);
    }
  };

  // Show loading screen while auth is initializing
  if (authLoading) {
    return <LoadingScreen message="Initializing..." />;
  }

  // Block all content before authentication
  if (!isAuthenticated) {
    return <AuthModal mode={authMode} onClose={handleCloseAuth} />;
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175]">
      {/* Background */}
      <div
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: "55vw",
          height: "100vh",
          zIndex: 1,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        <Image
          src="/cubes.svg"
          alt=""
          width={1000}
          height={1000}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: 0.23,
            userSelect: "none",
          }}
          draggable={false}
          priority
        />
      </div>

      <ChatNavbar
        onBotClick={handleNewSession}
        onHistoryClick={handleOpenHistory}
        onWaitlistClick={() => setShowWaitlistModal(true)}
      />

      <main className="flex min-h-[90vh] w-full items-center justify-center pt-36 pb-16 px-0 relative z-10">
        <div className="w-full max-w-7xl flex flex-col rounded-3xl bg-white/4 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden relative min-h-[650px] mx-4 sm:mx-8 lg:mx-auto">
          <Image
            src="/elements/flower.png"
            alt=""
            width={128}
            height={128}
            className="absolute left-8 bottom-20 w-32 opacity-15 pointer-events-none blur-[3px]"
            priority
          />

          {/* Content Sections - Updated Logic */}
          {activeView === "input" && !processing && (
            <XleosMainChatCard
              onSubmitScript={handleScriptSubmit}
              maxLength={1000}
            />
          )}

          {/* Show loading only if processing AND no results available yet */}
          {processing &&
            (!currentSubmission?.lines ||
              currentSubmission.lines.length === 0) && (
              <LoadingScreen
                message={realTimeStatus || "Processing your script..."}
              />
            )}

          {/* Show timeline if we have results OR if submission is completed */}
          {activeView === "timeline" &&
            currentSubmission &&
            (currentSubmission.lines?.length > 0 ||
              currentSubmission.status === "completed") && (
              <LineByLineTimeline
                submission={currentSubmission}
                onSelectLine={handleOpenVideoModal}
                onBackToInput={handleNewSession}
                realTimeStatus={realTimeStatus}
              />
            )}

          {activeView === "history" && (
            <HistoryCard
              onSelectSession={handleSelectHistoricalSession}
              onBack={() =>
                setActiveView(currentSubmission ? "timeline" : "input")
              }
            />
          )}
        </div>
      </main>

      {/* Video Selection Panel */}
      {videoModalState !== null && currentSubmission && (
        <VideoSelectionPanel
          line={videoModalState.line}
          submissionId={currentSubmission._id}
          lineIndex={videoModalState.lineIndex}
          onCompleteAction={handleVideoFeedback}
          onCloseAction={() => setVideoModalState(null)}
        />
      )}

      {/* Auth Modal (should never show if authenticated) */}
      {showAuthModal && !isAuthenticated && (
        <AuthModal mode={authMode} onClose={handleCloseAuth} />
      )}

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
      />

      {/* Chat Limit & Pending Approval Notification */}
      <ChatLimitNotification
        isOpen={showChatLimitModal || showPendingModal}
        onClose={() => {
          setShowChatLimitModal(false);
          // Only allow closing pending modal if user is approved
          if (approvalStatus === "approved") {
            setShowPendingModal(false);
          }
        }}
        chatsRemaining={chatUsage.remaining}
        totalChats={chatUsage.total}
        onOpenWaitlist={() => setShowWaitlistModal(true)}
        isPending={approvalStatus === "pending"}
        onRefreshStatus={handleRefreshStatus}
        userEmail={user?.email}
      />
    </div>
  );
}
