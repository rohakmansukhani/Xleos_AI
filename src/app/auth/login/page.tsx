'use client'
import React, { useEffect } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import { useRouter } from 'next/navigation';
import { isAuthValid, getUserApprovalStatus } from '@/utils/auth';

export default function LoginPage() {
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    try {
      if (isAuthValid()) {
        const approvalStatus = getUserApprovalStatus();
        
        // If user is approved or approval status is null (new user), redirect to main page
        if (approvalStatus !== false) {
          router.push('/');
          return;
        }
        
        // If user is not approved, redirect to pending page
        router.push('/auth/pending');
      }
    } catch (error) {
      console.error('Login page authentication check error:', error);
    }
  }, [router]);

  const handleSuccessAction = () => {
    router.push('/');
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175]">
      <div className="absolute" style={{ top: 0, right: 0, width: "55vw", height: "100vh", zIndex: 1, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
        <img src="/cubes.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.23, userSelect: "none" }} draggable={false} />
      </div>
      
      <AuthModal onSuccessAction={handleSuccessAction} />
    </div>
  );
}