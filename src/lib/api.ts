// lib/api.ts - Centralized API configuration for Xleos backend integration

// API Base URL - switches automatically between environments
export const API_BASE_URL = (() => {
  if (typeof window === 'undefined') {
    // Server-side rendering - always use the backend URL
    return process.env.NEXT_PUBLIC_BASEURL || 'http://localhost:8000'
  }

  // Client-side - in development, use the proxy (same origin)
  if (process.env.NODE_ENV === 'development') {
    return '' // Use relative URLs to leverage Next.js proxy
  }

  // Production - use environment variable or default
  return process.env.NEXT_PUBLIC_BASEURL || 'http://localhost:8000'
})()

// WebSocket URL
export const WS_BASE_URL = API_BASE_URL.replace('http', 'ws').replace('https', 'wss')

// Generic API helper function
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultOptions: RequestInit = {
    credentials: 'include', // Always include cookies for auth
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
      'Accept': 'application/json',
      ...options?.headers
    }
  }

  console.log(`🔥 API Call: ${options?.method || 'GET'} ${endpoint}`)

  try {
    const response = await fetch(url, { ...defaultOptions, ...options })
    console.log(`📊 Response: ${response.status} ${response.statusText}`)
    return response
  } catch (error) {
    console.error(`❌ API Call failed: ${endpoint}`, error)
    throw error
  }
}

// For authenticated requests (when we need explicit token)
export const authenticatedApiCall = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem('xleos_token')

  return apiCall(endpoint, {
    ...options,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      ...options?.headers
    }
  })
}

// Auth-specific API calls
export const authApi = {
  // Get login URLs from backend
  getLoginUrls: () => apiCall('/auth/login'),

  // Get signup URLs from backend
  getSignupUrls: () => apiCall('/auth/signup'),

  // Exchange auth code for tokens - Updated to handle JSON response
  exchangeCode: (code: string) => apiCall(`/auth/callback?code=${code}`, {
    method: 'GET',
    credentials: 'include'
  }),

  // Get user status (approval, etc.) - Uses HTTP-only cookies
  getUserStatus: () => apiCall('/api/user/status'),

  // Get user stats (usage, limits)
  getUserStats: () => apiCall('/api/user/stats'),

  // Logout - Clear HTTP-only cookies
  logout: () => apiCall('/auth/logout', { method: 'POST',credentials: 'include' })
}

// Chat/Script API calls
export const chatApi = {
  // Submit script for processing (your main AI functionality)
  submitScript: (script: string) => apiCall('/api/submit-script', {
    method: 'POST',
    body: JSON.stringify({ script_text: script })
  }),

  // Get submission results
  getResults: (submissionId: string) => apiCall(`/api/results/${submissionId}`),

  // Get submission history
  getSubmissions: () => apiCall('/api/submissions'),

  // Submit feedback for specific line and video
  submitFeedback: (submissionId: string, lineNumber: number, feedbackData: {
    video_index: number;
    rating: number;
    text?: string;
  }) => apiCall(`/api/submit-feedback/${submissionId}/${lineNumber}`, {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  }),

  // Get feedback summary
  getFeedbackSummary: (submissionId: string) => apiCall(`/api/feedback/summary/${submissionId}`)
}

// WebSocket helper
export const createWebSocket = (submissionId: string, token?: string) => {
  const wsUrl = `${WS_BASE_URL}/ws/status/${submissionId}${token ? `?token=${token}` : ''}`
  return new WebSocket(wsUrl)
}

export default {
  apiCall,
  authenticatedApiCall,
  authApi,
  chatApi,
  createWebSocket,
  API_BASE_URL,
  WS_BASE_URL
}
