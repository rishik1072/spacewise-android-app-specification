import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "./store/useAppStore";
import { BottomNav } from "./components/BottomNav";
import { HomeScreen } from "./screens/HomeScreen";
import { AppsScreen } from "./screens/AppsScreen";
import { FilesScreen } from "./screens/FilesScreen";
import { DuplicatesScreen } from "./screens/DuplicatesScreen";
import { InsightsScreen } from "./screens/InsightsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { AppDetailScreen } from "./screens/AppDetailScreen";
import { FileDetailScreen } from "./screens/FileDetailScreen";
import { DuplicateDetailScreen } from "./screens/DuplicateDetailScreen";
import { FileListScreen } from "./screens/FileListScreen";
import { CleanupReviewScreen } from "./screens/CleanupReviewScreen";
import { PrivacyScreen, AboutScreen, PermissionsScreen } from "./screens/InfoScreens";

function useThemeSync() {
  const appearance = useAppStore((s) => s.settings.appearance);
  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle("dark", dark);
    if (appearance === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const listener = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
    apply(appearance === "dark");
  }, [appearance]);
}

const TAB_SCREENS: Record<string, ReactNode> = {
  home: <HomeScreen />,
  apps: <AppsScreen />,
  files: <FilesScreen />,
  duplicates: <DuplicatesScreen />,
  insights: <InsightsScreen />,
  settings: <SettingsScreen />,
};

export default function App() {
  useThemeSync();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const activeTab = useAppStore((s) => s.activeTab);
  const overlayStack = useAppStore((s) => s.overlayStack);
  const topOverlay = overlayStack[overlayStack.length - 1];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-0 dark:bg-black sm:p-6">
      <div className="relative flex h-screen w-full max-w-md flex-col overflow-hidden bg-[#f4f5f8] text-slate-900 shadow-2xl dark:bg-[#0a0b0f] dark:text-white sm:h-[860px] sm:rounded-[2.5rem] sm:ring-8 sm:ring-black/5 dark:sm:ring-white/5">
        {!hasOnboarded ? (
          <OnboardingScreen />
        ) : (
          <>
            <div className="no-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <div className="h-full overflow-y-auto no-scrollbar pb-24">
                    {TAB_SCREENS[activeTab]}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <BottomNav />
            <AnimatePresence>
              {topOverlay?.type === "appDetail" && <AppDetailScreen key="appDetail" appId={topOverlay.appId} />}
              {topOverlay?.type === "fileDetail" && <FileDetailScreen key="fileDetail" fileId={topOverlay.fileId} />}
              {topOverlay?.type === "duplicateDetail" && (
                <DuplicateDetailScreen key="duplicateDetail" groupId={topOverlay.groupId} />
              )}
              {topOverlay?.type === "fileList" && (
                <FileListScreen key={`fileList-${topOverlay.filter}`} title={topOverlay.title} filter={topOverlay.filter} />
              )}
              {topOverlay?.type === "cleanupReview" && <CleanupReviewScreen key="cleanupReview" />}
              {topOverlay?.type === "privacy" && <PrivacyScreen key="privacy" />}
              {topOverlay?.type === "about" && <AboutScreen key="about" />}
              {topOverlay?.type === "permissions" && <PermissionsScreen key="permissions" />}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
