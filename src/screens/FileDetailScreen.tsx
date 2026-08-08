import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Sheet, ConfirmDialog } from "../components/Sheet";
import { ScreenHeader, Card, PrimaryButton, StatRow } from "../components/ui";
import { formatBytes, formatDate, formatDaysAgo } from "../engine/format";
import { FILE_CATEGORY_META } from "../engine/categorization";
import { Calendar, Tag, MapPin, FileType, Info } from "lucide-react";

export function FileDetailScreen({ fileId }: { fileId: string }) {
  const file = useAppStore((s) => s.files.find((f) => f.id === fileId));
  const apps = useAppStore((s) => s.apps);
  const popOverlay = useAppStore((s) => s.popOverlay);
  const removeFilesFromDevice = useAppStore((s) => s.removeFilesFromDevice);
  const [confirming, setConfirming] = useState(false);

  if (!file) {
    popOverlay();
    return null;
  }

  const meta = FILE_CATEGORY_META[file.category];
  const matchedApp = file.matchedPackage ? apps.find((a) => a.packageName === file.matchedPackage) : undefined;
  const isImagePreview = file.category === "image" || file.category === "screenshot";

  return (
    <Sheet>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-32 pt-6">
        <ScreenHeader title="File details" onBack={popOverlay} />

        <Card className="flex flex-col items-center py-8 text-center">
          {isImagePreview ? (
            <div
              className="mb-3 flex h-24 w-24 items-center justify-center rounded-3xl text-3xl"
              style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
            >
              🖼️
            </div>
          ) : (
            <div
              className="mb-3 flex h-20 w-20 items-center justify-center rounded-3xl text-2xl"
              style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
            >
              📄
            </div>
          )}
          <p className="max-w-[260px] break-words text-[15.5px] font-bold text-slate-900 dark:text-white">{file.name}</p>
          <p className="mt-1 text-[13px] text-slate-400 dark:text-white/40">{formatBytes(file.sizeBytes)}</p>
          <p className="mt-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-400 dark:bg-white/5 dark:text-white/40">
            Preview not available in this demo environment
          </p>
        </Card>

        <Card className="mt-4">
          <StatRow icon={<Tag size={16} />} label="Category" value={meta.label} />
          <div className="h-px bg-slate-100 dark:bg-white/[0.05]" />
          <StatRow icon={<FileType size={16} />} label="MIME type" value={file.mimeType} />
          <div className="h-px bg-slate-100 dark:bg-white/[0.05]" />
          <StatRow
            icon={<Calendar size={16} />}
            label="Last modified"
            value={formatDaysAgo(file.modifiedDaysAgo)}
            hint={formatDate(file.modifiedDaysAgo)}
          />
          <div className="h-px bg-slate-100 dark:bg-white/[0.05]" />
          <StatRow icon={<MapPin size={16} />} label="Location" value={file.path.split("/").slice(0, -1).pop() || "/"} />
        </Card>

        {matchedApp && (
          <Card className="mt-4 flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0 text-indigo-500" />
            <p className="text-[13px] leading-relaxed text-slate-600 dark:text-white/55">
              This matches the installed app <strong>{matchedApp.name}</strong>. It may be an old installer file that
              is no longer needed since the app is already installed.
            </p>
          </Card>
        )}

        <p className="mt-5 break-all px-1 text-center text-[11px] text-slate-300 dark:text-white/20">{file.path}</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex gap-3 border-t border-slate-200/70 bg-white/90 p-4 backdrop-blur dark:border-white/[0.06] dark:bg-[#0a0b0f]/90">
        <PrimaryButton variant="ghost" onClick={popOverlay}>
          Keep
        </PrimaryButton>
        <PrimaryButton variant="danger" onClick={() => setConfirming(true)}>
          Move to trash
        </PrimaryButton>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Move this file to trash?"
        description={`"${file.name}" will be moved using Android's supported trash mechanism, giving you a chance to recover it before permanent deletion.`}
        confirmLabel="Move to trash"
        danger
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          removeFilesFromDevice([file.id]);
          setConfirming(false);
          popOverlay();
        }}
      />
    </Sheet>
  );
}
