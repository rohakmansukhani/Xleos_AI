"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  AlertTriangle,
  PartyPopper,
  ExternalLink,
  Clock,
  Shield,
  RefreshCw,
} from "lucide-react";

interface ChatLimitNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  chatsRemaining: number;
  totalChats: number;
  onOpenWaitlist?: () => void;
  // New props for pending approval
  isPending?: boolean;
  onRefreshStatus?: () => void;
  userEmail?: string;
}

export default function ChatLimitNotification({
  isOpen,
  onClose,
  chatsRemaining,
  totalChats,
  onOpenWaitlist,
  isPending = false,
  onRefreshStatus,
  userEmail,
}: ChatLimitNotificationProps) {
  const isFirstTime = chatsRemaining === totalChats;
  const isLastChat = chatsRemaining === 1;
  const isExhausted = chatsRemaining === 0;

  const getNotificationContent = () => {
    // Priority: Pending approval blocks everything
    if (isPending) {
      return {
        icon: <Clock className="w-8 h-8 text-[#f59e0b]" />,
        title: "Account Pending Approval",
        message: `Hi ${userEmail?.split("@")[0] || "there"}! Your account is currently pending admin approval. You'll receive access to our AI studio once approved. This typically takes 24-48 hours.`,
        actionText: "Check Status",
        secondaryActionText: "Visit Website",
        bgGradient: "from-[#f59e0b]/20 to-[#fbbf24]/20",
        iconBg: "bg-[#f59e0b]/20",
        buttonGradient: "from-[#f59e0b] to-[#fbbf24]",
        isPending: true,
        showProgress: false,
        canDismiss: false, // Can't dismiss pending approval
      };
    }

    if (isExhausted) {
      return {
        icon: <PartyPopper className="w-8 h-8 text-[#bb80ff]" />,
        title: "Thank You for Using Xleos!",
        message:
          "You've used all your available chats. Stay tuned and join our waitlist for expanded access to the full AI studio experience.",
        actionText: "Join Waitlist",
        secondaryActionText: "Visit Website",
        bgGradient: "from-[#7c5dfa]/20 to-[#bb80ff]/20",
        iconBg: "bg-[#7c5dfa]/20",
        buttonGradient: "from-[#7c5dfa] to-[#bb80ff]",
        isPending: false,
        showProgress: false,
        canDismiss: true,
      };
    }

    if (isFirstTime) {
      return {
        icon: <MessageCircle className="w-8 h-8 text-[#60a5fa]" />,
        title: "Welcome to Xleos AI!",
        message: `You have ${chatsRemaining} chats available due to limited resources. Make them count with your best creative ideas!`,
        actionText: "Got it!",
        bgGradient: "from-[#3b82f6]/20 to-[#60a5fa]/20",
        iconBg: "bg-[#3b82f6]/20",
        buttonGradient: "from-[#3b82f6] to-[#60a5fa]",
        isPending: false,
        showProgress: true,
        canDismiss: true,
      };
    }

    if (isLastChat) {
      return {
        icon: <AlertTriangle className="w-8 h-8 text-[#f59e0b]" />,
        title: "Final Chat Remaining!",
        message:
          "This is your last available chat. After this, consider joining our waitlist for more access.",
        actionText: "Understood",
        bgGradient: "from-[#f59e0b]/20 to-[#fbbf24]/20",
        iconBg: "bg-[#f59e0b]/20",
        buttonGradient: "from-[#f59e0b] to-[#fbbf24]",
        isPending: false,
        showProgress: true,
        canDismiss: true,
      };
    }

    return {
      icon: <MessageCircle className="w-8 h-8 text-[#10b981]" />,
      title: "Chat Update",
      message: `You have ${chatsRemaining} chat${chatsRemaining === 1 ? "" : "s"} remaining out of ${totalChats}.`,
      actionText: "Continue",
      bgGradient: "from-[#10b981]/20 to-[#34d399]/20",
      iconBg: "bg-[#10b981]/20",
      buttonGradient: "from-[#10b981] to-[#34d399]",
      isPending: false,
      showProgress: true,
      canDismiss: true,
    };
  };

  const content = getNotificationContent();

  const handlePrimaryAction = () => {
    if (isPending && onRefreshStatus) {
      onRefreshStatus();
    } else if (isExhausted && onOpenWaitlist) {
      onOpenWaitlist();
    } else {
      onClose();
    }
  };

  const handleSecondaryAction = () => {
    window.open("https://xleosweb.vercel.app", "_blank");
  };

  // For pending approval or exhausted state, show blocking modal
  if (isPending || isExhausted) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{
              background:
                "radial-gradient(ellipse at 55% 48%,rgba(80,60,200,0.35) 0 45%,rgba(16,14,32,0.98) 100%)",
              backdropFilter: "blur(22px) saturate(1.8)",
            }}
            onClick={content.canDismiss ? onClose : undefined}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`rounded-2xl bg-gradient-to-br ${content.bgGradient} backdrop-blur-xl border border-white/10 shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative elements */}
              <img
                src="/elements/flower.png"
                alt=""
                className="absolute right-4 top-4 w-12 opacity-10 pointer-events-none blur-[2px]"
              />

              {/* Icon with pending animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mb-6 flex justify-center"
              >
                <div
                  className={`w-16 h-16 rounded-full ${content.iconBg} flex items-center justify-center border border-white/20`}
                >
                  {isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Clock className="w-8 h-8 text-[#f59e0b]" />
                    </motion.div>
                  ) : (
                    content.icon
                  )}
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white mb-4"
              >
                {content.title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-base leading-relaxed mb-8"
              >
                {content.message}
              </motion.p>

              {/* Status indicators for pending approval */}
              {isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6 space-y-3"
                >
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-white/90 font-medium text-sm">
                      Account Created
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                    <motion.div
                      className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Clock className="w-3 h-3 text-yellow-400" />
                    </motion.div>
                    <span className="text-white/90 font-medium text-sm">
                      Awaiting Admin Approval
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 opacity-60">
                    <div className="w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-white/70 font-medium text-sm">
                      AI Studio Access
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Progress indicator for non-pending states */}
              {!isPending && content.showProgress && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60 text-sm">Chats Used</span>
                    <span className="text-white font-medium text-sm">
                      {totalChats - chatsRemaining}/{totalChats}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((totalChats - chatsRemaining) / totalChats) * 100}%`,
                      }}
                      transition={{
                        delay: 0.5,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className={`h-full bg-gradient-to-r ${content.buttonGradient} rounded-full`}
                    />
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                {/* Primary action */}
                <motion.button
                  onClick={handlePrimaryAction}
                  className={`w-full bg-gradient-to-r ${content.buttonGradient} text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isPending && <RefreshCw className="w-4 h-4" />}
                  {content.actionText}
                </motion.button>

                {/* Secondary action */}
                {content.secondaryActionText && (
                  <motion.button
                    onClick={handleSecondaryAction}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {content.secondaryActionText}
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                )}

                {/* Dismissal option only for non-pending */}
                {!isPending && !isFirstTime && (
                  <motion.button
                    onClick={onClose}
                    className="w-full text-white/60 hover:text-white/80 font-medium py-2 transition-colors duration-200"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Maybe Later
                  </motion.button>
                )}
              </motion.div>

              {/* Expected approval time for pending */}
              {isPending && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center text-white/40 text-xs mt-6"
                >
                  Expected approval time: 24-48 hours
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // For non-blocking states (regular chat updates), show toast notification
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, y: -20 }}
          className="fixed top-6 right-6 z-[200] max-w-sm"
        >
          <motion.div
            className={`rounded-xl bg-gradient-to-br ${content.bgGradient} backdrop-blur-xl border border-white/10 shadow-lg p-4 relative overflow-hidden`}
            whileHover={{ scale: 1.02 }}
          >
            {/* Decorative elements */}
            <img
              src="/elements/flower.png"
              alt=""
              className="absolute right-2 top-2 w-8 opacity-10 pointer-events-none blur-[1px]"
            />

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full ${content.iconBg} flex items-center justify-center border border-white/20 flex-shrink-0`}
              >
                {React.cloneElement(content.icon, { className: "w-5 h-5" })}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1 truncate">
                  {content.title}
                </h3>
                <p className="text-white/80 text-xs leading-relaxed mb-3">
                  {content.message}
                </p>

                {/* Progress bar */}
                {content.showProgress && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white/60 text-xs">Chats Used</span>
                      <span className="text-white font-medium text-xs">
                        {totalChats - chatsRemaining}/{totalChats}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${((totalChats - chatsRemaining) / totalChats) * 100}%`,
                        }}
                        transition={{
                          delay: 0.3,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className={`h-full bg-gradient-to-r ${content.buttonGradient} rounded-full`}
                      />
                    </div>
                  </div>
                )}

                {/* Action button */}
                <motion.button
                  onClick={handlePrimaryAction}
                  className={`w-full bg-gradient-to-r ${content.buttonGradient} text-white font-medium py-2 px-3 rounded-lg text-xs shadow hover:shadow-lg transition-all duration-200`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {content.actionText}
                </motion.button>
              </div>

              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="text-white/40 hover:text-white/80 text-lg leading-none p-1 transition-colors flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>
          </motion.div>

          {/* Auto dismiss after 6 seconds for non-blocking notifications */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-white/30 to-white/10 rounded-full"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 6, ease: "linear" }}
            onAnimationComplete={onClose}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
