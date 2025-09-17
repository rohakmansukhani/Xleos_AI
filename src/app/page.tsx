'use client'
import React, { useState, useEffect } from "react";
import ChatNavbar from '../components/layout/ChatNavbar';
import XleosMainChatCard from '../components/main/XleosMainChatCard';
import LineByLineTimeline from '../components/timeline/LineByLineTimeline';
import VideoSelectionPanel from "../components/timeline/VideoSelectionPanel";
import HistoryCard from '../components/history/HistoryCard';
import LoadingScreen from '../components/ui/LoadingScreen';
import WaitlistModal from '../components/main/WaitlistModal';
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import ChatLimitNotification from '../components/notifications/ChatLimitNotification';
import { useRouter } from 'next/navigation';
import { chatApi, createWebSocket } from '../lib/api';
import { toast } from 'react-toastify';
import { BackendSubmission, BackendLine, WebSocketMessage } from '../types/auth';

export default function HomePage() {
  const router = useRouter();

  // Use auth context
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    approvalStatus,
    chatUsage,
    logout,
    incrementChatUsage,
    checkUserStatus  // For refresh functionality
  } = useAuth();

  const [activeView, setActiveView] = useState<'input' | 'timeline' | 'history'>('input');
  const [currentSubmission, setCurrentSubmission] = useState<BackendSubmission | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [videoModalState, setVideoModalState] = useState<null | {
    lineIndex: number;
    line: BackendLine;
  }>(null);
  
  // Chat limit and pending approval notifications
  const [showChatLimitModal, setShowChatLimitModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  
  // WebSocket state for real-time updates
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [realTimeStatus, setRealTimeStatus] = useState<string>('');

  // Handle authentication status
  useEffect(() => {
    if (authLoading) return; // Wait for auth to initialize

    if (!isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode('signup');
      setShowPendingModal(false); // Close pending modal if user logs out
      return;
    }

    // Close auth modal if user becomes authenticated
    setShowAuthModal(false);

    // Handle approval status - Show pending modal for unapproved users
    if (approvalStatus === 'pending') {
      setShowPendingModal(true); // Show blocking pending modal
      return;
    } else {
      setShowPendingModal(false); // Close pending modal if approved
    }
  }, [isAuthenticated, approvalStatus, authLoading]);

  // WebSocket cleanup on unmount
  useEffect(() => {
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [websocket]);

  // Connect to WebSocket for real-time updates
  const connectWebSocket = (submissionId: string) => {
    try {
      const ws = createWebSocket(submissionId);

      ws.onopen = () => {
        console.log('WebSocket connected for submission:', submissionId);
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message:', data);

          // Update real-time status
          setRealTimeStatus(data.message || '');

          // Update submission status
          if (currentSubmission && currentSubmission._id === submissionId) {
            setCurrentSubmission(prev => prev ? {
              ...prev,
              status: data.status as any,
              message: data.message
            } : null);

            // If processing is complete, stop loading and fetch results immediately
            if (data.status === 'completed') {
              console.log('✅ Processing completed, fetching results...');
              setProcessing(false);
              setRealTimeStatus('');
              
              // Immediately fetch the complete results and force timeline view
              fetchSubmissionResults(submissionId).then((results) => {
                if (results) {
                  console.log('✅ Results fetched, forcing timeline view');
                  setActiveView('timeline'); // Force timeline view
                }
              });
              
            } else if (data.status === 'error') {
              setProcessing(false);
              setRealTimeStatus('');
              console.error('❌ Processing failed:', data.message);
            }
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWebsocket(null);
      };

      setWebsocket(ws);
      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      return null;
    }
  };

  // Fetch submission results from backend
  const fetchSubmissionResults = async (submissionId: string) => {
    try {
      console.log('🔍 Fetching results for submission:', submissionId);
      
      const response = await chatApi.getResults(submissionId);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Results not ready yet for submission:', submissionId);
          return null;
        }
        throw new Error('Failed to fetch results');
      }

      const resultsData = await response.json();
      console.log('✅ Results fetched:', resultsData);
      
      // Update current submission with complete results
      if (currentSubmission && currentSubmission._id === submissionId) {
        const updatedSubmission = {
          ...currentSubmission,
          ...resultsData,
          status: 'completed', // Ensure status is completed
          lines: resultsData.lines || []
        };
        
        setCurrentSubmission(updatedSubmission);
        console.log('✅ Submission updated with results, lines count:', resultsData.lines?.length || 0);
      }
      
      return resultsData;
    } catch (error) {
      console.error('Failed to fetch submission results:', error);
      return null;
    }
  };

  const handleNewSession = () => {
    // Block if pending approval
    if (approvalStatus === 'pending') {
      setShowPendingModal(true);
      return;
    }

    setCurrentSubmission(null);
    setActiveView('input');
    setRealTimeStatus('');
    if (websocket) {
      websocket.close();
    }
  };

  const handleScriptSubmit = async (script: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Block if pending approval
    if (approvalStatus === 'pending') {
      setShowPendingModal(true);
      return;
    }

    if (approvalStatus !== 'approved') {
      return; // REMOVED: toast.error - silent rejection
    }

    // Check character limit (800 chars)
    if (script.length > 800) {
      return; // REMOVED: toast.error - silent rejection
    }

    // Check if user has chats remaining
    if (chatUsage.remaining <= 0 && !user?.is_admin) {
      setShowChatLimitModal(true);
      return;
    }

    try {
      // Start processing immediately
      setProcessing(true);
      setRealTimeStatus('Submitting script...');

      // Show non-blocking notification for first chat or remaining chats
      if (chatUsage.used === 0 || (chatUsage.remaining <= 2 && !user?.is_admin)) {
        setShowChatLimitModal(true);
      }

      // Submit script to backend
      const response = await chatApi.submitScript(script);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error codes
        if (response.status === 400 && errorData.detail?.includes('char_limit_exceeded')) {
          // REMOVED: toast.error('Script exceeds character limit');
          setProcessing(false);
          return;
        }
        if (response.status === 403) {
          if (errorData.detail?.includes('submission_limit_reached')) {
            // REMOVED: toast.error('Submission limit reached');
            setShowChatLimitModal(true);
          } else if (errorData.detail?.includes('not approved')) {
            setShowPendingModal(true); // Show pending modal instead of toast
          }
          setProcessing(false);
          return;
        }

        throw new Error(errorData.message || 'Failed to submit script');
      }

      const submissionData = await response.json();

      // Increment chat usage after successful submission
      if (!user?.is_admin) {
        await incrementChatUsage();
      }

      // Create initial submission object
      const newSubmission: BackendSubmission = {
        _id: submissionData.submission_id,
        user_id: user?.email || '',
        submission_timestamp: new Date().toISOString(),
        script_text: script,
        status: 'processing',
        message: 'Processing started',
        lines: []
      };

      setCurrentSubmission(newSubmission);
      setActiveView('timeline');

      // Connect to WebSocket for real-time updates
      if (submissionData.submission_id) {
        connectWebSocket(submissionData.submission_id);
      }

      // REMOVED: toast.success('Script submitted successfully!');

    } catch (error) {
      console.error('Script submission failed:', error);
      // REMOVED: toast.error(error instanceof Error ? error.message : 'Failed to submit script');
      setProcessing(false);
      setRealTimeStatus('');
    }
  };

  const handleOpenVideoModal = (lineIndex: number, line: BackendLine) => {
    setVideoModalState({ lineIndex, line });
  };

  const handleVideoFeedback = async (feedback: { [videoIndex: number]: { rating: number; comment: string } }) => {
    if (!currentSubmission || videoModalState === null) return;

    try {
      // Feedback is already submitted to backend by VideoSelectionPanel
      // Just update local state to reflect completion
      const updatedSubmission = { ...currentSubmission };
      const line = updatedSubmission.lines[videoModalState.lineIndex];
      
      if (line) {
        // Mark videos as having feedback (this is handled by the VideoSelectionPanel)
        Object.entries(feedback).forEach(([videoIndex, fb]) => {
          const vIndex = parseInt(videoIndex);
          if (line.videos[vIndex]) {
            line.videos[vIndex].feedback = {
              rating: fb.rating,
              text: fb.comment
            };
          }
        });
      }

      setCurrentSubmission(updatedSubmission);
      // REMOVED: toast.success('Feedback saved successfully!');
    } catch (error) {
      console.error('Failed to handle feedback:', error);
      // REMOVED: toast.error('Failed to save feedback');
    } finally {
      setVideoModalState(null);
    }
  };

  const handleOpenHistory = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Block if pending approval
    if (approvalStatus === 'pending') {
      setShowPendingModal(true);
      return;
    }

    setActiveView('history');
  };

  const handleSelectHistoricalSession = async (submission: BackendSubmission) => {
    console.log('📁 [HISTORY] Selected submission:', submission._id, 'Status:', submission.status);
    
    setCurrentSubmission(submission);
    setActiveView('timeline');
    
    // If submission is completed but has no lines, fetch fresh results
    if (submission.status === 'completed' && (!submission.lines || submission.lines.length === 0)) {
      console.log('🔄 [HISTORY] Fetching fresh results for completed submission');
      await fetchSubmissionResults(submission._id);
    }
  };

  // Debugging: log key state transitions
  useEffect(() => {
    console.log('📊 [STATE DEBUG]', {
      activeView,
      processing,
      currentSubmission: currentSubmission ? {
        id: currentSubmission._id,
        status: currentSubmission.status,
        linesCount: currentSubmission.lines?.length || 0
      } : null,
      realTimeStatus
    });
  }, [activeView, processing, currentSubmission, realTimeStatus]);

  const handleCloseAuth = () => {
    if (!isAuthenticated) {
      // If user closes auth modal without authenticating, keep modal open
      setShowAuthModal(true);
    }
  };

  // Handle refresh status for pending approval
  const handleRefreshStatus = async () => {
    try {
      await checkUserStatus();
      if (approvalStatus === 'approved') {
        setShowPendingModal(false); // Just close the modal silently
      }
      // REMOVED: All toast notifications - silent refresh
    } catch (error) {
      console.error('Failed to refresh status:', error);
      // Keep only console error - no toast spam
    }
  };

  // Show loading screen while auth is initializing
  if (authLoading) {
    return <LoadingScreen message="Initializing..." />;
  }

  // Block all content before authentication
  if (!isAuthenticated) {
    return (
      <AuthModal
        mode={authMode}
        onClose={handleCloseAuth}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175]">
      {/* Background */}
      <div className="absolute" style={{ top: 0, right: 0, width: "55vw", height: "100vh", zIndex: 1, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
        <img src="/cubes.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.23, userSelect: "none" }} draggable={false} />
      </div>

      <ChatNavbar
        onBotClick={handleNewSession}
        onHistoryClick={handleOpenHistory}
        onWaitlistClick={() => setShowWaitlistModal(true)}
      />

      <main className="flex min-h-[90vh] w-full items-center justify-center pt-36 pb-16 px-0 relative z-10">
        <div className="w-full max-w-7xl flex flex-col rounded-3xl bg-white/4 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden relative min-h-[650px] mx-4 sm:mx-8 lg:mx-auto">
          <img src="/elements/flower.png" alt="" className="absolute left-8 bottom-20 w-32 opacity-15 pointer-events-none blur-[3px]" />


          {/* Content Sections - Updated Logic */}
          {(activeView === 'input' && !processing) && (
            <XleosMainChatCard onSubmitScript={handleScriptSubmit} />
          )}

          {/* Show loading only if processing AND no results available yet */}
          {processing && (!currentSubmission?.lines || currentSubmission.lines.length === 0) && (
            <LoadingScreen message={realTimeStatus || "Processing your script..."} />
          )}

          {/* Show timeline if we have results OR if submission is completed */}
          {(activeView === 'timeline' && currentSubmission && 
            (currentSubmission.lines?.length > 0 || currentSubmission.status === 'completed')) && (
            <LineByLineTimeline
              submission={currentSubmission}
              onSelectLine={handleOpenVideoModal}
              onBackToInput={handleNewSession}
              realTimeStatus={realTimeStatus}
            />
          )}

          {(activeView === 'history') && (
            <HistoryCard
              onSelectSession={handleSelectHistoricalSession}
              onBack={() => setActiveView(currentSubmission ? 'timeline' : 'input')}
            />
          )}
        </div>
      </main>

      {/* Video Selection Panel */}
      {videoModalState !== null && currentSubmission && (
        <VideoSelectionPanel
          line={videoModalState.line}
          submissionId={currentSubmission._id}
          lineIndex={videoModalState.lineIndex}
          onCompleteAction={handleVideoFeedback}
          onCloseAction={() => setVideoModalState(null)}
        />
      )}

      {/* Auth Modal (should never show if authenticated) */}
      {showAuthModal && !isAuthenticated && (
        <AuthModal
          mode={authMode}
          onClose={handleCloseAuth}
        />
      )}

      {/* Waitlist Modal */}
      <WaitlistModal isOpen={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />

      {/* Chat Limit & Pending Approval Notification */}
      <ChatLimitNotification
        isOpen={showChatLimitModal || showPendingModal}
        onClose={() => {
          setShowChatLimitModal(false);
          // Only allow closing pending modal if user is approved
          if (approvalStatus === 'approved') {
            setShowPendingModal(false);
          }
        }}
        chatsRemaining={chatUsage.remaining}
        totalChats={chatUsage.total}
        onOpenWaitlist={() => setShowWaitlistModal(true)}
        isPending={approvalStatus === 'pending'}
        onRefreshStatus={handleRefreshStatus}
        userEmail={user?.email}
      />
    </div>
  );
}
