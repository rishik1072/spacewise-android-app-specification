import type { CleanupRecommendation } from "../types/models";
import { formatBytes } from "../engine/format";
import { Card, SeverityBadge } from "./ui";
import {
  AppWindow, Files, Clock, Copy, Package, Download, Monitor, Video, HardDrive,
} from "lucide-react";

const ICONS: Record<CleanupRecommendation["type"], typeof AppWindow> = {
  unused_app: AppWindow,
  large_file: Files,
  old_file: Clock,
  duplicate: Copy,
  old_apk: Package,
  old_download: Download,
  screenshot_accumulation: Monitor,
  screen_recording: Video,
  high_storage_app: HardDrive,
};

export function RecommendationCard({
  rec,
  onClick,
  selected,
}: {
  rec: CleanupRecommendation;
  onClick?: () => void;
  selected?: boolean;
}) {
  const Icon = ICONS[rec.type];
  return (
    <Card onClick={onClick} className={selected ? "ring-2 ring-indigo-500" : undefined}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Icon size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[14.5px] font-semibold text-slate-900 dark:text-white">{rec.title}</p>
            <span className="shrink-0 text-[13.5px] font-bold text-indigo-500">{formatBytes(rec.sizeBytes)}</span>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500 dark:text-white/45">{rec.reasoning}</p>
          <div className="mt-2">
            <SeverityBadge severity={rec.severity} />
          </div>
        </div>
      </div>
    </Card>
  );
}
