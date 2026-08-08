import type { FileInfo } from "../types/models";
import { formatBytes, formatDaysAgo } from "../engine/format";
import { FILE_CATEGORY_META } from "../engine/categorization";
import { Checkbox } from "./ui";
import {
  Image, Video, Music, FileText, Archive, Package, Monitor, File as FileIcon,
} from "lucide-react";

const ICONS: Record<string, typeof Image> = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  archive: Archive,
  apk: Package,
  screenshot: Monitor,
  recording: Video,
  other: FileIcon,
};

export function FileRow({
  file,
  onClick,
  selectable,
  selected,
  onToggle,
}: {
  file: FileInfo;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const meta = FILE_CATEGORY_META[file.category];
  const Icon = ICONS[file.category] ?? FileIcon;
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition active:bg-slate-100 dark:active:bg-white/5"
    >
      {selectable && <Checkbox checked={!!selected} onChange={() => onToggle?.()} />}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-slate-900 dark:text-white">{file.name}</p>
        <p className="truncate text-[12px] text-slate-400 dark:text-white/40">
          {meta.label} · {formatDaysAgo(file.modifiedDaysAgo)}
        </p>
      </div>
      <span className="shrink-0 text-[13.5px] font-semibold text-slate-800 dark:text-white/85">
        {formatBytes(file.sizeBytes)}
      </span>
    </div>
  );
}
