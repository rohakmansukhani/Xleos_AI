'use client'
import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Redirect all history routes to main page since history is integrated there
export default function HistoryPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return <LoadingScreen message="Redirecting to main page..." />;
}
