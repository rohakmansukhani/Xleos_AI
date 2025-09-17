'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Redirect to main page since auth is handled there
export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main page which handles auth
    router.push('/?auth=signup');
  }, [router]);

  return <LoadingScreen message="Redirecting to signup..." />;
}
