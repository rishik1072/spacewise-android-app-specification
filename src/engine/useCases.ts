// ---------------------------------------------------------------------------
// SPACEWISE — Deterministic local use-case / engine layer
// (Phase 5-9, 12, 14-15). Pure functions operating on in-memory snapshots,
// exactly the shape that would run against real repositories on Android.
// ---------------------------------------------------------------------------

import type {
  AppInfo,
  CleanupRecommendation,
  CleanupScoreBreakdown,
  CleanupSettings,
  DuplicateGroup,
  FileInfo,
  StorageCategoryBreakdown,
  StorageSummary,
} from "../types/models";
import { FILE_CATEGORY_META } from "./categorization";
import { formatBytes } from "./format";

// ---------------------------- FILE FILTERS ----------------------------

export function findOldFiles(files: FileInfo[], thresholdDays: number): FileInfo[] {
  return files.filter((f) => f.modifiedDaysAgo >= thresholdDays);
}

export function findLargeFiles(files: FileInfo[], thresholdMB: number): FileInfo[] {
  const thresholdBytes = thresholdMB * 1024 * 1024;
  return files.filter((f) => f.sizeBytes >= thresholdBytes);
}

export function findApkFiles(files: FileInfo[]): FileInfo[] {
  return files.filter((f) => f.category === "apk");
}

export function findScreenshots(files: FileInfo[]): FileInfo[] {
  return files.filter((f) => f.category === "screenshot");
}

export function findRecordings(files: FileInfo[]): FileInfo[] {
  return files.filter((f) => f.category === "recording");
}

export function findDownloads(files: FileInfo[]): FileInfo[] {
  return files.filter((f) => f.isInDownloads);
}

export function findUnusedApps(apps: AppInfo[], thresholdDays: number): AppInfo[] {
  return apps.filter(
    (a) => !a.isSystemCritical && a.usageAvailable && a.lastUsedDaysAgo !== null && a.lastUsedDaysAgo >= thresholdDays
  );
}

// ---------------------------- DUPLICATE DETECTION ----------------------------

/**
 * Groups files by (size bucket + category) first — a cheap pre-filter — then
 * by simulated content fingerprint (contentHash), mirroring the recommended
 * "group by size+mime before expensive hashing" strategy. Only groups with
 * 2+ members are considered genuine duplicate sets.
 */
export function findDuplicates(files: FileInfo[]): DuplicateGroup[] {
  const preGroups = new Map<string, FileInfo[]>();
  for (const f of files) {
    const key = `${f.category}:${f.sizeBytes}`;
    if (!preGroups.has(key)) preGroups.set(key, []);
    preGroups.get(key)!.push(f);
  }

  const hashGroups = new Map<string, FileInfo[]>();
  for (const group of preGroups.values()) {
    if (group.length < 2) continue;
    for (const f of group) {
      if (!hashGroups.has(f.contentHash)) hashGroups.set(f.contentHash, []);
      hashGroups.get(f.contentHash)!.push(f);
    }
  }

  const result: DuplicateGroup[] = [];
  let idx = 0;
  for (const [hash, groupFiles] of hashGroups.entries()) {
    if (groupFiles.length < 2) continue;
    const sorted = [...groupFiles].sort((a, b) => a.modifiedDaysAgo - b.modifiedDaysAgo);
    const totalSizeBytes = sorted.reduce((s, f) => s + f.sizeBytes, 0);
    const recoverableBytes = totalSizeBytes - sorted[0].sizeBytes; // keep newest copy by default (user can change)
    result.push({
      id: `dupgroup-${idx++}-${hash}`,
      category: sorted[0].category,
      files: sorted,
      totalSizeBytes,
      recoverableBytes,
    });
  }
  return result.sort((a, b) => b.recoverableBytes - a.recoverableBytes);
}

// ---------------------------- STORAGE SUMMARY ----------------------------

