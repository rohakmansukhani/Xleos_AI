// src/components/script/VideoSelectionPanel.tsx
'use client';
import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Rating } from '@mui/material';
import { motion } from 'framer-motion';
import { Close, Download, PlayArrow } from '@mui/icons-material';

interface Video {
  id: string;
  youtube_video_id: string;
  title: string;
  youtube_url: string;
  thumbnail: string;
  duration: number;
  ranking_position: number;
  video_intelligence_score: number;
  average_rating: number;
  total_ratings: number;
}

interface Line {
  id: string;
  videos: Video[];
  text: string;
}

interface VideoSelectionPanelProps {
  line: Line;
  onCompleteAction: (feedback: { [videoId: string]: { rating: number; comment: string } }) => void;
  onCloseAction: () => void;
}

export default function VideoSelectionPanel({ line, onCompleteAction, onCloseAction }: VideoSelectionPanelProps) {
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [videoRatings, setVideoRatings] = useState<{ [key: string]: number }>({});
  const [videoComments, setVideoComments] = useState<{ [key: string]: string }>({});
  const [showFeedbackWarning, setShowFeedbackWarning] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleRating = async (video: Video, rating: number) => {
    setVideoRatings(prev => ({ ...prev, [video.id]: rating }));
    if (attemptedSubmit) setShowFeedbackWarning(false);
  };

  const handleCommentChange = (videoId: string, comment: string) => {
    setVideoComments(prev => ({ ...prev, [videoId]: comment }));
    if (attemptedSubmit) setShowFeedbackWarning(false);
  };

  const validateFeedback = () => {
    const allVideosRated = line.videos.every(video => videoRatings[video.id] > 0);
    const allVideosCommented = line.videos.every(video => 
      videoComments[video.id] && videoComments[video.id].trim().length > 0
    );
    return allVideosRated && allVideosCommented;
  };

  const handleComplete = () => {
    setAttemptedSubmit(true);
    
    if (!validateFeedback()) {
      setShowFeedbackWarning(true);
      return;
    }

    const feedback: { [videoId: string]: { rating: number; comment: string } } = {};
    line.videos.forEach(video => {
      feedback[video.id] = {
        rating: videoRatings[video.id],
        comment: videoComments[video.id]
      };
    });

    onCompleteAction(feedback);
  };

  const handleClose = () => {
    if (Object.keys(videoRatings).length > 0 || Object.keys(videoComments).length > 0) {
      setShowFeedbackWarning(true);
      return;
    }
    onCloseAction();
  };

  const handleDownload = async (video: Video) => {
    window.open(video.youtube_url, '_blank');
  };

  const handleGetEmbedUrl = async (video: Video) => {
    window.open(video.youtube_url, '_blank');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at 50% 45%,rgba(85,70,130,0.41) 0 65%,rgba(24,18,50,0.98) 90% 100%)",
        backdropFilter: "blur(14px) saturate(1.6)",
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 18, opacity: 0 }}
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          background: "linear-gradient(112deg,rgba(56,49,114,0.79) 0%,rgba(35,21,60,0.89) 100%)",
          border: "1.2px solid rgba(170,145,250,0.11)",
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: "0 10px 48px 3px rgba(80,60,140,0.12), 0 2px 16px 4px rgba(80,60,140,0.05)"
        }}
      >
        {/* Header */}
        <Box sx={{
          p: 3,
          borderBottom: '1px solid rgba(180,180,220,0.11)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: "linear-gradient(93deg,rgba(99,76,184,0.19) 0%,rgba(56,49,114,0.04) 100%)",
        }}>
          <Box>
            <Typography variant="h5" sx={{
              fontWeight: 700,
              letterSpacing: "-0.5px",
              background: "linear-gradient(90deg,#e5d9ff 35%,#b19bee 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Rate AI Stock Suggestions
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(210, 191, 255, 0.84)', mb: 1 }}>
              {line.text}
            </Typography>
            {showFeedbackWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(248, 113, 113, 0.2))",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  marginTop: "8px"
                }}
              >
                <Typography variant="body2" sx={{ color: '#fca5a5', fontWeight: 500 }}>
                  Please rate and comment on all 5 videos to help improve our AI model
                </Typography>
              </motion.div>
            )}
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Videos Grid */}
        <Box sx={{
          p: 3, pt: 3.5,
          maxHeight: 'calc(86vh - 220px)',
          overflowY: 'auto',
        }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: 2,
          }}>
            {line.videos.map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ scale: 1.022 }}
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
                style={{
                  background: selectedVideos.has(video.id)
                    ? "linear-gradient(90deg,rgba(119,90,255,0.19) 0%,rgba(180,160,240,0.11) 100%)"
                    : "rgba(255,255,255,0.06)",
                  border: selectedVideos.has(video.id)
                    ? '1.7px solid #af9efa'
                    : '1.2px solid rgba(190,180,230,0.12)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => handleVideoSelect(video.id)}
              >
                {/* Thumbnail */}
                <Box sx={{
                  width: '100%',
                  height: '170px',
                  backgroundImage: `url(${video.thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderTopLeftRadius: 16, borderTopRightRadius: 16,
                }}>
                  <Box sx={{
                    position: 'absolute', top: 10, right: 10,
                    background: "rgba(64, 54, 130, 0.64)",
                    color: 'white', px: 1.5, borderRadius: '5px', fontSize: '0.83rem',
                  }}>
                    {formatDuration(video.duration)}
                  </Box>
                  <IconButton
                    onClick={e => { e.stopPropagation(); handleGetEmbedUrl(video); }}
                    sx={{
                      position: "absolute", bottom: 14, right: 16,
                      background: "rgba(36,24,61,0.72)", color: "#fff",
                      "&:hover": { background: "rgba(50,32,99,0.87)" }
                    }}
                  >
                    <PlayArrow />
                  </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{ p: 2.2 }}>
                  <Typography variant="subtitle1" sx={{
                    color: 'white', mb: 1.2, fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                  }}>
                    {video.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#beabd8' }}>
                      AI Score: {video.video_intelligence_score.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#beabd8' }}>
                      Rank #{video.ranking_position}
                    </Typography>
                  </Box>

                  {/* Rating */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
                    <Rating
                      value={videoRatings[video.id] || video.average_rating}
                      onChange={(_, value) => { if (value) handleRating(video, value); }}
                      size="small"
                      sx={{
                        '& .MuiRating-iconFilled': { color: '#ffd700' },
                        '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.36)' },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#b3a5e1' }}>
                      ({videoRatings[video.id] || 0}/5)
                    </Typography>
                  </Box>

                  {/* Comment Field */}
                  <Box sx={{ mb: 1.2 }}>
                    <textarea
                      placeholder="Share your thoughts on this video..."
                      value={videoComments[video.id] || ''}
                      onChange={(e) => handleCommentChange(video.id, e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        border: attemptedSubmit && !videoComments[video.id]?.trim() 
                          ? '1px solid rgba(239, 68, 68, 0.5)' 
                          : '1px solid rgba(170,150,250,0.23)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(170,150,250,0.6)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = attemptedSubmit && !videoComments[video.id]?.trim()
                          ? 'rgba(239, 68, 68, 0.5)'
                          : 'rgba(170,150,250,0.23)';
                      }}
                    />
                    {attemptedSubmit && (!videoRatings[video.id] || !videoComments[video.id]?.trim()) && (
                      <Typography variant="caption" sx={{ color: '#ef4444', fontSize: '12px', mt: 0.5, display: 'block' }}>
                        {!videoRatings[video.id] && !videoComments[video.id]?.trim() 
                          ? 'Rating and comment required'
                          : !videoRatings[video.id] 
                          ? 'Rating required' 
                          : 'Comment required'}
                      </Typography>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={e => { e.stopPropagation(); handleDownload(video); }}
                      sx={{
                        color: '#baaaf7', borderColor: 'rgba(170,150,250,0.23)',
                        fontSize: '0.8rem',
                        '&:hover': { borderColor: '#d1c0fa', background: 'rgba(170,150,250,0.09)' },
                      }}
                      variant="outlined"
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{
          p: 3,
          borderTop: '1px solid rgba(190, 180, 230, 0.10)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: "linear-gradient(92deg,rgba(89,80,180,0.10),rgba(49,39,110,0.16))"
        }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#beb6e7', fontWeight: 400 }}>
              Feedback provided: {line.videos.filter(v => videoRatings[v.id] && videoComments[v.id]?.trim()).length}/{line.videos.length} videos
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '11px' }}>
              Rate and comment on all videos to continue
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleClose} sx={{ color: '#ad9fec', fontWeight: 500 }}>
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              variant="contained"
              disabled={!validateFeedback()}
              sx={{
                background: "linear-gradient(94deg,#7c5dfa 4%,#b998fb 97%)",
                color: 'white',
                fontWeight: 600,
                boxShadow: '0 2px 16px 0 #7a4ee9a8',
                borderRadius: '13px',
                '&:hover': { background: "linear-gradient(92deg,#9777fc 57%,#a986fb 95%)" },
                '&:disabled': {
                  background: 'rgba(180, 164, 230, 0.19)',
                  color: '#dedbec',
                  boxShadow: 'none'
                }
              }}
            >
              Done
            </Button>
          </Box>
        </Box>
      </motion.div>
    </motion.div>
  );
}
