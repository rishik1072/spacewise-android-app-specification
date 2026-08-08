import type { AppInfo } from "../types/models";
import { formatBytes, formatDaysAgo } from "../engine/format";
import { Checkbox } from "./ui";
import { ShieldCheck } from "lucide-react";
import { cn } from "../utils/cn";

export function AppRow({
  app,
  onClick,
  selectable,
  selected,
  onToggle,
}: {
  app: AppInfo;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition active:bg-slate-100 dark:active:bg-white/5"
    >
      {selectable && <Checkbox checked={!!selected} onChange={() => onToggle?.()} />}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
        style={{ backgroundColor: `${app.color}22` }}
      >
        {app.glyph}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[14.5px] font-semibold text-slate-900 dark:text-white">{app.name}</p>
          {app.isSystemCritical && <ShieldCheck size={13} className="shrink-0 text-slate-400" />}
        </div>
        <p className="truncate text-[12px] text-slate-400 dark:text-white/40">
          {app.usageAvailable ? `Last used ${formatDaysAgo(app.lastUsedDaysAgo)}` : "Usage data unavailable"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[13.5px] font-semibold text-slate-800 dark:text-white/85">{formatBytes(app.sizeBytes)}</p>
        <p
          className={cn(
            "text-[11px] font-medium",
            app.category === "unused"
              ? "text-amber-500"
              : app.category === "frequently_used"
              ? "text-emerald-500"
              : "text-slate-400 dark:text-white/35"
          )}
        >
          {app.category === "frequently_used"
            ? "Frequent"
            : app.category === "occasionally_used"
            ? "Occasional"
            : app.category === "unused"
            ? "Unused"
            : "System"}
        </p>
      </div>
    </div>
  );
}
