'use client'
import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Redirect all chat routes to main page since chat is integrated there
export default function ChatSlugPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return <LoadingScreen message="Redirecting to main page..." />;
}
