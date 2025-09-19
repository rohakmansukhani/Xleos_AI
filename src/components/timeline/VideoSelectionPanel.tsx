// src/components/script/VideoSelectionPanel.tsx
"use client";
import React, { useState } from "react";
import { Box, Typography, IconButton, Button, Rating } from "@mui/material";
import { motion } from "framer-motion";
import { Close, Download, PlayArrow } from "@mui/icons-material";
import { chatApi } from "@/lib/api";
import { BackendVideo, BackendLine } from "@/types/auth";
import { toast } from "react-toastify";

// Helper function to format timestamps
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Backend-compatible interfaces
interface VideoSelectionPanelProps {
  line: BackendLine;
  submissionId: string;
  lineIndex: number; // 0-based index for the line
  onCompleteAction: (feedback: {
    [videoIndex: number]: { rating: number; comment: string };
  }) => void;
  onCloseAction: () => void;
}

export default function VideoSelectionPanel({
  line,
  submissionId,
  onCompleteAction,
  onCloseAction,
}: VideoSelectionPanelProps) {
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [videoRatings, setVideoRatings] = useState<{
    [videoIndex: number]: number;
  }>({});
  const [videoComments, setVideoComments] = useState<{
    [videoIndex: number]: string;
  }>({});
  const [showFeedbackWarning, setShowFeedbackWarning] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVideoSelect = (videoIndex: number) => {
    setSelectedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoIndex)) {
        newSet.delete(videoIndex);
      } else {
        newSet.add(videoIndex);
      }
      return newSet;
    });
  };

  const handleRating = async (videoIndex: number, rating: number) => {
    setVideoRatings((prev) => ({ ...prev, [videoIndex]: rating }));
    if (attemptedSubmit) setShowFeedbackWarning(false);
  };

  const handleCommentChange = (videoIndex: number, comment: string) => {
    setVideoComments((prev) => ({ ...prev, [videoIndex]: comment }));
    if (attemptedSubmit) setShowFeedbackWarning(false);
  };

  const validateFeedback = () => {
    const allVideosRated = line.videos.every(
      (_, index) => videoRatings[index] > 0,
    );
    const allVideosCommented = line.videos.every(
      (_, index) =>
        videoComments[index] && videoComments[index].trim().length > 0,
    );
    return allVideosRated && allVideosCommented;
  };

  const handleComplete = async () => {
    setAttemptedSubmit(true);

    if (!validateFeedback()) {
      setShowFeedbackWarning(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit feedback to backend for each video
      const feedbackPromises = line.videos.map(async (_, index) => {
        if (videoRatings[index] && videoComments[index]) {
          return chatApi.submitFeedback(submissionId, line.line_number, {
            video_index: index,
            rating: videoRatings[index],
            text: videoComments[index],
          });
        }
      });

      await Promise.all(feedbackPromises);

      // Prepare feedback for parent component
      const feedback: {
        [videoIndex: number]: { rating: number; comment: string };
      } = {};
      line.videos.forEach((_, index) => {
        if (videoRatings[index] && videoComments[index]) {
          feedback[index] = {
            rating: videoRatings[index],
            comment: videoComments[index],
          };
        }
      });

      toast.success("Feedback submitted successfully!");
      onCompleteAction(feedback);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (
      Object.keys(videoRatings).length > 0 ||
      Object.keys(videoComments).length > 0
    ) {
      setShowFeedbackWarning(true);
      return;
    }
    onCloseAction();
  };

  const handleDownload = async (video: BackendVideo) => {
    window.open(video.video_url, "_blank");
  };

  const handleGetEmbedUrl = async (video: BackendVideo) => {
    window.open(video.video_url, "_blank");
  };

  const formatDuration = (startTime?: number, endTime?: number) => {
    if (!startTime || !endTime) return "N/A";
    const duration = endTime - startTime;
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getThumbnail = (videoUrl: string) => {
    const videoId = extractVideoId(videoUrl);
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : "/default-video-thumbnail.jpg";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "radial-gradient(ellipse at 50% 45%,rgba(85,70,130,0.41) 0 65%,rgba(24,18,50,0.98) 90% 100%)",
        backdropFilter: "blur(14px) saturate(1.6)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 18, opacity: 0 }}
        style={{
          width: "100%",
          maxWidth: "1100px",
          maxHeight: "92vh",
          background:
            "linear-gradient(112deg,rgba(56,49,114,0.79) 0%,rgba(35,21,60,0.89) 100%)",
          border: "1.2px solid rgba(170,145,250,0.11)",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow:
            "0 10px 48px 3px rgba(80,60,140,0.12), 0 2px 16px 4px rgba(80,60,140,0.05)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid rgba(180,180,220,0.11)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              "linear-gradient(93deg,rgba(99,76,184,0.19) 0%,rgba(56,49,114,0.04) 100%)",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.5px",
                background: "linear-gradient(90deg,#e5d9ff 35%,#b19bee 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Rate AI Stock Suggestions
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(210, 191, 255, 0.84)", mb: 1 }}
            >
              Line {line.line_number}: {line.line_text}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(180, 170, 255, 0.7)" }}
            >
              Search phrase: &quot;{line.search_phrase}&quot;
            </Typography>
            {showFeedbackWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(248, 113, 113, 0.2))",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  marginTop: "8px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#fca5a5", fontWeight: 500 }}
                >
                  Please rate and comment on all videos to help improve our AI
                  model
                </Typography>
              </motion.div>
            )}
          </Box>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>

        {/* Videos Grid */}
        <Box
          sx={{
            p: 3,
            pt: 3.5,
            maxHeight: "calc(86vh - 220px)",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: 2,
            }}
          >
            {line.videos.map((video, videoIndex) => (
              <motion.div
                key={videoIndex}
                whileHover={{ scale: 1.022 }}
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
                style={{
                  background: selectedVideos.has(videoIndex)
                    ? "linear-gradient(90deg,rgba(119,90,255,0.19) 0%,rgba(180,160,240,0.11) 100%)"
                    : "rgba(255,255,255,0.06)",
                  border: selectedVideos.has(videoIndex)
                    ? "1.7px solid #af9efa"
                    : "1.2px solid rgba(190,180,230,0.12)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => handleVideoSelect(videoIndex)}
              >
                {/* Thumbnail */}
                <Box
                  sx={{
                    width: "100%",
                    height: "170px",
                    backgroundImage: `url(${getThumbnail(video.video_url)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "rgba(64, 54, 130, 0.64)",
                      color: "white",
                      px: 1.5,
                      borderRadius: "5px",
                      fontSize: "0.83rem",
                    }}
                  >
                    {formatDuration(video.start_timestamp, video.end_timestamp)}
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      background: "rgba(120, 93, 250, 0.8)",
                      color: "white",
                      px: 1,
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                    }}
                  >
                    Score: {video.relevance_score}
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetEmbedUrl(video);
                    }}
                    sx={{
                      position: "absolute",
                      bottom: 14,
                      right: 16,
                      background: "rgba(36,24,61,0.72)",
                      color: "#fff",
                      "&:hover": { background: "rgba(50,32,99,0.87)" },
                    }}
                  >
                    <PlayArrow />
                  </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{ p: 2.2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "white",
                      mb: 1.2,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {video.description || "AI-selected video clip"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#beabd8" }}>
                      {formatTime(video.start_timestamp)} -{" "}
                      {formatTime(video.end_timestamp)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#beabd8" }}>
                      Relevance: {video.relevance_score}%
                    </Typography>
                  </Box>

                  {/* Rating */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.2,
                    }}
                  >
                    <Rating
                      value={videoRatings[videoIndex] || 0}
                      onChange={(_, value) => {
                        if (value) handleRating(videoIndex, value);
                      }}
                      size="small"
                      sx={{
                        "& .MuiRating-iconFilled": { color: "#ffd700" },
                        "& .MuiRating-iconEmpty": {
                          color: "rgba(255,255,255,0.36)",
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: "#b3a5e1" }}>
                      ({videoRatings[videoIndex] || 0}/5)
                    </Typography>
                  </Box>

                  {/* Comment Field */}
                  <Box sx={{ mb: 1.2 }}>
                    <textarea
                      placeholder="Share your thoughts on this video..."
                      value={videoComments[videoIndex] || ""}
                      onChange={(e) =>
                        handleCommentChange(videoIndex, e.target.value)
                      }
                      style={{
                        width: "100%",
                        minHeight: "60px",
                        backgroundColor: "rgba(255,255,255,0.08)",
                        border:
                          attemptedSubmit && !videoComments[videoIndex]?.trim()
                            ? "1px solid rgba(239, 68, 68, 0.5)"
                            : "1px solid rgba(170,150,250,0.23)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        color: "white",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        resize: "vertical",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(170,150,250,0.6)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          attemptedSubmit && !videoComments[videoIndex]?.trim()
                            ? "rgba(239, 68, 68, 0.5)"
                            : "rgba(170,150,250,0.23)";
                      }}
                    />
                    {attemptedSubmit &&
                      (!videoRatings[videoIndex] ||
                        !videoComments[videoIndex]?.trim()) && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#ef4444",
                            fontSize: "12px",
                            mt: 0.5,
                            display: "block",
                          }}
                        >
                          {!videoRatings[videoIndex] &&
                          !videoComments[videoIndex]?.trim()
                            ? "Rating and comment required"
                            : !videoRatings[videoIndex]
                              ? "Rating required"
                              : "Comment required"}
                        </Typography>
                      )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(video);
                      }}
                      sx={{
                        color: "#baaaf7",
                        borderColor: "rgba(170,150,250,0.23)",
                        fontSize: "0.8rem",
                        "&:hover": {
                          borderColor: "#d1c0fa",
                          background: "rgba(170,150,250,0.09)",
                        },
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
        <Box
          sx={{
            p: 3,
            borderTop: "1px solid rgba(190, 180, 230, 0.10)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              "linear-gradient(92deg,rgba(89,80,180,0.10),rgba(49,39,110,0.16))",
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ color: "#beb6e7", fontWeight: 400 }}
            >
              Feedback provided:{" "}
              {
                line.videos.filter(
                  (_, i) => videoRatings[i] && videoComments[i]?.trim(),
                ).length
              }
              /{line.videos.length} videos
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#9ca3af", fontSize: "11px" }}
            >
              Rate and comment on all videos to continue
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={handleClose}
              sx={{ color: "#ad9fec", fontWeight: 500 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              variant="contained"
              disabled={!validateFeedback() || isSubmitting}
              sx={{
                background: "linear-gradient(94deg,#7c5dfa 4%,#b998fb 97%)",
                color: "white",
                fontWeight: 600,
                boxShadow: "0 2px 16px 0 #7a4ee9a8",
                borderRadius: "13px",
                "&:hover": {
                  background: "linear-gradient(92deg,#9777fc 57%,#a986fb 95%)",
                },
                "&:disabled": {
                  background: "rgba(180, 164, 230, 0.19)",
                  color: "#dedbec",
                  boxShadow: "none",
                },
              }}
            >
              {isSubmitting ? "Submitting..." : "Done"}
            </Button>
          </Box>
        </Box>
      </motion.div>
    </motion.div>
  );
}
