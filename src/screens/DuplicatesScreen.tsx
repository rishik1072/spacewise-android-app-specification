import { useAppStore } from "../store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { ScreenHeader, Card, EmptyState, SectionTitle } from "../components/ui";
import { formatBytes } from "../engine/format";
import { FILE_CATEGORY_META } from "../engine/categorization";
import { Copy, ChevronRight } from "lucide-react";

export function DuplicatesScreen() {
  const duplicates = useAppStore((s) => s.duplicates);
  const pushOverlay = useAppStore((s) => s.pushOverlay);

  const totalRecoverable = duplicates.reduce((s, g) => s + g.recoverableBytes, 0);

  return (
    <div className="px-4 pb-6 pt-6">
      <ScreenHeader title="Duplicates" subtitle="Grouped by size, type, and content fingerprint" />

      <Card className="flex items-center justify-between bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
        <div>
          <p className="text-[12.5px] font-medium text-white/70">Potential recovery</p>
          <p className="mt-1 text-[24px] font-bold">{formatBytes(totalRecoverable)}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <Copy size={22} />
        </div>
      </Card>

      <p className="mt-4 px-1 text-[12px] leading-relaxed text-slate-400 dark:text-white/35">
        SpaceWise never guesses which copy is your "original." Open a group to choose exactly which files to keep.
      </p>

      <SectionTitle>{duplicates.length} duplicate groups</SectionTitle>

      {duplicates.length === 0 ? (
        <EmptyState icon="✨" title="No duplicates found" description="Your files look unique based on the last scan." />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {duplicates.map((group, index) => {
              const meta = FILE_CATEGORY_META[group.category];
              return (
                <motion.div
                  key={group.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card
                    onClick={() => pushOverlay({ type: "duplicateDetail", groupId: group.id })}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
                    >
                      <Copy size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-semibold text-slate-900 dark:text-white">
                        {group.files.length} copies · {group.files[0].name}
                      </p>
                      <p className="text-[12px] text-slate-400 dark:text-white/40">
                        {meta.label} · {formatBytes(group.totalSizeBytes)} total
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="text-[13.5px] font-bold text-emerald-500">{formatBytes(group.recoverableBytes)}</span>
                      <ChevronRight size={16} className="text-slate-300 dark:text-white/25" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