export function buildStorageSummary(
  apps: AppInfo[],
  files: FileInfo[],
  totalBytes: number,
  freeBytes: number
): StorageSummary {
  const appsBytes = apps.reduce((s, a) => s + a.sizeBytes, 0);
  const byCategory = new Map<string, { size: number; count: number }>();
  for (const f of files) {
    const entry = byCategory.get(f.category) ?? { size: 0, count: 0 };
    entry.size += f.sizeBytes;
    entry.count += 1;
    byCategory.set(f.category, entry);
  }

  const usedBytes = Math.max(totalBytes - freeBytes, 0);
  const categories: StorageCategoryBreakdown[] = [];

  categories.push({
    category: "apps",
    label: "Applications",
    sizeBytes: appsBytes,
    count: apps.length,
    percent: (appsBytes / totalBytes) * 100,
  });

  for (const [cat, entry] of byCategory.entries()) {
    const meta = FILE_CATEGORY_META[cat as keyof typeof FILE_CATEGORY_META];
    categories.push({
      category: cat as any,
      label: meta?.label ?? cat,
      sizeBytes: entry.size,
      count: entry.count,
      percent: (entry.size / totalBytes) * 100,
    });
  }

  const systemBytes = Math.max(usedBytes - appsBytes - files.reduce((s, f) => s + f.sizeBytes, 0), 0);
  categories.push({
    category: "system",
    label: "System & Reserved",
    sizeBytes: systemBytes,
    count: 0,
    percent: (systemBytes / totalBytes) * 100,
  });

  categories.sort((a, b) => b.sizeBytes - a.sizeBytes);

  return {
    totalBytes,
    usedBytes,
    freeBytes,
    usedPercent: (usedBytes / totalBytes) * 100,
    categories,
    statsAvailable: true,
  };
}

// ---------------------------- RECOMMENDATION ENGINE ----------------------------

