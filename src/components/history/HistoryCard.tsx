'use client'
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BackendSubmission } from '@/types/auth';
import { chatApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { Loader2, Search, Clock, FileText, Star } from 'lucide-react';

interface HistoryCardProps {
  onSelectSession: (submission: BackendSubmission) => void;
  onBack: () => void;
}

export default function HistoryCard({ onSelectSession, onBack }: HistoryCardProps) {
  const [search, setSearch] = useState("");
  const [submissions, setSubmissions] = useState<BackendSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getSubmissions();
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      setSubmissions(data || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort submissions (most recent first)
  const submissionsToShow = submissions
    .filter(s => 
      !search.length || 
      s.script_text.toLowerCase().includes(search.toLowerCase()) ||
      s.lines.some(line => line.line_text.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => new Date(b.submission_timestamp).getTime() - new Date(a.submission_timestamp).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '⏳';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getFeedbackStats = (submission: BackendSubmission) => {
    const totalVideos = submission.lines.reduce((sum, line) => sum + line.videos.length, 0);
    const ratedVideos = submission.lines.reduce((sum, line) => 
      sum + line.videos.filter(video => video.feedback.rating !== null).length, 0
    );
    return { total: totalVideos, rated: ratedVideos };
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <motion.div
        className="flex-1 flex flex-col items-center justify-center min-h-[600px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-4" />
        <div className="text-white/60 font-medium">Loading your history...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex-1 flex flex-col bg-black/70 backdrop-blur-xl px-8 pt-11 pb-7 min-h-[600px] relative"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 25 }}
      transition={{ duration: 0.16, type: "tween" }}
    >
      <div className="flex items-center mb-7 gap-5">
        <button
          onClick={onBack}
          className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-purple-200 font-medium text-xs shadow transition mr-2"
        >
          ← Back
        </button>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-300 to-purple-500 bg-clip-text text-transparent select-none tracking-tight">
          History
        </h2>
        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search scripts..."
            className="pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white/85 font-medium shadow text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-white mb-1">{submissions.length}</div>
          <div className="text-sm text-white/60">Total Scripts</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {submissions.filter(s => s.status === 'completed').length}
          </div>
          <div className="text-sm text-white/60">Completed</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {submissions.filter(s => s.status === 'processing').length}
          </div>
          <div className="text-sm text-white/60">Processing</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {submissions.reduce((sum, s) => sum + s.lines.length, 0)}
          </div>
          <div className="text-sm text-white/60">Total Lines</div>
        </div>
      </div>

      {submissionsToShow.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-white/60 font-medium gap-4">
          <FileText className="w-16 h-16 text-white/30" />
          <div className="text-2xl mb-2">
            {search ? 'No scripts found' : 'No scripts yet'}
          </div>
          <div className="text-base">
            {search ? 'Try a different search term.' : 'Submit your first script to get started!'}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 mt-4 overflow-y-auto">
        {submissionsToShow.map((submission, idx) => {
          const feedbackStats = getFeedbackStats(submission);
          return (
            <motion.div
              key={submission._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, type: "tween" }}
            >
              <button
                onClick={() => onSelectSession(submission)}
                className="w-full flex flex-col text-left bg-gradient-to-br from-purple-500/10 to-black/40 hover:from-purple-500/20 hover:to-black/70 rounded-xl border border-white/10 shadow-md p-6 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-bold text-lg text-white/90 line-clamp-2 mb-2">
                      {submission.script_text.length > 100 
                        ? `${submission.script_text.substring(0, 100)}...` 
                        : submission.script_text}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${getStatusColor(submission.status)}`}>
                    <span>{getStatusIcon(submission.status)}</span>
                    <span className="capitalize">{submission.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-purple-200">
                    <FileText className="w-4 h-4" />
                    <span>{submission.lines.length} lines</span>
                  </div>
                  
                  {submission.status === 'completed' && (
                    <div className="flex items-center gap-1 text-green-300">
                      <Star className="w-4 h-4" />
                      <span>{feedbackStats.rated}/{feedbackStats.total} rated</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-white/50 ml-auto">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(submission.submission_timestamp)}</span>
                  </div>
                </div>

                {submission.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-white/50 mb-1">Progress</div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-green-400 rounded-full transition-all duration-300"
                        style={{ width: `${(feedbackStats.rated / feedbackStats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
