// lib/api.ts - Centralized API configuration for Xleos backend integration
import config from './config';

// API Base URL - always points to backend
export const API_BASE_URL = (() => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return config.apiUrl
  }

  // Client-side - always use the backend URL
  return config.apiUrl
})()

// Add debug logging
console.log('🔧 API_BASE_URL:', API_BASE_URL)

// WebSocket URL
export const WS_BASE_URL = API_BASE_URL.replace('http', 'ws').replace('https', 'wss')

interface ApiOptions extends RequestInit {
  headers?: HeadersInit;
}

interface ScriptSubmissionData {
  script_text: string;
  [key: string]: unknown;
}

interface FeedbackData {
  rating?: number;
  comment?: string;
  [key: string]: unknown;
}

// Generic API helper function with enhanced cookie handling
export const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultOptions: ApiOptions = {
    credentials: 'include', // CRITICAL for cross-origin cookies
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Helps with CORS
      'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
      ...options.headers,
    },
    ...options,
  }

  console.log(`🔥 API Call: ${options?.method || 'GET'} ${endpoint}`)

  try {
    const response = await fetch(url, defaultOptions)
    console.log(`📊 Response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      // Don't throw for 401 on auth endpoints - it's expected
      if (response.status === 401 && (endpoint.includes('/user/status') || endpoint.includes('/user/stats'))) {
        console.log('👤 Not authenticated (expected)')
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    return await response.text()
  } catch (error) {
    // Only log non-401 errors as failures
    if (!(error instanceof Error) || !error.message?.includes('401')) {
      console.error(`❌ API call failed for ${endpoint}:`, error)
    }
    throw error
  }
}

// Enhanced auth API with debugging
export const authApi = {
  getAuthUrls: () => apiCall('/auth/signup'),
  
  getUserStatus: async () => {
    console.log('🔍 Getting user status with cookies...')
    return apiCall('/api/user/status')
  },
  
  getUserStats: async () => {
    console.log('📊 Getting user stats with cookies...')
    return apiCall('/api/user/stats')
  },
  
  logout: () => apiCall('/auth/logout', { method: 'POST' }),

  // Keep existing auth URLs functions for compatibility
  getLoginUrls: () => apiCall('/auth/login'),
  getSignupUrls: () => apiCall('/auth/signup'),

  // Exchange auth code for tokens - Updated to handle JSON response
  exchangeCode: (code: string) => apiCall(`/auth/callback?code=${code}`, {
    method: 'GET',
    credentials: 'include'
  }),

  // Add test authentication endpoint
  testAuth: async () => {
    console.log('🧪 Testing authentication...')
    const response = await fetch(`${API_BASE_URL}/api/user/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }
    })
    
    console.log('🔍 Test auth response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      cookies: typeof window !== 'undefined' ? document.cookie : 'server-side'
    })
    
    return response
  }
}

export const scriptApi = {
  submitScript: (data: ScriptSubmissionData) =>
    apiCall('/api/submit-script', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getResults: (submissionId: string) =>
    apiCall(`/api/results/${submissionId}`),
  getSubmissions: () => apiCall('/api/submissions'),
  submitFeedback: (submissionId: string, lineNumber: number, data: FeedbackData) =>
    apiCall(`/api/submit-feedback/${submissionId}/${lineNumber}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getFeedbackSummary: (submissionId: string) =>
    apiCall(`/api/feedback/summary/${submissionId}`)
}

// Keep chatApi for backwards compatibility
export const chatApi = {
  // Submit script for processing (your main AI functionality)
  submitScript: (script: string) => scriptApi.submitScript({ script_text: script }),

  // Get submission results
  getResults: (submissionId: string) => scriptApi.getResults(submissionId),

  // Get submission history
  getSubmissions: () => scriptApi.getSubmissions(),

  // Submit feedback for specific line and video
  submitFeedback: (submissionId: string, lineNumber: number, feedbackData: {
    video_index: number;
    rating: number;
    text?: string;
  }) => scriptApi.submitFeedback(submissionId, lineNumber, feedbackData),

  // Get feedback summary
  getFeedbackSummary: (submissionId: string) => scriptApi.getFeedbackSummary(submissionId)
}

// WebSocket helper
export const createWebSocket = (submissionId: string, token?: string) => {
  const wsUrl = `${WS_BASE_URL}/ws/processing/${submissionId}${token ? `?token=${token}` : ''}`
  console.log('🔌 Creating WebSocket connection:', wsUrl)
  return new WebSocket(wsUrl)
}

export default {
  apiCall,
  authApi,
  scriptApi,
  chatApi,
  createWebSocket,
  API_BASE_URL,
  WS_BASE_URL
}