export function generateRecommendations(
  apps: AppInfo[],
  files: FileInfo[],
  duplicates: DuplicateGroup[],
  settings: CleanupSettings
): CleanupRecommendation[] {
  const recs: CleanupRecommendation[] = [];

  // Unused apps
  const unused = findUnusedApps(apps, settings.unusedAppThresholdDays);
  for (const app of unused) {
    const days = app.lastUsedDaysAgo ?? 0;
    const severity = days > 180 ? "green" : days > 90 ? "yellow" : "yellow";
    recs.push({
      id: `rec-app-${app.id}`,
      type: "unused_app",
      severity,
      title: `${app.name} looks unused`,
      reasoning: `You have not opened ${app.name} in ${days} days. Consider reviewing whether you still need it. (${formatBytes(app.sizeBytes)})`,
      sizeBytes: app.sizeBytes,
      itemType: "app",
      itemIds: [app.id],
    });
  }

  // High storage apps that are also rarely used
  const bigRarely = apps.filter(
    (a) => !a.isSystemCritical && a.sizeBytes > 500 * 1024 * 1024 && a.category !== "frequently_used"
  );
  for (const app of bigRarely) {
    recs.push({
      id: `rec-bigapp-${app.id}`,
      type: "high_storage_app",
      severity: "yellow",
      title: `${app.name} is using a lot of space`,
      reasoning: `${app.name} takes up ${formatBytes(app.sizeBytes)} and isn't used frequently. Review it if space is tight.`,
      sizeBytes: app.sizeBytes,
      itemType: "app",
      itemIds: [app.id],
    });
  }

  // Large files
  const largeFiles = findLargeFiles(files, settings.largeFileThresholdMB);
  for (const f of largeFiles) {
    recs.push({
      id: `rec-large-${f.id}`,
      type: "large_file",
      severity: f.sizeBytes > 1.5 * 1024 * 1024 * 1024 ? "yellow" : "green",
      title: `Large file: ${f.name}`,
      reasoning: `This file is ${formatBytes(f.sizeBytes)}, above your ${settings.largeFileThresholdMB} MB threshold. Large files are often worth a quick look.`,
      sizeBytes: f.sizeBytes,
      itemType: "file",
      itemIds: [f.id],
    });
  }

  // Old files (excluding ones already flagged as large, to avoid overly duplicating headline items — both lists remain available in Files tab)
  const oldFiles = findOldFiles(files, settings.oldFileThresholdDays);
  for (const f of oldFiles) {
    if (f.sizeBytes < 20 * 1024 * 1024) continue; // keep recommendation list meaningful; small old files are low priority
    recs.push({
      id: `rec-old-${f.id}`,
      type: "old_file",
      severity: "green",
      title: `Old file: ${f.name}`,
      reasoning: `Not modified in ${f.modifiedDaysAgo} days. Old does not necessarily mean unwanted — please review before removing.`,
      sizeBytes: f.sizeBytes,
      itemType: "file",
      itemIds: [f.id],
    });
  }

  // Old APKs, especially matched to installed apps
  const apks = findApkFiles(files).filter((f) => f.modifiedDaysAgo >= 30);
  for (const apk of apks) {
    const matched = apk.matchedPackage ? apps.find((a) => a.packageName === apk.matchedPackage) : undefined;
    recs.push({
      id: `rec-apk-${apk.id}`,
      type: "old_apk",
      severity: matched ? "green" : "yellow",
      title: `Installer file: ${apk.name}`,
      reasoning: matched
        ? `${matched.name} is already installed on your device. This APK may be an old installer that is no longer needed.`
        : `This APK installer hasn't been used in ${apk.modifiedDaysAgo} days and doesn't match a currently installed app.`,
      sizeBytes: apk.sizeBytes,
      itemType: "file",
      itemIds: [apk.id],
    });
  }

  // Old downloads
  const oldDownloads = findDownloads(files).filter((f) => f.modifiedDaysAgo >= 180 && f.category !== "apk");
  if (oldDownloads.length > 0) {
    const totalSize = oldDownloads.reduce((s, f) => s + f.sizeBytes, 0);
    recs.push({
      id: "rec-old-downloads",
      type: "old_download",
      severity: "green",
      title: `${oldDownloads.length} old downloads`,
      reasoning: `Your Downloads folder has ${oldDownloads.length} files (${formatBytes(totalSize)}) untouched for 6+ months.`,
      sizeBytes: totalSize,
      itemType: "file",
      itemIds: oldDownloads.map((f) => f.id),
    });
  }

  // Screenshot accumulation
  const screenshots = findScreenshots(files);
  if (screenshots.length >= 30) {
    const totalSize = screenshots.reduce((s, f) => s + f.sizeBytes, 0);
    recs.push({
      id: "rec-screenshots",
      type: "screenshot_accumulation",
      severity: "green",
      title: `${screenshots.length} screenshots taking up space`,
      reasoning: `Screenshots have accumulated to ${formatBytes(totalSize)}. Many screenshots are temporary and safe to review together.`,
      sizeBytes: totalSize,
      itemType: "file",
      itemIds: screenshots.map((f) => f.id),
    });
  }

  // Screen recordings
  const recordings = findRecordings(files);
  if (recordings.length > 0) {
    const totalSize = recordings.reduce((s, f) => s + f.sizeBytes, 0);
    recs.push({
      id: "rec-recordings",
      type: "screen_recording",
      severity: "yellow",
      title: `${recordings.length} screen recordings`,
      reasoning: `Screen recordings are using ${formatBytes(totalSize)}. These are often large and only needed temporarily.`,
      sizeBytes: totalSize,
      itemType: "file",
      itemIds: recordings.map((f) => f.id),
    });
  }

  // Duplicates
  for (const group of duplicates) {
    if (group.recoverableBytes <= 0) continue;
    recs.push({
      id: `rec-dup-${group.id}`,
      type: "duplicate",
      severity: "green",
      title: `${group.files.length} duplicate ${FILE_CATEGORY_META[group.category].label.toLowerCase()}`,
      reasoning: `These files appear to be identical copies. Keeping one and removing the rest could recover ${formatBytes(group.recoverableBytes)}. You choose which copy to keep.`,
      sizeBytes: group.recoverableBytes,
      itemType: "duplicate",
      itemIds: [group.id],
    });
  }

  // Critical / system apps must never be recommended — safety guard
  return recs
    .filter((r) => {
      if (r.itemType !== "app") return true;
      const app = apps.find((a) => a.id === r.itemIds[0]);
      return app && !app.isSystemCritical;
    })
    .sort((a, b) => b.sizeBytes - a.sizeBytes);
}

