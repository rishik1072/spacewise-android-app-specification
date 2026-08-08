import { useMemo, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Sheet, ConfirmDialog } from "../components/Sheet";
import { ScreenHeader, Card, PrimaryButton, EmptyState, Checkbox } from "../components/ui";
import { RecommendationCard } from "../components/RecommendationCard";
import { formatBytes } from "../engine/format";
import type { RecommendationType } from "../types/models";

const TYPE_LABELS: Record<RecommendationType, string> = {
  unused_app: "Unused applications",
  large_file: "Large files",
  old_file: "Old files",
  duplicate: "Duplicate files",
  old_apk: "APK installers",
  old_download: "Old downloads",
  screenshot_accumulation: "Screenshots",
  screen_recording: "Screen recordings",
  high_storage_app: "High storage apps",
};

export function CleanupReviewScreen() {
  const recommendations = useAppStore((s) => s.recommendations);
  const duplicates = useAppStore((s) => s.duplicates);
  const popOverlay = useAppStore((s) => s.popOverlay);
  const removeFilesFromDevice = useAppStore((s) => s.removeFilesFromDevice);
  const uninstallApp = useAppStore((s) => s.uninstallApp);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [expandedType, setExpandedType] = useState<RecommendationType | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<RecommendationType, typeof recommendations>();
    for (const r of recommendations) {
      if (!map.has(r.type)) map.set(r.type, []);
      map.get(r.type)!.push(r);
    }
    return map;
  }, [recommendations]);

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleGroup = (type: RecommendationType) => {
    const ids = (grouped.get(type) ?? []).map((r) => r.id);
    const allChecked = ids.every((id) => checked.has(id));
    setChecked((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allChecked ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const selectedRecs = recommendations.filter((r) => checked.has(r.id));
  const selectedSize = selectedRecs.reduce((s, r) => s + r.sizeBytes, 0);

  const performCleanup = () => {
    const fileIds = new Set<string>();
    const appIds = new Set<string>();
    for (const rec of selectedRecs) {
      if (rec.itemType === "app") rec.itemIds.forEach((id) => appIds.add(id));
      else if (rec.itemType === "file") rec.itemIds.forEach((id) => fileIds.add(id));
      else if (rec.itemType === "duplicate") {
        const group = duplicates.find((g) => g.id === rec.itemIds[0]);
        if (group) group.files.slice(1).forEach((f) => fileIds.add(f.id));
      }
    }
    appIds.forEach((id) => uninstallApp(id));
    if (fileIds.size > 0) removeFilesFromDevice(Array.from(fileIds));
    setChecked(new Set());
    setConfirming(false);
    popOverlay();
  };

  return (
    <Sheet>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-32 pt-6">
        <ScreenHeader
          title="Cleanup review"
          subtitle="Nothing is removed until you confirm below"
          onBack={popOverlay}
        />

        {recommendations.length === 0 ? (
          <EmptyState icon="🎉" title="Nothing to review" description="No cleanup recommendations right now." />
        ) : (
          Array.from(grouped.entries()).map(([type, recs]) => {
            const groupSize = recs.reduce((s, r) => s + r.sizeBytes, 0);
            const allChecked = recs.every((r) => checked.has(r.id));
            const expanded = expandedType === type;
            return (
              <div key={type} className="mb-4">
                <Card className="flex items-center gap-3">
                  <Checkbox checked={allChecked} onChange={() => toggleGroup(type)} />
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => setExpandedType(expanded ? null : type)}
                  >
                    <p className="text-[14.5px] font-semibold text-slate-900 dark:text-white">{TYPE_LABELS[type]}</p>
                    <p className="text-[12px] text-slate-400 dark:text-white/40">{recs.length} items</p>
                  </div>
                  <span className="shrink-0 text-[13.5px] font-bold text-indigo-500">{formatBytes(groupSize)}</span>
                </Card>
                {expanded && (
                  <div className="mt-2 flex flex-col gap-2 pl-2">
                    {recs.map((rec) => (
                      <RecommendationCard key={rec.id} rec={rec} selected={checked.has(rec.id)} onClick={() => toggle(rec.id)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedRecs.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200/70 bg-white/90 p-4 backdrop-blur dark:border-white/[0.06] dark:bg-[#0a0b0f]/90">
          <PrimaryButton variant="danger" onClick={() => setConfirming(true)}>
            Review &amp; clean {selectedRecs.length} items · {formatBytes(selectedSize)}
          </PrimaryButton>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title="Confirm cleanup"
        description={`You are about to act on ${selectedRecs.length} items totaling ${formatBytes(
          selectedSize
        )}. Apps will be uninstalled using Android's standard flow; files will be moved to trash. This cannot be started without this confirmation.`}
        confirmLabel="Confirm cleanup"
        danger
        onCancel={() => setConfirming(false)}
        onConfirm={performCleanup}
      />
    </Sheet>
  );
}
