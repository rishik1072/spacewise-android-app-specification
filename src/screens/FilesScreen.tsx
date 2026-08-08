import { useAppStore } from "../store/useAppStore";
import { ScreenHeader, Card, SectionTitle } from "../components/ui";
import { formatBytes } from "../engine/format";
import {
  findApkFiles, findDownloads, findLargeFiles, findOldFiles, findRecordings, findScreenshots,
} from "../engine/useCases";
import { FILE_CATEGORY_META, ALL_FILE_CATEGORIES } from "../engine/categorization";
import { Clock, Gauge, Download, Package, Monitor, Video, ChevronRight, HardDrive } from "lucide-react";

export function FilesScreen() {
  const files = useAppStore((s) => s.files);
  const settings = useAppStore((s) => s.settings);
  const pushOverlay = useAppStore((s) => s.pushOverlay);

  const oldFiles = findOldFiles(files, settings.oldFileThresholdDays);
  const largeFiles = findLargeFiles(files, settings.largeFileThresholdMB);
  const apks = findApkFiles(files);
  const downloads = findDownloads(files);
  const screenshots = findScreenshots(files);
  const recordings = findRecordings(files);

  const smartTiles = [
    {
      key: "old", icon: Clock, color: "#f59e0b", title: "Old files",
      subtitle: `${oldFiles.length} files · ${settings.oldFileThresholdDays}+ days`,
      size: oldFiles.reduce((s, f) => s + f.sizeBytes, 0),
    },
    {
      key: "large", icon: Gauge, color: "#ef4444", title: "Large files",
      subtitle: `${largeFiles.length} files · over ${settings.largeFileThresholdMB} MB`,
      size: largeFiles.reduce((s, f) => s + f.sizeBytes, 0),
    },
    {
      key: "apk", icon: Package, color: "#a855f7", title: "APK installers",
      subtitle: `${apks.length} installer files`,
      size: apks.reduce((s, f) => s + f.sizeBytes, 0),
    },
    {
      key: "downloads", icon: Download, color: "#3b82f6", title: "Downloads",
      subtitle: `${downloads.length} files`,
      size: downloads.reduce((s, f) => s + f.sizeBytes, 0),
    },
    {
      key: "screenshots", icon: Monitor, color: "#06b6d4", title: "Screenshots",
      subtitle: `${screenshots.length} images`,
      size: screenshots.reduce((s, f) => s + f.sizeBytes, 0),
    },
    {
      key: "recordings", icon: Video, color: "#14b8a6", title: "Screen recordings",
      subtitle: `${recordings.length} videos`,
      size: recordings.reduce((s, f) => s + f.sizeBytes, 0),
    },
  ];

  return (
    <div className="px-4 pb-6 pt-6">
      <ScreenHeader title="Files" subtitle={`${files.length} files analyzed on this device`} />

      <SectionTitle>Smart categories</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {smartTiles.map((tile) => (
          <Card
            key={tile.key}
            onClick={() => pushOverlay({ type: "fileList", title: tile.title, filter: tile.key as any })}
            className="flex flex-col gap-2"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${tile.color}1f`, color: tile.color }}
            >
              <tile.icon size={18} />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white">{tile.title}</p>
              <p className="text-[11.5px] text-slate-400 dark:text-white/35">{tile.subtitle}</p>
            </div>
            <p className="text-[13px] font-bold text-indigo-500">{formatBytes(tile.size)}</p>
          </Card>
        ))}
      </div>

      <SectionTitle>By file type</SectionTitle>
      <Card className="divide-y divide-slate-100 dark:divide-white/[0.05]">
        {ALL_FILE_CATEGORIES.map((cat) => {
          const catFiles = files.filter((f) => f.category === cat);
          if (catFiles.length === 0) return null;
          const meta = FILE_CATEGORY_META[cat];
          const size = catFiles.reduce((s, f) => s + f.sizeBytes, 0);
          return (
            <div
              key={cat}
              onClick={() => pushOverlay({ type: "fileList", title: meta.label, filter: cat })}
              className="flex cursor-pointer items-center justify-between py-3 transition active:opacity-70"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
                >
                  <HardDrive size={15} />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-slate-800 dark:text-white/85">{meta.label}</p>
                  <p className="text-[11.5px] text-slate-400 dark:text-white/35">{catFiles.length} files</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white">{formatBytes(size)}</span>
                <ChevronRight size={16} className="text-slate-300 dark:text-white/25" />
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
