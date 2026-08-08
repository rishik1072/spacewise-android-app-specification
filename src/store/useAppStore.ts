import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppInfo,
  CleanupRecommendation,
  CleanupScoreBreakdown,
  CleanupSettings,
  DuplicateGroup,
  FileInfo,
  ScanResult,
  StorageSummary,
} from "../types/models";
import DeviceScanner from "../engine/nativeScanner";
import {
  buildStorageSummary,
  computeCleanupScore,
  findDuplicates,
  generateRecommendations,
} from "../engine/useCases";

export type TabKey = "home" | "apps" | "files" | "duplicates" | "insights" | "settings";
export type OverlayView =
  | { type: "none" }
  | { type: "appDetail"; appId: string }
  | { type: "fileDetail"; fileId: string }
  | { type: "duplicateDetail"; groupId: string }
  | { type: "cleanupReview" }
  | { type: "privacy" }
  | { type: "about" }
  | { type: "permissions" }
  | { type: "fileList"; title: string; filter: "old" | "large" | "apk" | "downloads" | "screenshots" | "recordings" | string };

type ScanState = "idle" | "scanning" | "done";

interface SettingsSlice {
  settings: CleanupSettings;
  updateSettings: (partial: Partial<CleanupSettings>) => void;
}

interface DeviceDataSlice {
  apps: AppInfo[];
  files: FileInfo[];
  totalBytes: number;
  storageSummary: StorageSummary | null;
  duplicates: DuplicateGroup[];
  recommendations: CleanupRecommendation[];
  cleanupScore: CleanupScoreBreakdown | null;
  lastScan: ScanResult | null;
  scanState: ScanState;
  scanProgress: number;
  hasOnboarded: boolean;
  runScan: () => Promise<void>;
  recomputeDerived: () => void;
  setOnboarded: (v: boolean) => void;
}

interface SelectionSlice {
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  selectMany: (ids: string[]) => void;
  deselectMany: (ids: string[]) => void;
  clearSelection: () => void;
  removeFilesFromDevice: (fileIds: string[]) => void;
  uninstallApp: (appId: string) => void;
}

interface NavSlice {
  activeTab: TabKey;
  overlayStack: OverlayView[];
  setTab: (tab: TabKey) => void;
  pushOverlay: (view: OverlayView) => void;
  popOverlay: () => void;
  closeAllOverlays: () => void;
}

type Store = SettingsSlice & DeviceDataSlice & SelectionSlice & NavSlice;

const DEFAULT_SETTINGS: CleanupSettings = {
  appearance: "dark",
  unusedAppThresholdDays: 90,
  oldFileThresholdDays: 180,
  largeFileThresholdMB: 500,
  scanOnLaunch: true,
  usageAccessGranted: true,
  storageAccessGranted: true,
};

// Removing snapshot cache as we use real data now

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      // ---------------- Settings ----------------
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) => {
        set((s) => ({ settings: { ...s.settings, ...partial } }));
        get().recomputeDerived();
      },

      // ---------------- Device data ----------------
      apps: [],
      files: [],
      totalBytes: 0,
      storageSummary: null,
      duplicates: [],
      recommendations: [],
      cleanupScore: null,
      lastScan: null,
      scanState: "idle",
      scanProgress: 0,
      hasOnboarded: false,
      setOnboarded: (v) => set({ hasOnboarded: v }),

      runScan: async () => {
        set({ scanState: "scanning", scanProgress: 0 });
        const totalSteps = 24;
        for (let step = 1; step <= totalSteps; step++) {
          await new Promise((r) => setTimeout(r, 28));
          set({ scanProgress: Math.round((step / totalSteps) * 100) });
        }
        const start = Date.now();
        
        try {
          const { apps } = await DeviceScanner.scanApps();
          const { files } = await DeviceScanner.scanFiles();
          
          set({
            apps: apps || [],
            files: files || [],
            totalBytes: 128 * 1024 * 1024 * 1024, // Assuming 128GB device for now, could be fetched natively
          });
          get().recomputeDerived();
          set({
            scanState: "done",
            lastScan: {
              scannedAt: Date.now(),
              appsScanned: (apps || []).length,
              filesScanned: (files || []).length,
              durationMs: Date.now() - start + totalSteps * 28,
            },
          });
        } catch (error) {
          console.error("Native scan failed:", error);
          set({ scanState: "idle" });
        }
      },

      recomputeDerived: () => {
        const { apps, files, totalBytes, settings } = get();
        if (apps.length === 0 && files.length === 0) return;
        const usedByAppsAndFiles = apps.reduce((s, a) => s + a.sizeBytes, 0) + files.reduce((s, f) => s + f.sizeBytes, 0);
        // Calculate free bytes (mock logic for now since we hardcoded 128GB)
        const freeBytes = totalBytes > usedByAppsAndFiles ? totalBytes - usedByAppsAndFiles - (20 * 1024 * 1024 * 1024) : 0;
        const summary = buildStorageSummary(apps, files, totalBytes, freeBytes);
        const duplicates = findDuplicates(files);
        const recommendations = generateRecommendations(apps, files, duplicates, settings);
        const cleanupScore = computeCleanupScore(summary, apps, files, duplicates, settings);
        set({ storageSummary: summary, duplicates, recommendations, cleanupScore });
      },

      // ---------------- Selection & destructive actions ----------------
      selectedIds: new Set<string>(),
      toggleSelection: (id) =>
        set((s) => {
          const next = new Set(s.selectedIds);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { selectedIds: next };
        }),
      selectMany: (ids) =>
        set((s) => {
          const next = new Set(s.selectedIds);
          ids.forEach((id) => next.add(id));
          return { selectedIds: next };
        }),
      deselectMany: (ids) =>
        set((s) => {
          const next = new Set(s.selectedIds);
          ids.forEach((id) => next.delete(id));
          return { selectedIds: next };
        }),
      clearSelection: () => set({ selectedIds: new Set() }),

      removeFilesFromDevice: (fileIds) => {
        set((s) => ({
          files: s.files.filter((f) => !fileIds.includes(f.id)),
        }));
        const next = new Set(get().selectedIds);
        fileIds.forEach((id) => next.delete(id));
        set({ selectedIds: next });
        get().recomputeDerived();
      },

      uninstallApp: (appId) => {
        set((s) => ({ apps: s.apps.filter((a) => a.id !== appId) }));
        const next = new Set(get().selectedIds);
        next.delete(appId);
        set({ selectedIds: next });
        get().recomputeDerived();
      },

      // ---------------- Navigation ----------------
      activeTab: "home",
      overlayStack: [],
      setTab: (tab) => set({ activeTab: tab, overlayStack: [] }),
      pushOverlay: (view) => set((s) => ({ overlayStack: [...s.overlayStack, view] })),
      popOverlay: () => set((s) => ({ overlayStack: s.overlayStack.slice(0, -1) })),
      closeAllOverlays: () => set({ overlayStack: [] }),
    }),
    {
      name: "spacewise-storage",
      partialize: (s) => ({ settings: s.settings, hasOnboarded: s.hasOnboarded }),
    }
  )
);
