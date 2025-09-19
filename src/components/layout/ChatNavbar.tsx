"use client";
import React, { useState, useCallback, memo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import BlobBot from "../ui/BlobBot";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

// Glass Logo component (no changes here)
const GlassLogo: React.FC<{ onClick?: () => void; className?: string }> = memo(
  ({ onClick, className = "" }) => {
    const [isHovering, setIsHovering] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { damping: 25, stiffness: 200 });
    const smoothY = useSpring(mouseY, { damping: 25, stiffness: 200 });

    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      mouseX.set(x * 6);
      mouseY.set(y * 6);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      mouseX.set(0);
      mouseY.set(0);
    };

    return (
      <motion.div
        className={`glass-logo-container relative rounded-full w-11 h-11 flex items-center justify-center cursor-pointer overflow-hidden ${className}`}
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid #262626",
          backdropFilter: "blur(15px) saturate(150%)",
          WebkitBackdropFilter: "blur(15px) saturate(150%)",
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          boxShadow: isHovering
            ? "0 0 25px 5px #461C64, inset 0 0 25px rgba(255,255,255,0.12)"
            : "0 0 12px 3px rgba(70, 28, 100, 0.6)",
        }}
        transition={{ duration: 0.3 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        tabIndex={0}
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={28}
          height={28}
          className="w-7 h-7 object-contain z-10 select-none"
          draggable={false}
          style={{ userSelect: "none" }}
          priority
        />
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.15) 100%)`,
          }}
          animate={{
            rotate: isHovering ? 360 : 0,
            opacity: isHovering ? 0.7 : 0.4,
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            opacity: { duration: 0.3 },
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, transparent 55%, rgba(70, 28, 100, 0.35) 100%)",
            transform: "scale(1.25)",
          }}
          animate={{
            opacity: isHovering ? 1 : 0,
          }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    );
  },
);
GlassLogo.displayName = "GlassLogo";

// FIXED: Updated interface to match HomePage usage
interface ChatNavbarProps {
  onWaitlistClick?: () => void;
  onBotClick?: () => void;
  onHistoryClick?: () => void;
  className?: string;
}

const ProfileDropdown: React.FC<{
  open: boolean;
  setOpen: (v: boolean) => void;
}> = ({ open, setOpen }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout, approvalStatus, chatUsage } = useAuth();

  // Close dropdown if clicked outside
  React.useEffect(() => {
    const cb = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", cb);
    return () => document.removeEventListener("mousedown", cb);
  }, [open, setOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
      // Force reload anyway
      window.location.href = "/";
    }
  };

  const getApprovalStatusColor = () => {
    switch (approvalStatus) {
      case "approved":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getApprovalStatusText = () => {
    switch (approvalStatus) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending Approval";
      default:
        return "Unknown Status";
    }
  };

  return (
    <div ref={ref} className="relative ml-2">
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-[#3f307d]/60 to-[#392560]/60 border border-white/10 shadow-lg text-white text-lg font-bold focus:outline-none select-none relative"
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        title="Account"
      >
        <User className="w-7 h-7 text-white/80" />

        {/* Approval status indicator */}
        <div
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
            approvalStatus === "approved"
              ? "bg-green-500"
              : approvalStatus === "pending"
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 11, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="absolute right-0 mt-2 min-w-[220px] rounded-2xl bg-gradient-to-br from-[#3f307d]/90 via-[#241b2e]/95 to-[#392560]/85 shadow-2xl border border-white/8 py-2 z-50"
          >
            {/* User Info */}
            <div className="px-5 py-3 border-b border-white/10">
              <div className="text-sm text-white font-semibold truncate">
                {user?.name || user?.email || "User"}
              </div>
              <div className="text-xs text-[#b5abfa] truncate">
                {user?.email || ""}
              </div>
              <div
                className={`text-xs ${getApprovalStatusColor()} mt-1 flex items-center gap-1`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    approvalStatus === "approved"
                      ? "bg-green-500"
                      : approvalStatus === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                {getApprovalStatusText()}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="px-5 py-3 border-b border-white/10">
              <div className="text-xs text-[#b5abfa] mb-2">Script Usage</div>
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Used: {chatUsage.used}</span>
                <span className="text-white/70">
                  {user?.is_admin
                    ? "Unlimited"
                    : `${chatUsage.remaining} remaining`}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7c5dfa] to-[#bb80ff] rounded-full transition-all duration-300"
                  style={{
                    width: user?.is_admin
                      ? "100%"
                      : `${Math.min((chatUsage.used / chatUsage.total) * 100, 100)}%`,
                  }}
                />
              </div>
              {user?.is_admin && (
                <div className="text-xs text-purple-300 mt-1">
                  Admin Account
                </div>
              )}
            </div>

            {/* REMOVED: Settings Menu Item */}

            {/* Sign Out Button */}
            <button
              className="w-full flex items-center gap-3 px-5 py-3 text-[#ff78b8] hover:bg-[#aa196533] hover:text-white text-sm transition"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChatNavbar: React.FC<ChatNavbarProps> = memo(
  ({ onWaitlistClick, onBotClick, onHistoryClick, className = "" }) => {
    const router = useRouter();
    const [blobHovered, setBlobHovered] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, isAuthenticated, approvalStatus } = useAuth();

    const handleLogoClick = useCallback(() => {
      window.location.href = "https://xleosweb.vercel.app";
    }, []);

    const handleBotClick = useCallback(() => {
      if (approvalStatus !== "approved") {
        // Show approval required message
        return;
      }
      onBotClick?.();
    }, [onBotClick, approvalStatus]);

    return (
      <motion.nav
        className={`fixed top-4 left-1/2 z-50 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full ${className}`}
        style={{ x: "-50%" }}
      >
        <div className="navbar-container flex items-center gap-4 px-6 h-[68px]">
          <GlassLogo onClick={handleLogoClick} />

          <div className="relative">
            <motion.div
              className={`cursor-pointer ${approvalStatus !== "approved" ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleBotClick}
              onMouseEnter={() => setBlobHovered(true)}
              onMouseLeave={() => setBlobHovered(false)}
              whileHover={approvalStatus === "approved" ? { scale: 1.05 } : {}}
              whileTap={approvalStatus === "approved" ? { scale: 0.95 } : {}}
              title={
                approvalStatus === "approved"
                  ? "New Script"
                  : "Approval Required"
              }
            >
              <BlobBot
                variant="navbar"
                size={48}
                colors={["#4A2178", "#DAA6FF"]}
                mouseFollow={approvalStatus === "approved"}
                intensity="high"
                interactive={approvalStatus === "approved"}
                glowEffect={true}
                className="w-12 h-12"
              />
            </motion.div>

            {blobHovered && (
              <motion.span
                className="absolute left-1/2 -translate-x-1/2 -top-9 px-4 py-2 rounded-xl bg-purple-700/90 text-white font-medium text-xs shadow-lg z-50 whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.21 }}
                style={{ pointerEvents: "none" }}
              >
                {approvalStatus === "approved"
                  ? "New Script"
                  : "Approval Required"}
              </motion.span>
            )}
          </div>

          <motion.button
            className="text-white/80 hover:text-white font-medium text-sm cursor-pointer select-none whitespace-nowrap px-2 transition-all"
            onClick={onHistoryClick}
          >
            History
          </motion.button>

          <motion.button
            onClick={onWaitlistClick}
            className="bg-gradient-to-r from-[#7c5dfa] to-[#bb80ff] text-white font-semibold px-5 py-2 rounded-lg ml-2 drop-shadow shadow-[0_2px_14px_0_rgba(124,93,250,0.09)]"
            whileHover={{ scale: 1.055 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 18 }}
          >
            Join Waitlist
          </motion.button>

          {/* Show profile dropdown only when authenticated */}
          {isAuthenticated && user && (
            <ProfileDropdown open={profileOpen} setOpen={setProfileOpen} />
          )}
        </div>
      </motion.nav>
    );
  },
);

ChatNavbar.displayName = "ChatNavbar";
export default ChatNavbar;
