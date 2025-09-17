'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '@/lib/api'
import {
  User,
  AuthContextType,
  ApprovalStatus,
  ChatUsage,
  UserStatus,
  UserStats
} from '@/types/auth'
import {
  setUserApprovalStatus,
  setChatCount,
  incrementChatUsage as incrementLocalChatUsage,
  isAuthValid,
  clearAuth,
  setAuthToken
} from '@/utils/auth'
import { toast } from 'react-toastify'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('unknown')
  const [chatUsage, setChatUsage] = useState<ChatUsage>({ used: 0, total: 3, remaining: 3 })

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Always try to check with backend using HTTP-only cookies
      await checkUserStatus()
    } catch (error) {
      console.error('Auth initialization failed:', error)
      setIsLoading(false)
    }
  }

  const checkUserStatus = async () => {
    try {
      setIsLoading(true)

      console.log('🔄 Checking user status...')

      // Check if user is authenticated via HTTP-only cookie
      const [statusResponse, statsResponse] = await Promise.all([
        authApi.getUserStatus(),
        authApi.getUserStats()
      ])

      console.log('✅ Status response:', statusResponse.status)
      console.log('✅ Stats response:', statsResponse.status)

      if (!statusResponse.ok) {
        // If not authenticated, clear any stale local state
        if (statusResponse.status === 401 || statusResponse.status === 403) {
          console.log('❌ User not authenticated, clearing state')
          clearAuth()
          setUser(null)
          setApprovalStatus('unknown')
          setChatUsage({ used: 0, total: 3, remaining: 3 })
        }
        setIsLoading(false)
        return
      }

      const statusData: UserStatus = await statusResponse.json()

      if (!statsResponse.ok) {
        throw new Error('Failed to get user stats')
      }

      const statsData: UserStats = await statsResponse.json()

      console.log('✅ User status data:', statusData)
      console.log('✅ User stats data:', statsData)

      // Create user object from backend data
      const userData: User = {
        email: statusData.email || 'user@example.com',
        name: statusData.name || 'User',
        approved: statusData.approved,
        submissions_used: statsData.submissions_used,
        total_allowed: statsData.total_allowed,
        remaining: statsData.remaining,
        is_admin: statsData.is_admin
      }

      setUser(userData)
      setApprovalStatus(statusData.approved ? 'approved' : 'pending')

      // Update local storage
      setUserApprovalStatus(statusData.approved)
      setChatCount(statsData.submissions_used, statsData.total_allowed)

      // Update chat usage state
      setChatUsage({
        used: statsData.submissions_used,
        total: statsData.total_allowed,
        remaining: statsData.remaining
      })

      // Set a local token flag to indicate authentication
      setAuthToken('authenticated')

      console.log('✅ Auth state updated successfully')

    } catch (error) {
      console.error('❌ Failed to check user status:', error)
      
      // Clear auth state on error
      setUser(null)
      setApprovalStatus('unknown')
      setChatUsage({ used: 0, total: 3, remaining: 3 })
      
      // Clear localStorage if it's an auth error
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        clearAuth()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserStats = async () => {
  if (!user) return;

  try {
    const response = await authApi.getUserStats();
    if (!response.ok) throw new Error('Failed to refresh stats');

    const statsData: UserStats = await response.json();

    // Update user object
    setUser(prev => prev ? {
      ...prev,
      submissions_used: statsData.submissions_used,
      total_allowed: statsData.total_allowed,
      remaining: statsData.remaining,
      is_admin: statsData.is_admin
    } : null);

    // Update chat usage
    const newChatUsage = {
      used: statsData.submissions_used,
      total: statsData.total_allowed,
      remaining: statsData.remaining
    };
    setChatUsage(newChatUsage);
    setChatCount(statsData.submissions_used, statsData.total_allowed);

  } catch (error) {
    console.error('Failed to refresh user stats:', error);
    // REMOVED: toast.error('Failed to refresh usage stats');
  }
};


  const incrementChatUsage = async (): Promise<ChatUsage> => {
    try {
      // Optimistically update local state
      const localUsage = incrementLocalChatUsage()
      setChatUsage(localUsage)

      // Refresh from backend to get accurate data
      await refreshUserStats()

      return chatUsage
    } catch (error) {
      console.error('Failed to increment chat usage:', error)
      // Return current state if backend fails
      return chatUsage
    }
  }

  const login = () => {
    // This will be handled by AuthModal redirecting to Auth0
    // The actual login completion happens in the callback
  }

  const logout = async () => {
  try {
    console.log('🔄 Starting logout process...');
    
    // Call backend logout endpoint to clear HTTP-only cookie
    const response = await authApi.logout();
    
    if (!response.ok) {
      console.error('Backend logout failed:', response.status);
      // Continue with local logout even if backend fails
    } else {
      console.log('✅ Backend logout successful');
    }
  } catch (error) {
    console.error('Backend logout failed:', error);
    // Continue with local logout even if backend fails
  } finally {
    // Clear local state regardless of backend response
    console.log('🧹 Clearing local auth state...');
    setUser(null);
    setApprovalStatus('unknown');
    setChatUsage({ used: 0, total: 3, remaining: 3 });
    clearAuth();
    
    console.log('✅ Logout complete - redirecting to home');
    
    // Force a full page reload to clear all state
    window.location.href = '/';
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
    incrementChatUsage
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
