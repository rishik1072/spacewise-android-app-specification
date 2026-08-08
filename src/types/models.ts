// ---------------------------------------------------------------------------
// SPACEWISE — Domain Models
// Mirrors the domain layer of the Android specification (Phase 22).
// ---------------------------------------------------------------------------

export type AppUsageBucket =
  | "frequently_used"
  | "occasionally_used"
  | "unused"
  | "system";

export interface AppInfo {
  id: string;
  name: string;
  packageName: string;
  versionName: string;
  glyph: string; // stand-in for a launcher icon (emoji/letter), no real icon extraction possible in a browser
  color: string;
  sizeBytes: number;
  isSystemCritical: boolean;
  installedAtDaysAgo: number;
  lastUsedDaysAgo: number | null; // null = usage data unavailable
  usageAvailable: boolean;
  category: AppUsageBucket;
  opensPerWeek: number;
}

export type FileCategory =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "archive"
  | "apk"
  | "screenshot"
  | "recording"
  | "other";

export interface FileInfo {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  category: FileCategory;
  mimeType: string;
  modifiedDaysAgo: number;
  isInDownloads: boolean;
  contentHash: string; // simulated content fingerprint used for duplicate grouping
  matchedPackage?: string; // for APKs — matched installed package
}

export interface DuplicateGroup {
  id: string;
  category: FileCategory;
  files: FileInfo[];
  totalSizeBytes: number;
  recoverableBytes: number; // total - largest single copy kept
}

export interface StorageCategoryBreakdown {
  category: FileCategory | "apps" | "system" | "free";
  label: string;
  sizeBytes: number;
  count: number;
  percent: number;
}

export interface StorageSummary {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usedPercent: number;
  categories: StorageCategoryBreakdown[];
  statsAvailable: boolean;
}

export type RecommendationSeverity = "green" | "yellow" | "red";

export type RecommendationType =
  | "unused_app"
  | "large_file"
  | "old_file"
  | "duplicate"
  | "old_apk"
  | "old_download"
  | "screenshot_accumulation"
  | "screen_recording"
  | "high_storage_app";

export interface CleanupRecommendation {
  id: string;
  type: RecommendationType;
  severity: RecommendationSeverity;
  title: string;
  reasoning: string;
  sizeBytes: number;
  itemType: "app" | "file" | "duplicate";
  itemIds: string[];
}

export interface ScanResult {
  scannedAt: number;
  appsScanned: number;
  filesScanned: number;
  durationMs: number;
}

export type ThresholdDays = 30 | 60 | 90 | 180 | 365;
export type LargeFileThresholdMB = 100 | 500 | 1000 | 2000;

export interface CleanupSettings {
  appearance: "light" | "dark" | "system";
  unusedAppThresholdDays: ThresholdDays;
  oldFileThresholdDays: ThresholdDays;
  largeFileThresholdMB: LargeFileThresholdMB;
  scanOnLaunch: boolean;
  usageAccessGranted: boolean;
  storageAccessGranted: boolean;
}

export interface CleanupScoreBreakdown {
  score: number;
  label: string;
  factors: { label: string; impact: number; detail: string }[];
}
