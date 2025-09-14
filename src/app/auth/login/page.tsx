'use client'
import React from 'react';
import AuthModal from '@/components/auth/AuthModal';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccessAction = () => {
    router.push('/');
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175]">
      <AuthModal onSuccessAction={handleSuccessAction} />
    </div>
  );
}