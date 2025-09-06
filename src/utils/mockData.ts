// Mock data and helpers for demo workflows

// --- Types for clarity ---
export type VideoSuggestion = {
  id: string;
  title: string;
  thumbnail: string;
  durationSec: number;
  videoUrl: string;
};

// --- Demo video set ---
const baseVideos: Omit<VideoSuggestion, "title">[] = [
  {
    id: "v1",
    thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop",
    durationSec: 15,
    videoUrl: "https://example.com/clip1.mp4",
  },
  {
    id: "v2",
    thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop",
    durationSec: 22,
    videoUrl: "https://example.com/clip2.mp4",
  },
  {
    id: "v3",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
    durationSec: 18,
    videoUrl: "https://example.com/clip3.mp4",
  },
  {
    id: "v4",
    thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop",
    durationSec: 12,
    videoUrl: "https://example.com/clip4.mp4",
  },
  {
    id: "v5",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop",
    durationSec: 25,
    videoUrl: "https://example.com/clip5.mp4",
  },
];

// --- Demo video generator for a script line ---
export function makeMockLineVideos(line: string): VideoSuggestion[] {
  return baseVideos.map((vid, i) => ({
    ...vid,
    title: line.length > 10
      ? `${line.split(' ').slice(0, 2 + (i % 2)).join(' ')}`
      : `Scene clip ${i + 1}`,
  }));
}

// --- Demo sessions (latest first) ---
export function makeMockHistory() {
  return [
    {
      id: `${Date.now() - 86_400_000}`,
      script: "How to stay productive as a remote content creator\nIdeas for social video\nTips for editing efficiently",
      lines: [
        "How to stay productive as a remote content creator",
        "Ideas for social video",
        "Tips for editing efficiently",
      ],
      feedback: {
        1: { rating: 4, comment: "Solid visuals, need more diversity" }
      }
    },
    {
      id: `${Date.now() - 120_000_000}`,
      script: "Launching our new AI tool\nTeam collaboration in action",
      lines: [
        "Launching our new AI tool",
        "Team collaboration in action",
      ],
      feedback: {
        0: { rating: 5, comment: "Perfect match!" },
        1: { rating: 3, comment: "Team clips a bit generic" }
      }
    }
    // Ensure feedback only includes keys with valid feedback objects
    // feedback: { 1: { ... } }
  ];
}

// --- Default export for possible additional mocks
export default {
  makeMockLineVideos,
  makeMockHistory
};
