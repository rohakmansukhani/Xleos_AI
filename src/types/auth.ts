export interface User {
  email: string
  name: string
  image?: string
  approved: boolean
  submissions_used: number
  total_allowed: number
  remaining: number
  is_admin: boolean
}

export interface AuthUrls {
  google_login_url: string
  apple_login_url: string
  email_login_url: string
  google_signup_url?: string
  apple_signup_url?: string
  email_signup_url?: string
}

export interface AuthResponse {
  message: string
  user?: {
    email: string
    name: string
    approved: boolean
  }
}

// Updated to match backend response structure
export interface UserStatus {
  approved: boolean
  email?: string  // Added from backend
  name?: string   // Added from backend
}

export interface UserStats {
  submissions_used: number
  total_allowed: number
  remaining: number
  is_admin: boolean
}

export interface ChatUsage {
  used: number
  total: number
  remaining: number
}

export type ApprovalStatus = 'approved' | 'pending' | 'unknown'

export interface AuthContextType {
  // User state
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  approvalStatus: ApprovalStatus

  // Chat usage
  chatUsage: ChatUsage

  // Auth methods
  login: () => void
  logout: () => Promise<void>
  checkUserStatus: () => Promise<void>
  refreshUserStats: () => Promise<void>
  incrementChatUsage: () => Promise<ChatUsage>
}

// ============================================
// BACKEND DATA STRUCTURES
// ============================================

// Match your exact backend MongoDB schema
export interface BackendSubmission {
  _id: string
  user_id: string
  user_email?: string  // Added for better user tracking
  submission_timestamp: string
  script_text: string
  status: 'processing' | 'completed' | 'error'
  message: string
  lines: BackendLine[]
  total_lines?: number  // Added for progress tracking
  created_at?: string   // Added from backend
  updated_at?: string   // Added from backend
}

export interface BackendLine {
  line_number: number
  line_text: string
  search_phrase: string
  videos: BackendVideo[]
  status?: 'processing' | 'completed' | 'error'  // Added for line-level status
  processing_started_at?: string  // Added for progress tracking
  processing_completed_at?: string  // Added for progress tracking
}

export interface BackendVideo {
  video_url: string
  start_timestamp: number
  end_timestamp: number
  description: string
  relevance_score: number
  feedback: {
    rating: number | null
    text: string | null
  }
  // Additional metadata from your backend
  video_title?: string
  channel_name?: string
  duration?: number
  thumbnail_url?: string
  youtube_video_id?: string  // Extracted from URL
}
export interface WebSocketMessage {
  status: string
  message: string
  submission_id: string
  timestamp: string
  progress?: WebSocketProgress
  error?: string  // Added for error handling
}

export interface WebSocketProgress {
  stage: string
  stage_name: string
  overall_progress: number
  current_line?: number
  total_lines: number
  line_progress?: number
  detailed_message: string
  // Added more granular progress tracking
  current_stage_progress?: number
  estimated_completion_time?: string
  videos_found?: number
  videos_analyzed?: number
}

// ============================================
// FRONTEND COMPATIBILITY TYPES
// ============================================

// For backward compatibility with existing frontend components
export interface ScriptSession {
  id: string
  script: string
  lines: string[]
  feedback: { [lineIdx: number]: { rating: number; comment: string } }
  submissionId?: string
  status?: 'processing' | 'completed' | 'error'
  results?: BackendSubmission
  searchPhrases?: string[]
  videos?: { [lineIdx: number]: BackendVideo[] }
  // Added for enhanced functionality
  realTimeStatus?: string
  progressData?: WebSocketProgress
  createdAt?: Date
  updatedAt?: Date
}

export interface VideoSuggestion {
  id: string
  title: string
  thumbnail: string
  durationSec: number
  videoUrl: string
  startTime?: number
  endTime?: number
  description?: string
  relevanceScore?: number
  // Added for better video handling
  channelName?: string
  publishedAt?: string
  viewCount?: number
  youtubeVideoId?: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  // Added for better error handling
  details?: string
  code?: string
  timestamp?: string
}

export interface AuthCallbackResponse {
  message: string
  user?: {
    email: string
    name: string
    approved: boolean
  }
  // Added for enhanced callback handling
  token?: string
  expires_in?: number
  redirect_url?: string
}

// ============================================
// FEEDBACK & RATING TYPES
// ============================================

export interface VideoFeedback {
  video_index: number
  rating: number
  text?: string
  timestamp?: string
  user_id?: string
}

export interface LineFeedback {
  line_number: number
  feedback: VideoFeedback[]
  average_rating?: number
  total_ratings?: number
  combined_comment?: string
}

export interface SubmissionFeedback {
  submission_id: string
  line_feedbacks: LineFeedback[]
  overall_rating?: number
  completion_percentage?: number
  submitted_at?: string
}

// ============================================
// ERROR HANDLING TYPES
// ============================================

export interface ApiError {
  message: string
  code?: string
  details?: string
  field?: string  // For validation errors
  timestamp?: string
}

export interface AuthError extends ApiError {
  auth_error_type?: 'token_expired' | 'invalid_token' | 'no_token' | 'forbidden'
  redirect_url?: string
}

export interface ProcessingError extends ApiError {
  submission_id?: string
  line_number?: number
  stage?: string
  retry_possible?: boolean
}

// ============================================
// ADMIN & MANAGEMENT TYPES
// ============================================

export interface AdminUserData {
  email: string
  name: string
  approved: boolean
  is_admin: boolean
  submissions_used: number
  total_allowed: number
  created_at: string
  last_login?: string
  total_submissions?: number
  average_rating?: number
}

export interface AdminStats {
  total_users: number
  pending_approvals: number
  active_users_today: number
  total_submissions: number
  successful_submissions: number
  failed_submissions: number
  average_processing_time: number
}

// ============================================
// UTILITY TYPES
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type AuthState = 'unauthenticated' | 'authenticated' | 'pending' | 'error'

export type SubmissionState = 'draft' | 'submitting' | 'processing' | 'completed' | 'failed'

// Generic pagination type for API responses
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// ============================================
// CONFIGURATION TYPES
// ============================================

export interface AppConfig {
  maxScriptLength: number
  maxSubmissionsPerUser: number
  adminSubmissionLimit: number
  processingTimeoutMinutes: number
  allowedFileTypes: string[]
  maxFileSize: number
}

export interface FeatureFlags {
  enableVideoAnalysis: boolean
  enableBackgroundProcessing: boolean
  enableWebSocketStatus: boolean
  enableFeedbackSystem: boolean
  enableAdminPanel: boolean
}

// Export all types for easy importing
export type {
  // Re-export commonly used types
  User as AuthUser,
  BackendSubmission as Submission,
  BackendLine as ProcessedLine,
  BackendVideo as ProcessedVideo,
  WebSocketMessage as RealtimeUpdate,
  VideoFeedback as UserRating
}
