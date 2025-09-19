"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page is deprecated - all chat functionality has been moved to the main page (/)
// Redirect users to the main page for the chat interface
export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175] flex items-center justify-center">
      <div className="text-white text-center">
        <p>Redirecting to main chat interface...</p>
      </div>
    </div>
  );
}
