import { useMemo, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { ScreenHeader, Card, EmptyState, Pill, PrimaryButton } from "../components/ui";
import { FileRow } from "../components/FileRow";
import { formatBytes } from "../engine/format";
import {
  findApkFiles, findDownloads, findLargeFiles, findOldFiles, findRecordings, findScreenshots,
} from "../engine/useCases";
import type { FileCategory } from "../types/models";
import { Sheet, ConfirmDialog } from "../components/Sheet";
import { motion, AnimatePresence } from "framer-motion";

type SortMode = "newest" | "oldest" | "largest";

export function FileListScreen({ title, filter }: { title: string; filter: string }) {
  const files = useAppStore((s) => s.files);
  const settings = useAppStore((s) => s.settings);
  const popOverlay = useAppStore((s) => s.popOverlay);
  const pushOverlay = useAppStore((s) => s.pushOverlay);
  const selectedIds = useAppStore((s) => s.selectedIds);
  const toggleSelection = useAppStore((s) => s.toggleSelection);
  const removeFilesFromDevice = useAppStore((s) => s.removeFilesFromDevice);

  const [sort, setSort] = useState<SortMode>("largest");
  const [selecting, setSelecting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const baseList = useMemo(() => {
    switch (filter) {
      case "old": return findOldFiles(files, settings.oldFileThresholdDays);
      case "large": return findLargeFiles(files, settings.largeFileThresholdMB);
      case "apk": return findApkFiles(files);
      case "downloads": return findDownloads(files);
      case "screenshots": return findScreenshots(files);
      case "recordings": return findRecordings(files);
      default: return files.filter((f) => f.category === (filter as FileCategory));
    }
  }, [files, filter, settings]);

  const sorted = useMemo(() => {
    const list = [...baseList];
    if (sort === "newest") list.sort((a, b) => a.modifiedDaysAgo - b.modifiedDaysAgo);
    else if (sort === "oldest") list.sort((a, b) => b.modifiedDaysAgo - a.modifiedDaysAgo);
    else list.sort((a, b) => b.sizeBytes - a.sizeBytes);
    return list;
  }, [baseList, sort]);

  const selectedInList = sorted.filter((f) => selectedIds.has(f.id));
  const selectedSize = selectedInList.reduce((s, f) => s + f.sizeBytes, 0);
  const totalSize = sorted.reduce((s, f) => s + f.sizeBytes, 0);

  return (
    <Sheet>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-32 pt-6">
        <ScreenHeader
          title={title}
          subtitle={`${sorted.length} files · ${formatBytes(totalSize)} total`}
          onBack={popOverlay}
          right={
            <button
              onClick={() => setSelecting((v) => !v)}
              className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12.5px] font-semibold text-slate-600 dark:bg-white/[0.06] dark:text-white/70"
            >
              {selecting ? "Done" : "Select"}
            </button>
          }
        />

        <div className="mb-3 flex gap-2">
          <Pill active={sort === "largest"} onClick={() => setSort("largest")}>Largest</Pill>
          <Pill active={sort === "newest"} onClick={() => setSort("newest")}>Newest</Pill>
          <Pill active={sort === "oldest"} onClick={() => setSort("oldest")}>Oldest</Pill>
        </div>

        {filter === "old" && (
          <p className="mb-3 rounded-2xl bg-amber-500/10 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-600 dark:text-amber-400">
            Old does not necessarily mean unwanted. Please review before removing anything.
          </p>
        )}

        {sorted.length === 0 ? (
          <EmptyState icon="🗂️" title="Nothing here" description="No files matched this category during the last scan." />
        ) : (
          <Card className="divide-y divide-slate-100 dark:divide-white/[0.05]">
            <AnimatePresence mode="popLayout">
              {sorted.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <FileRow
                    file={file}
                    selectable={selecting}
                    selected={selectedIds.has(file.id)}
                    onToggle={() => toggleSelection(file.id)}
                    onClick={() => (selecting ? toggleSelection(file.id) : pushOverlay({ type: "fileDetail", fileId: file.id }))}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </Card>
        )}
      </div>

      <AnimatePresence>
        {selecting && selectedInList.length > 0 && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute inset-x-0 bottom-0 border-t border-slate-200/70 bg-white/90 p-4 backdrop-blur dark:border-white/[0.06] dark:bg-[#0a0b0f]/90"
          >
            <PrimaryButton variant="danger" onClick={() => setConfirming(true)}>
              Review &amp; remove {selectedInList.length} · {formatBytes(selectedSize)}
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirming}
        title={`Move ${selectedInList.length} files to trash?`}
        description="These files will be moved using Android's supported trash/delete mechanism. You can review each item before this happens. This action is not automatic — you explicitly chose these items."
        confirmLabel="Move to trash"
        danger
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          removeFilesFromDevice(selectedInList.map((f) => f.id));
          setConfirming(false);
          setSelecting(false);
        }}
      />
    </Sheet>
  );
}
