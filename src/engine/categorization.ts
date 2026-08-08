import type { FileCategory } from "../types/models";

export const FILE_CATEGORY_META: Record<FileCategory, { label: string; icon: string; color: string }> = {
  image: { label: "Images", icon: "image", color: "#22c55e" },
  video: { label: "Videos", icon: "video", color: "#3b82f6" },
  audio: { label: "Audio", icon: "music", color: "#a855f7" },
  document: { label: "Documents", icon: "file-text", color: "#f59e0b" },
  archive: { label: "Archives", icon: "archive", color: "#f97316" },
  apk: { label: "APK Installers", icon: "package", color: "#ef4444" },
  screenshot: { label: "Screenshots", icon: "monitor", color: "#06b6d4" },
  recording: { label: "Screen Recordings", icon: "video", color: "#14b8a6" },
  other: { label: "Other Files", icon: "file", color: "#64748b" },
};

export const ALL_FILE_CATEGORIES: FileCategory[] = [
  "image", "video", "audio", "document", "archive", "apk", "screenshot", "recording", "other",
];