// ---------------------------- CLEANUP SCORE ----------------------------

export function computeCleanupScore(
  summary: StorageSummary,
  apps: AppInfo[],
  files: FileInfo[],
  duplicates: DuplicateGroup[],
  settings: CleanupSettings
): CleanupScoreBreakdown {
  let score = 100;
  const factors: { label: string; impact: number; detail: string }[] = [];

  // Storage utilization
  const utilizationPenalty = Math.max(0, Math.round((summary.usedPercent - 60) * 0.6));
  if (utilizationPenalty > 0) {
    score -= utilizationPenalty;
    factors.push({
      label: "Storage utilization",
      impact: -utilizationPenalty,
      detail: `${summary.usedPercent.toFixed(0)}% of storage is in use.`,
    });
  }

  // Unused apps
  const unused = findUnusedApps(apps, settings.unusedAppThresholdDays);
  const unusedPenalty = Math.min(20, unused.length * 2);
  if (unusedPenalty > 0) {
    score -= unusedPenalty;
    factors.push({
      label: "Unused applications",
      impact: -unusedPenalty,
      detail: `${unused.length} apps unused for ${settings.unusedAppThresholdDays}+ days.`,
    });
  }

  // Large files
  const large = findLargeFiles(files, settings.largeFileThresholdMB);
  const largePenalty = Math.min(15, large.length * 2);
  if (largePenalty > 0) {
    score -= largePenalty;
    factors.push({
      label: "Large files",
      impact: -largePenalty,
      detail: `${large.length} files over ${settings.largeFileThresholdMB} MB.`,
    });
  }

  // Old files
  const old = findOldFiles(files, settings.oldFileThresholdDays);
  const oldPenalty = Math.min(15, Math.round(old.length / 4));
  if (oldPenalty > 0) {
    score -= oldPenalty;
    factors.push({
      label: "Old files",
      impact: -oldPenalty,
      detail: `${old.length} files untouched for ${settings.oldFileThresholdDays}+ days.`,
    });
  }

  // Duplicates
  const dupBytes = duplicates.reduce((s, g) => s + g.recoverableBytes, 0);
  const dupPenalty = Math.min(15, Math.round(dupBytes / (200 * 1024 * 1024)));
  if (dupPenalty > 0) {
    score -= dupPenalty;
    factors.push({
      label: "Duplicate files",
      impact: -dupPenalty,
      detail: `${formatBytes(dupBytes)} recoverable from ${duplicates.length} duplicate groups.`,
    });
  }

  // Downloads accumulation
  const downloads = findDownloads(files);
  const downloadsBytes = downloads.reduce((s, f) => s + f.sizeBytes, 0);
  const downloadsPenalty = Math.min(10, Math.round(downloadsBytes / (500 * 1024 * 1024)));
  if (downloadsPenalty > 0) {
    score -= downloadsPenalty;
    factors.push({
      label: "Downloads folder",
      impact: -downloadsPenalty,
      detail: `Downloads contains ${formatBytes(downloadsBytes)}.`,
    });
  }

  // APK accumulation
  const apks = findApkFiles(files);
  const apkPenalty = Math.min(10, apks.length);
  if (apkPenalty > 0) {
    score -= apkPenalty;
    factors.push({
      label: "APK installers",
      impact: -apkPenalty,
      detail: `${apks.length} installer files found.`,
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label = "Excellent";
  if (score < 40) label = "Needs attention";
  else if (score < 60) label = "Fair";
  else if (score < 80) label = "Good";

  return { score, label, factors: factors.sort((a, b) => a.impact - b.impact) };
}
