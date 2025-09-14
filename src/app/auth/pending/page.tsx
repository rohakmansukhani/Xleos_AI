'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Clock } from 'lucide-react';

export default function PendingApprovalPage() {
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
            Thank You for Signing Up!
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg mb-8 leading-relaxed"
          >
            Your account is pending approval. We&apos;ll send you an email as soon as you have access to our AI studio.
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
              <span className="text-white/90 font-medium">Awaiting Admin Approval</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 opacity-60">
              <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-white/70 font-medium">Email Notification</span>
            </div>
          </motion.div>

          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p className="text-white/60 text-sm mb-4">
              In the meantime, follow us for updates
            </p>
            <motion.button
              onClick={() => window.open('https://xleosweb.vercel.app', '_blank')}
              className="bg-gradient-to-r from-[#7c5dfa] to-[#bb80ff] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Visit Xleos Website
            </motion.button>
          </div>
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