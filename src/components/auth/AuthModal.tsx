'use client'
import React, { useState } from "react";
import LoginPage from "./LoginPage";
import PremiumButton from "../ui/PremiumButton";
import { Loader2 } from "lucide-react";
import { setAuthToken } from '../../utils/auth';


export default function AuthModal({ onSuccessAction }: { onSuccessAction: () => void }) {
  // Only login mode is supported now
  const [loading, setLoading] = useState(false);

  // Handler for Google login using Auth0
  const loginWithGoogle = () => {
    setLoading(true);
    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/auth/callback`
    );
    const url = `https://${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid profile email&connection=google-oauth2`;
    window.location.href = url;
  };

  // Handler for Apple login using Auth0
  const loginWithApple = () => {
    setLoading(true);
    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/auth/callback`
    );
    const url = `https://${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid profile email&connection=apple`;
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center" style={{
      background: "radial-gradient(ellipse at 55% 48%,rgba(80,60,200,0.35) 0 45%,rgba(16,14,32,0.98) 100%)",
      backdropFilter: 'blur(22px) saturate(1.8)'
    }}>
      <div className="rounded-2xl bg-gradient-to-br from-[#261E39e7] via-[#180C2Af4] to-[#0b0618e7] shadow-2xl border-2 border-purple-600/20 max-w-md w-[90vw] mx-auto py-10 px-8 relative glass-auth-anim space-y-6">

        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Sign in to Xleos
        </h2>

        <div className="flex flex-col space-y-3 w-full">
          <PremiumButton
            variant="glass"
            size="md"
            fullWidth
            disabled={loading}
            animations={['magnetic', 'glow']}
            onClick={loginWithGoogle}
            icon={<img src="/google.svg" className="w-5 h-5" alt="Google" />}
            iconPosition="left"
          >{loading ? <Loader2 className="animate-spin" /> : "Sign in with Google"}</PremiumButton>

          <PremiumButton
            variant="glass"
            size="md"
            fullWidth
            disabled={loading}
            animations={['magnetic', 'glow']}
            onClick={loginWithApple}
            icon={<img src="/apple.svg" className="w-5 h-5" alt="Apple" />}
            iconPosition="left"
          >{loading ? <Loader2 className="animate-spin" /> : "Sign in with Apple"}</PremiumButton>
        </div>

        <div className="flex items-center my-2 w-full">
          <div className="flex-1 h-px bg-white/15" />
          <span className="px-4 text-xs text-white/40">or with Email</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        <LoginPage
          onLogin={(email, password) => {
            setAuthToken(email)
            onSuccessAction();
          }}
          hideTitle
        />
      </div>
    </div>
  )
}
