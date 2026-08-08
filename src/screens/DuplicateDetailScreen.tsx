import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Sheet, ConfirmDialog } from "../components/Sheet";
import { ScreenHeader, Card, PrimaryButton } from "../components/ui";
import { formatBytes, formatDaysAgo } from "../engine/format";
import { Star } from "lucide-react";

export function DuplicateDetailScreen({ groupId }: { groupId: string }) {
  const group = useAppStore((s) => s.duplicates.find((g) => g.id === groupId));
  const popOverlay = useAppStore((s) => s.popOverlay);
  const removeFilesFromDevice = useAppStore((s) => s.removeFilesFromDevice);
  const [keepId, setKeepId] = useState<string | null>(group?.files[0]?.id ?? null);
  const [confirming, setConfirming] = useState(false);

  if (!group) {
    popOverlay();
    return null;
  }

  const toRemove = group.files.filter((f) => f.id !== keepId);
  const removeSize = toRemove.reduce((s, f) => s + f.sizeBytes, 0);

  return (
    <Sheet>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-32 pt-6">
        <ScreenHeader title="Duplicate group" subtitle={`${group.files.length} identical files found`} onBack={popOverlay} />

        <p className="mb-4 rounded-2xl bg-indigo-500/10 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-indigo-600 dark:text-indigo-400">
          Choose which copy to keep. SpaceWise will never decide this for you automatically.
        </p>

        <div className="flex flex-col gap-3">
          {group.files.map((file) => {
            const isKeep = keepId === file.id;
            return (
              <Card
                key={file.id}
                onClick={() => setKeepId(file.id)}
                className={isKeep ? "ring-2 ring-emerald-500" : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
                    {isKeep ? <Star className="text-emerald-500" size={18} fill="currentColor" /> : <Star className="text-slate-300 dark:text-white/20" size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-slate-900 dark:text-white">{file.name}</p>
                    <p className="truncate text-[12px] text-slate-400 dark:text-white/40">
                      {formatBytes(file.sizeBytes)} · Modified {formatDaysAgo(file.modifiedDaysAgo)}
                    </p>
                    <p className="truncate text-[11px] text-slate-300 dark:text-white/25">{file.path}</p>
                  </div>
                  {isKeep && (
                    <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Keep
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-slate-200/70 bg-white/90 p-4 backdrop-blur dark:border-white/[0.06] dark:bg-[#0a0b0f]/90">
        <PrimaryButton variant="danger" onClick={() => setConfirming(true)} disabled={toRemove.length === 0}>
          Remove {toRemove.length} copies · Free {formatBytes(removeSize)}
        </PrimaryButton>
      </div>

      <ConfirmDialog
        open={confirming}
        title={`Remove ${toRemove.length} duplicate copies?`}
        description="The copy you selected to keep will remain untouched. The rest will be moved to trash using Android's supported deletion mechanism."
        confirmLabel="Remove copies"
        danger
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          removeFilesFromDevice(toRemove.map((f) => f.id));
          setConfirming(false);
          popOverlay();
        }}
      />
    </Sheet>
  );
}
