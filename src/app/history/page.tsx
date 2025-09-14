'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import ChatNavbar from '@/components/layout/ChatNavbar';
import AuthModal from '@/components/auth/AuthModal';
import HistoryCard from '@/components/history/HistoryCard';
import WaitlistModal from '@/components/main/WaitlistModal';
import { isAuthValid, clearAuth } from '@/utils/auth';

type ScriptSession = {
  id: string;
  script: string;
  lines: string[];
  feedback: { [lineIdx: number]: { rating: number; comment: string } };
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

export default function HistoryPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<{ name?: string; email?: string; image?: string } | undefined>(undefined);
  const [sessions, setSessions] = useState<ScriptSession[]>([]);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  useEffect(() => {
    if (isAuthValid()) {
      setIsAuthenticated(true);
      setAuthUser(getUserFromStorage());
      // Load user's sessions from backend when connected
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
    router.push('/chat');
  };

  const handleSelectHistoricalSession = (sessionId: string) => {
    router.push(`/chat/${sessionId}`);
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175]">
      <div className="absolute" style={{ top: 0, right: 0, width: "55vw", height: "100vh", zIndex: 1, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
        <img src="/cubes.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.23, userSelect: "none" }} draggable={false} />
      </div>

      <ChatNavbar
        onBotClick={handleNewSession}
        onHistoryClick={() => {}}
        onWaitlistClick={() => setShowWaitlistModal(true)}
        user={isAuthenticated ? authUser : undefined}
        onSignOut={handleLogout}
        onSettings={() => {}}
      />

      {!isAuthenticated && <AuthModal onSuccessAction={handleLogin} />}

      <main className="flex min-h-[90vh] w-full items-center justify-center pt-36 pb-16 px-0 relative z-10">
        <div className="w-full max-w-7xl flex flex-col rounded-3xl bg-white/4 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden relative min-h-[650px] mx-4 sm:mx-8 lg:mx-auto">
          <img src="/elements/flower.png" alt="" className="absolute left-8 bottom-20 w-32 opacity-15 pointer-events-none blur-[3px]" />

          <HistoryCard
            sessions={sessions}
            onSelectSession={handleSelectHistoricalSession}
            onBack={handleBack}
          />
        </div>
      </main>

      <WaitlistModal isOpen={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />
    </div>
  );
}