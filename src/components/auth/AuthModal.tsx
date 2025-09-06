'use client'
import React, { useState } from "react";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import PremiumButton from "../ui/PremiumButton";
import { Loader2 } from "lucide-react";
import { setAuthToken } from '../../utils/auth';

export default function AuthModal({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (type: "google" | "apple") => {
    setLoading(true)
    setTimeout(() => {
      setAuthToken(`${type.toUpperCase()}_USER_TOKEN`)
      setLoading(false)
      onSuccess()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center" style={{
      background: "radial-gradient(ellipse at 55% 48%,rgba(80,60,200,0.35) 0 45%,rgba(16,14,32,0.98) 100%)",
      backdropFilter: 'blur(22px) saturate(1.8)'
    }}>
      <div className="rounded-2xl bg-gradient-to-br from-[#261E39e7] via-[#180C2Af4] to-[#0b0618e7] shadow-2xl border-2 border-purple-600/20 max-w-md w-[90vw] mx-auto py-10 px-8 relative glass-auth-anim space-y-6">

        {/* TITLE: always at top */}
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {mode === 'login' ? "Sign in to Xleos" : "Sign up for Xleos"}
        </h2>

        {/* SOCIAL BUTTONS */}
        <div className="flex flex-col space-y-3 w-full">
          <PremiumButton
            variant="glass"
            size="md"
            fullWidth
            disabled={loading}
            animations={['magnetic', 'glow']}
            onClick={() => handleSocialLogin('google')}
            icon={<img src="/google.svg" className="w-5 h-5" alt="Google" />}
            iconPosition="left"
          >{loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? "Sign in with Google" : "Sign up with Google")}</PremiumButton>

          <PremiumButton
            variant="glass"
            size="md"
            fullWidth
            disabled={loading}
            animations={['magnetic', 'glow']}
            onClick={() => handleSocialLogin('apple')}
            icon={<img src="/apple.svg" className="w-5 h-5" alt="Apple" />}
            iconPosition="left"
          >{loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? "Sign in with Apple" : "Sign up with Apple")}</PremiumButton>
        </div>

        {/* Divider */}
        <div className="flex items-center my-2 w-full">
          <div className="flex-1 h-px bg-white/15" />
          <span className="px-4 text-xs text-white/40">or with Email</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* EMAIL FORM, NO TITLE */}
        {mode === 'login' ? (
          <LoginPage
            onLogin={(email, password) => {
              setAuthToken(email)
              onSuccess();
            }}
            onSwitchToSignup={() => setMode('signup')}
            hideTitle
          />
        ) : (
          <SignupPage
            onSignup={(email, password) => {
              setAuthToken(email);
              onSuccess();
            }}
            onSwitchToLogin={() => setMode('login')}
            hideTitle
          />
        )}
      </div>
    </div>
  )
}
