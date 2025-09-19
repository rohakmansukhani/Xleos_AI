"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import LoadingScreen from "@/components/ui/LoadingScreen";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkUserStatus } = useAuth();
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const processCallback = async () => {
      try {
        const status = searchParams.get("status");
        const error = searchParams.get("error");
        const code = searchParams.get("code");

        console.log("🔄 Processing callback:", { status, error, code });

        if (error) {
          console.error("❌ Auth error:", error);
          setMessage("Authentication failed. Redirecting...");
          setTimeout(() => router.push("/?error=auth_failed"), 2000);
          return;
        }

        if (status === "success") {
          console.log("✅ Auth success - checking user status...");
          setMessage("Authentication successful! Loading your account...");

          // Check cookies immediately after callback
          if (typeof window !== "undefined") {
            console.log(
              "🍪 Cookies after auth success:",
              document.cookie || "none",
            );
          }

          // Test authentication before proceeding
          try {
            console.log("🧪 Testing authentication...");
            await authApi.testAuth();
            console.log("✅ Authentication test passed");
          } catch (testError) {
            console.error("❌ Authentication test failed:", testError);
            setMessage(
              "Authentication verification failed. Please try again...",
            );
            setTimeout(
              () => router.push("/?error=auth_verification_failed"),
              3000,
            );
            return;
          }

          // Small delay to ensure cookies are properly set
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Force check user status to get the authenticated user info
          console.log("🔍 Checking user status after successful auth...");
          setMessage("Loading your profile...");

          try {
            await checkUserStatus();
            console.log("✅ User status check completed");
          } catch (statusError) {
            console.error("❌ User status check failed:", statusError);
            setMessage("Failed to load user profile. Redirecting...");
            setTimeout(() => router.push("/?error=profile_load_failed"), 2000);
            return;
          }

          console.log("🏠 Redirecting to home...");
          setMessage("Success! Redirecting to dashboard...");

          // Small delay before redirect for user feedback
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          console.warn("⚠️ Unknown callback status:", status);
          setMessage("Unknown authentication status. Redirecting...");
          setTimeout(() => router.push("/"), 2000);
        }
      } catch (error) {
        console.error("❌ Callback processing error:", error);
        setMessage("Authentication processing failed. Redirecting...");
        setTimeout(() => router.push("/?error=callback_error"), 2000);
      }
    };

    processCallback();
  }, [searchParams, router, checkUserStatus]);

  return <LoadingScreen message={message} />;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading authentication..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
