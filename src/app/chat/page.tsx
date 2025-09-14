'use client'
import React, { useState, useEffect } from "react";
import ChatNavbar from '@/components/layout/ChatNavbar';
import AuthModal from '@/components/auth/AuthModal';
import XleosMainChatCard from '@/components/main/XleosMainChatCard';
import LineByLineTimeline from '@/components/timeline/LineByLineTimeline';
import VideoSelectionPanel from "@/components/timeline/VideoSelectionPanel";
import HistoryCard from '@/components/history/HistoryCard';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { makeMockLineVideos } from '@/utils/mockData';
import WaitlistModal from '@/components/main/WaitlistModal';
import { isAuthValid, clearAuth, getUserApprovalStatus, getChatCount, incrementChatUsage, setChatCount } from '@/utils/auth';
import ChatLimitNotification from '@/components/notifications/ChatLimitNotification';
import { useRouter } from 'next/navigation';

type ScriptSession = {
  id: string;
  script: string;
  lines: string[];
  feedback: { [lineIdx: number]: { rating: number; comment: string } };
};

type VideoSuggestion = {
  id: string;
  title: string;
  thumbnail: string;
  durationSec: number;
  videoUrl: string;
};

function getUserFromStorage(): { name?: string, email?: string, image?: string } | undefined {
  const token = localStorage.getItem("xleos_token");
  if (!token) return undefined;
  if (token.includes("GOOGLE")) {
    return { name: "Google User", email: "googleuser@xleos.app", image: "/google-avatar.png" };
  }
  if (token.includes("APPLE")) {
    return { name: "Apple User", email: "appleuser@xleos.app", image: "/apple-avatar.png" };
  }
  return { name: "Xleos User", email: "user@xleos.app" };
}

export default function ChatPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<{ name?: string; email?: string; image?: string } | undefined>(undefined);

  const [activeView, setActiveView] = useState<'input' | 'timeline' | 'history'>('input');
  const [sessions, setSessions] = useState<ScriptSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ScriptSession | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [videoModalState, setVideoModalState] = useState<null | {
    lineIdx: number;
    lineText: string;
    suggestions: VideoSuggestion[];
  }>(null);

  useEffect(() => {
    if (isAuthValid()) {
      setIsAuthenticated(true);
      setAuthUser(getUserFromStorage());
    } else {
      clearAuth();
      setIsAuthenticated(false);
      setAuthUser(undefined);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setAuthUser(getUserFromStorage());
  };

  const handleLogout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setAuthUser(undefined);
  };

  const handleNewSession = () => {
    setCurrentSession(null);
    setActiveView('input');
  };

  const handleScriptSubmit = (script: string) => {
    setProcessing(true);
    setTimeout(() => {
      const lines = script.split('\n').filter(l => l.trim());
      const newSession: ScriptSession = {
        id: (Math.random() * 1e9).toFixed(0),
        script,
        lines,
        feedback: {},
      };
      setCurrentSession(newSession);
      setSessions(prev => [newSession, ...prev]);
      setProcessing(false);
      setActiveView('timeline');
    }, 1200);
  };

  const handleOpenVideoModal = (lineIdx: number) => {
    if (!currentSession) return;
    setVideoModalState({
      lineIdx,
      lineText: currentSession.lines[lineIdx],
      suggestions: makeMockLineVideos(currentSession.lines[lineIdx]),
    });
  };

  const handleVideoFeedback = (rating: number, comment: string) => {
    if (!currentSession || videoModalState === null) return;
    const updatedSession = {
      ...currentSession,
      feedback: {
        ...currentSession.feedback,
        [videoModalState.lineIdx]: { rating, comment },
      },
    };
    setCurrentSession(updatedSession);
    setSessions(prev =>
      prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
    );
    setVideoModalState(null);
  };

  const handleOpenHistory = () => setActiveView('history');
  const handleSelectHistoricalSession = (sessionId: string) => {
    const found = sessions.find(s => s.id === sessionId);
    if (found) {
      setCurrentSession(found);
      setActiveView('timeline');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175]">
      <div className="absolute" style={{ top: 0, right: 0, width: "55vw", height: "100vh", zIndex: 1, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
        <img src="/cubes.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.23, userSelect: "none" }} draggable={false} />
      </div>

      <ChatNavbar
        onBotClick={handleNewSession}
        onHistoryClick={handleOpenHistory}
        onWaitlistClick={() => setShowWaitlistModal(true)}
        user={isAuthenticated ? authUser : undefined}
        onSignOut={handleLogout}
        onSettings={() => {}}
      />

      {!isAuthenticated && <AuthModal onSuccessAction={handleLogin} />}

      <main className="flex min-h-[90vh] w-full items-center justify-center pt-36 pb-16 px-0 relative z-10">
        <div className="w-full max-w-7xl flex flex-col rounded-3xl bg-white/4 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden relative min-h-[650px] mx-4 sm:mx-8 lg:mx-auto">
          <img src="/elements/flower.png" alt="" className="absolute left-8 bottom-20 w-32 opacity-15 pointer-events-none blur-[3px]" />

          {(activeView === 'input' && !processing) && (
            <XleosMainChatCard onSubmitScript={handleScriptSubmit} />
          )}

          {processing && (
            <LoadingScreen message="Generating scenes from your script..." />
          )}

          {(activeView === 'timeline' && currentSession) && (
            <LineByLineTimeline
              session={currentSession}
              onSelectLine={handleOpenVideoModal}
              onBackToInput={handleNewSession}
            />
          )}

          {(activeView === 'history') && (
            <HistoryCard
              sessions={sessions}
              onSelectSession={handleSelectHistoricalSession}
              onBack={() => setActiveView(currentSession ? 'timeline' : 'input')}
            />
          )}
        </div>
      </main>

      {videoModalState !== null && (
        <VideoSelectionPanel
          line={{
            id: `${videoModalState.lineIdx}`,
            text: videoModalState.lineText,
            videos: videoModalState.suggestions.map((suggestion, index) => ({
              id: suggestion.id,
              youtube_video_id: suggestion.id,
              youtube_url: suggestion.videoUrl,
              title: suggestion.title,
              thumbnail: suggestion.thumbnail,
              duration: suggestion.durationSec,
              ranking_position: index + 1,
              video_intelligence_score: 0,
              average_rating: 0,
              total_ratings: 0,
            }))
          }}
          onCompleteAction={() => setVideoModalState(null)}
          onCloseAction={() => setVideoModalState(null)}
        />
      )}

      <WaitlistModal isOpen={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />
    </div>
  );
}