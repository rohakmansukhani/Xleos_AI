"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { authApi } from "@/lib/api";
import {
  User,
  AuthContextType,
  ApprovalStatus,
  ChatUsage,
  UserStatus,
  UserStats,
} from "@/types/auth";
import {
  setUserApprovalStatus,
  setChatCount,
  incrementChatUsage as incrementLocalChatUsage,
  isAuthValid,
  clearAuth,
  setAuthToken,
} from "@/utils/auth";
import { toast } from "react-toastify";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] =
    useState<ApprovalStatus>("unknown");
  const [chatUsage, setChatUsage] = useState<ChatUsage>({
    used: 0,
    total: 3,
    remaining: 3,
  });
  const [hasInitialized, setHasInitialized] = useState(false); // Prevent multiple initializations

  const checkUserStatus = useCallback(async () => {
    try {
      console.log("🔄 Checking user status...");

      // Debug: Check cookies before API call
      if (typeof window !== "undefined") {
        console.log("🍪 Available cookies:", document.cookie || "none");
      }

      const [statusData, statsData] = await Promise.allSettled([
        authApi.getUserStatus(),
        authApi.getUserStats(),
      ]);

      // Handle user status response
      if (statusData.status === "fulfilled") {
        const userData = statusData.value;
        console.log("✅ User status retrieved:", userData);

        // Create user object from backend data
        const user: User = {
          email: userData.email || "user@example.com",
          name: userData.name || "User",
          approved: userData.approved,
          submissions_used: 0,
          total_allowed: 3,
          remaining: 3,
          is_admin: false,
        };

        setUser(user);
        setApprovalStatus(userData.approved ? "approved" : "pending");

        // Update local storage
        setUserApprovalStatus(userData.approved);
        setAuthToken("authenticated");

        // Handle user stats response
        if (statsData.status === "fulfilled") {
          const stats = statsData.value;
          console.log("✅ User stats retrieved:", stats);

          setChatCount(stats.submissions_used, stats.total_allowed);
          setChatUsage({
            used: stats.submissions_used,
            total: stats.total_allowed,
            remaining: stats.remaining,
          });

          // Update user with stats
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  submissions_used: stats.submissions_used,
                  total_allowed: stats.total_allowed,
                  remaining: stats.remaining,
                  is_admin: stats.is_admin,
                }
              : null,
          );
        } else {
          console.warn("⚠️ Failed to get user stats:", statsData.reason);
          setChatUsage({ used: 0, total: 3, remaining: 3 });
        }
      } else {
        // 401 is EXPECTED for non-logged-in users
        const error = statusData.reason;
        if (error?.message?.includes("401")) {
          console.log("👤 User not authenticated (expected on login page)");
        } else {
          console.log("👤 User authentication check failed:", error);
        }

        // Clear auth state
        setUser(null);
        setApprovalStatus("unknown");
        setChatUsage({ used: 0, total: 3, remaining: 3 });
        clearAuth();
      }
    } catch (error) {
      // Don't log 401 errors as failures
      if (!(error instanceof Error) || !error.message?.includes("401")) {
        console.log("👤 Unexpected authentication error:", error);
      }

      setUser(null);
      setApprovalStatus("unknown");
      setChatUsage({ used: 0, total: 3, remaining: 3 });
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Initializing auth...");

      // Skip auth check on auth-related pages
      const isAuthPage =
        typeof window !== "undefined" &&
        (window.location.pathname.includes("/auth/") ||
          window.location.pathname === "/login" ||
          window.location.pathname === "/signup");

      const isCallback =
        typeof window !== "undefined" &&
        window.location.pathname.includes("/auth/callback");
      const hasSuccessStatus =
        typeof window !== "undefined" &&
        window.location.search.includes("status=success");

      if (isCallback && hasSuccessStatus) {
        console.log(
          "🔍 On callback page with success - will check status after callback processing",
        );
        setIsLoading(false);
        return;
      }

      if (isAuthPage) {
        console.log("🔍 On auth page - skipping automatic auth check");
        setUser(null);
        setApprovalStatus("unknown");
        setIsLoading(false);
        return;
      }

      // For all other pages, check if user is already logged in
      await checkUserStatus();
    } catch (error) {
      console.error("❌ Auth initialization failed:", error);
      setUser(null);
      setApprovalStatus("unknown");
      setIsLoading(false);
    }
  }, [checkUserStatus]);

  // Initialize auth state on mount
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      initializeAuth();
    }
  }, [hasInitialized, initializeAuth]);

  const refreshUserStats = async () => {
    if (!user) return;

    try {
      console.log("🔄 Refreshing user stats...");
      const statsData: UserStats = await authApi.getUserStats();

      // Update user object
      setUser((prev) =>
        prev
          ? {
              ...prev,
              submissions_used: statsData.submissions_used,
              total_allowed: statsData.total_allowed,
              remaining: statsData.remaining,
              is_admin: statsData.is_admin,
            }
          : null,
      );

      // Update chat usage
      const newChatUsage = {
        used: statsData.submissions_used,
        total: statsData.total_allowed,
        remaining: statsData.remaining,
      };
      setChatUsage(newChatUsage);
      setChatCount(statsData.submissions_used, statsData.total_allowed);
    } catch (error) {
      console.error("Failed to refresh user stats:", error);
    }
  };

  const incrementChatUsage = async (): Promise<ChatUsage> => {
    try {
      // Optimistically update local state
      const localUsage = incrementLocalChatUsage();
      setChatUsage(localUsage);

      // Refresh from backend to get accurate data
      await refreshUserStats();

      return chatUsage;
    } catch (error) {
      console.error("Failed to increment chat usage:", error);
      // Return current state if backend fails
      return chatUsage;
    }
  };

  const login = () => {
    // This will be handled by AuthModal redirecting to Auth0
    // The actual login completion happens in the callback
  };

  const logout = async () => {
    try {
      console.log("🔄 Starting logout process...");

      // Call backend logout endpoint to clear HTTP-only cookie
      await authApi.logout();
      console.log("✅ Backend logout successful");
    } catch (error) {
      console.error("Backend logout failed:", error);
      // Continue with local logout even if backend fails
    } finally {
      // Clear local state regardless of backend response
      console.log("🧹 Clearing local auth state...");
      setUser(null);
      setApprovalStatus("unknown");
      setChatUsage({ used: 0, total: 3, remaining: 3 });
      clearAuth();

      console.log("✅ Logout complete - redirecting to home");

      // Force a full page reload to clear all state
      window.location.href = "/";
    }
  };

  const value: AuthContextType = {
    // State
    user,
    isAuthenticated: !!user,
    isLoading,
    approvalStatus,
    chatUsage,

    // Methods
    login,
    logout,
    checkUserStatus,
    refreshUserStats,
    incrementChatUsage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
