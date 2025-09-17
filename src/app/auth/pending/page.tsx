'use client'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { toast } from 'react-toastify';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, approvalStatus, checkUserStatus } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirect unauthenticated users to home
      router.push('/');
      return;
    }

    if (approvalStatus === 'approved') {
      // Redirect approved users to home
      toast.success('Your account has been approved!');
      router.push('/');
      return;
    }
  }, [isAuthenticated, approvalStatus, isLoading, router]);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await checkUserStatus();
      toast.info('Status refreshed');
    } catch (error) {
      toast.error('Failed to refresh status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Show loading while auth initializes
  if (isLoading) {
    return <LoadingScreen message="Checking approval status..." />;
  }

  // Show loading if user is already approved (redirecting)
  if (approvalStatus === 'approved') {
    return <LoadingScreen message="Account approved! Redirecting..." />;
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175] flex items-center justify-center">
      {/* Background cubes */}
      <div className="absolute" style={{ top: 0, right: 0, width: "55vw", height: "100vh", zIndex: 1, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
        <img src="/cubes.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.23, userSelect: "none" }} draggable={false} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full mx-4"
      >
        {/* Back button */}
        <motion.button
          onClick={handleBackToHome}
          className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </motion.button>

        {/* Main card */}
        <div className="rounded-3xl bg-white/4 border border-white/10 backdrop-blur-xl shadow-xl p-10 text-center relative overflow-hidden">
          {/* Decorative flower */}
          <img src="/elements/flower.png" alt="" className="absolute right-4 top-4 w-16 opacity-10 pointer-events-none blur-[2px]" />
          
          {/* Success icon with animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7c5dfa]/20 to-[#bb80ff]/20 flex items-center justify-center border border-[#7c5dfa]/30">
                <CheckCircle className="w-10 h-10 text-[#bb80ff]" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-[#7c5dfa]/10 blur-xl"></div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent"
          >
            Welcome to Xleos!
          </motion.h1>

          {/* User info */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-white/90 font-medium">{user.name}</div>
              <div className="text-white/60 text-sm">{user.email}</div>
            </motion.div>
          )}

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg mb-8 leading-relaxed"
          >
            Your account is pending admin approval. You&apos;ll receive access to our AI studio once approved.
          </motion.p>

          {/* Status indicators */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-8"
          >
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-white/90 font-medium">Account Created</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-white/90 font-medium">Awaiting Admin Approval</div>
                <div className="text-white/60 text-sm">Current status: {approvalStatus}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 opacity-60">
              <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-white/70 font-medium">Email Notification (when approved)</span>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {/* Refresh status button */}
            <button
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Checking...' : 'Check Status'}
            </button>

            {/* Website link */}
            <button
              onClick={() => window.open('https://xleosweb.vercel.app', '_blank')}
              className="w-full bg-gradient-to-r from-[#7c5dfa] to-[#bb80ff] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Visit Xleos Website
            </button>
          </motion.div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/40 text-sm mt-6"
        >
          Expected approval time: 24-48 hours
        </motion.p>
      </motion.div>
    </div>
  );
}
