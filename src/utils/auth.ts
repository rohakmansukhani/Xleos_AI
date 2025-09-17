// utils/auth.ts - Authentication utilities for Xleos

export function setAuthToken(token: string) {
  localStorage.setItem("xleos_token", token)
  localStorage.setItem("xleos_login_time", Date.now().toString())
}

export function getAuthToken(): string | null {
  return localStorage.getItem("xleos_token")
}

export function setUserApprovalStatus(isApproved: boolean) {
  localStorage.setItem("xleos_user_approved", isApproved.toString())
}

export function getUserApprovalStatus(): boolean | null {
  const status = localStorage.getItem("xleos_user_approved")
  if (status === null) return null
  return status === "true"
}

export function setChatCount(used: number, total: number) {
  localStorage.setItem("xleos_chats_used", used.toString())
  localStorage.setItem("xleos_chats_total", total.toString())
}

export function getChatCount(): { used: number; total: number; remaining: number } {
  const used = Number(localStorage.getItem("xleos_chats_used") || "0")
  const total = Number(localStorage.getItem("xleos_chats_total") || "3")
  return { used, total, remaining: Math.max(0, total - used) }
}

export function incrementChatUsage() {
  const { used, total } = getChatCount()
  const newUsed = Math.min(used + 1, total)
  setChatCount(newUsed, total)
  return { used: newUsed, total, remaining: Math.max(0, total - newUsed) }
}

export function isAuthValid() {
  const token = localStorage.getItem("xleos_token")
  const t = Number(localStorage.getItem("xleos_login_time"))
  if (!token || !t) return false
  // 24hr = 86400000ms
  return Date.now() - t < 86400000
}

export function clearAuth() {
  localStorage.removeItem("xleos_token")
  localStorage.removeItem("xleos_login_time")
  localStorage.removeItem("xleos_user_approved")
  localStorage.removeItem("xleos_chats_used")
  localStorage.removeItem("xleos_chats_total")
}

// NEW: Backend integration helpers
export const checkBackendUserStatus = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/user/status`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Backend status check failed:', error)
    return null
  }
}

export const getUserStats = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/user/stats`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('User stats failed:', error)
    return null
  }
}
