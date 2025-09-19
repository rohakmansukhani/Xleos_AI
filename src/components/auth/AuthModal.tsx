"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Add missing import
import PremiumButton from "../ui/PremiumButton";
import { Loader2, Mail } from "lucide-react";
import { authApi } from "@/lib/api";
import { AuthUrls } from "@/types/auth";

// Simple icon components to avoid react-icons dependency
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

interface AuthModalProps {
  mode?: "login" | "signup";
  onClose?: () => void;
}

export default function AuthModal({ mode = "login", onClose }: AuthModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [authUrls, setAuthUrls] = useState<AuthUrls>({
    google_login_url: "",
    apple_login_url: "",
    email_login_url: "",
    google_signup_url: "",
    apple_signup_url: "",
    email_signup_url: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthUrls();
  }, [mode]);

  const fetchAuthUrls = async () => {
    try {
      setError(null);
      console.log("🔄 Fetching auth URLs...");

      const data =
        mode === "login"
          ? await authApi.getLoginUrls()
          : await authApi.getSignupUrls();

      console.log("✅ Auth URLs received:", data);

      // Backend returns auth0 URL for all providers
      const authUrl =
        data.auth0 || data.google || data.apple || data.email || "";

      setAuthUrls({
        google_login_url: authUrl,
        apple_login_url: authUrl,
        email_login_url: authUrl,
        google_signup_url: authUrl,
        apple_signup_url: authUrl,
        email_signup_url: authUrl,
      });
    } catch (error) {
      console.error("❌ Failed to fetch auth URLs:", error);
      setError("Failed to load authentication options. Please try again.");
    }
  };

  const handleAuthAction = async (
    url: string | undefined,
    provider: string,
  ) => {
    if (!url) {
      console.error("No URL available for", provider);
      setError(
        `${provider} authentication is not available. Please try another method.`,
      );
      return;
    }

    console.log(`🔗 Redirecting to ${provider} URL:`, url);
    setLoading(provider);
    setError(null);

    // Add a small delay to show loading state
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  };

  const isLoginMode = mode === "login";
  const currentUrls = isLoginMode
    ? {
        google: authUrls.google_login_url,
        apple: authUrls.apple_login_url,
        email: authUrls.email_login_url,
      }
    : {
        google: authUrls.google_signup_url,
        apple: authUrls.apple_signup_url,
        email: authUrls.email_signup_url,
      };

  const handleClose = (
    e?: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
  ) => {
    if (e) e.preventDefault();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at 55% 48%,rgba(80,60,200,0.35) 0 45%,rgba(16,14,32,0.98) 100%)",
        backdropFilter: "blur(22px) saturate(1.8)",
      }}
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="rounded-2xl bg-gradient-to-br from-[#261E39e7] via-[#180C2Af4] to-[#0b0618e7] shadow-2xl border-2 border-purple-600/20 max-w-md w-full mx-auto py-10 px-8 relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/60 hover:text-white text-xl"
          >
            ×
          </button>
        )}

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLoginMode ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-white/70 text-sm">
            {isLoginMode
              ? "Sign in to access your XLEOS dashboard"
              : "Join XLEOS to start creating amazing videos"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Auth Buttons */}
        <div className="flex flex-col space-y-3 w-full">
          {/* Google */}
          <PremiumButton
            variant="glass"
            size="md"
            fullWidth
            disabled={loading !== null}
            animations={["magnetic", "glow"]}
            onClick={() => handleAuthAction(currentUrls.google, "google")}
            icon={
              loading === "google" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <GoogleIcon />
              )
            }
            iconPosition="left"
          >
            {loading === "google"
              ? "Redirecting to Google..."
              : `${isLoginMode ? "Sign in" : "Sign up"} with Google`}
          </PremiumButton>

          {/* Apple */}
          <PremiumButton
            variant="glass"
            size="md"
            fullWidth
            disabled={loading !== null}
            animations={["magnetic", "glow"]}
            onClick={() => handleAuthAction(currentUrls.apple, "apple")}
            icon={
              loading === "apple" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <AppleIcon />
              )
            }
            iconPosition="left"
          >
            {loading === "apple"
              ? "Redirecting to Apple..."
              : `${isLoginMode ? "Sign in" : "Sign up"} with Apple`}
          </PremiumButton>
        </div>

        {/* Divider */}
        <div className="flex items-center my-4 w-full">
          <div className="flex-1 h-px bg-white/15" />
          <span className="px-4 text-xs text-white/40">or with Email</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Email */}
        <PremiumButton
          variant="glass"
          size="md"
          fullWidth
          disabled={loading !== null}
          animations={["magnetic", "glow"]}
          onClick={() => handleAuthAction(currentUrls.email, "email")}
          icon={
            loading === "email" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mail className="w-5 h-5" />
            )
          }
          iconPosition="left"
        >
          {loading === "email"
            ? "Redirecting to Auth0..."
            : `${isLoginMode ? "Sign in" : "Sign up"} with Email`}
        </PremiumButton>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-white/50 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}
