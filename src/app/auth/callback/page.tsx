'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { setAuthToken } from '@/utils/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          setError(`Authentication error: ${error}`);
          setTimeout(() => router.push('/auth/login'), 3000);
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setTimeout(() => router.push('/auth/login'), 3000);
          return;
        }

        // Exchange code for token with your backend
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const { token, user } = await response.json();
        
        // Store token and redirect
        setAuthToken(token);
        
        // Check if user is approved
        if (user.isApproved === false) {
          router.push('/auth/pending');
        } else {
          router.push('/');
        }
        
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl font-semibold mb-4">{error}</div>
          <div className="text-white/60">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175]">
      <LoadingScreen message="Completing authentication..." />
    </div>
  );
}