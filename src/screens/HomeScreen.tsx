import { motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { StorageRing } from "../components/StorageRing";
import { Card, PrimaryButton, SectionTitle, Skeleton, StatRow } from "../components/ui";
import { RecommendationCard } from "../components/RecommendationCard";
import { formatBytes } from "../engine/format";
import { Sparkles, HardDrive, Clock, ShieldCheck, ChevronRight, RefreshCcw } from "lucide-react";
import { FILE_CATEGORY_META } from "../engine/categorization";

export function HomeScreen() {
  const scanState = useAppStore((s) => s.scanState);
  const scanProgress = useAppStore((s) => s.scanProgress);
  const runScan = useAppStore((s) => s.runScan);
  const storageSummary = useAppStore((s) => s.storageSummary);
  const cleanupScore = useAppStore((s) => s.cleanupScore);
  const recommendations = useAppStore((s) => s.recommendations);
  const lastScan = useAppStore((s) => s.lastScan);
  const pushOverlay = useAppStore((s) => s.pushOverlay);
  const setTab = useAppStore((s) => s.setTab);

  const totalRecoverable = recommendations.reduce((s, r) => s + r.sizeBytes, 0);
  const topCategories = storageSummary?.categories.filter((c) => c.category !== "free").slice(0, 4) ?? [];

  if (scanState !== "done" || !storageSummary || !cleanupScore) {
    return (
      <div className="px-4 pb-6 pt-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-600/30">
            <Sparkles className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SpaceWise</h1>
          <p className="mt-1 text-[13.5px] text-slate-500 dark:text-white/45">Understand your phone. Reclaim your space.</p>
        </div>

        {scanState === "scanning" ? (
          <Card className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <Skeleton className="absolute inset-0 rounded-full" />
              <span className="relative text-lg font-bold text-indigo-500">{scanProgress}%</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-slate-800 dark:text-white/90">Analyzing your device…</p>
              <p className="mt-1 text-[13px] text-slate-400 dark:text-white/40">
                Checking apps, files, and storage categories locally. Nothing leaves your device.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-center gap-4 py-10 text-center">
            <ShieldCheck className="text-indigo-500" size={32} />
            <div>
              <p className="text-[15px] font-semibold text-slate-800 dark:text-white/90">Ready for your first scan</p>
              <p className="mt-1 max-w-[260px] text-[13px] text-slate-400 dark:text-white/40">
                SpaceWise analyzes apps and files entirely on-device to find storage worth reviewing.
              </p>
            </div>
            <PrimaryButton onClick={() => runScan()}>Start scan</PrimaryButton>
          </Card>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      className="px-4 pb-6 pt-6"
    >
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="mb-1 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-400 dark:text-white/40">Good to see you</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Your storage</h1>
        </div>
        <button
          onClick={() => runScan()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/60"
          aria-label="Re-scan device"
        >
          <RefreshCcw size={16} />
        </button>
      </motion.div>

      <Card className="mt-4 flex flex-col items-center py-6">
        <StorageRing
          percent={storageSummary.usedPercent}
          label="used"
          sublabel={`${formatBytes(storageSummary.usedBytes)} of ${formatBytes(storageSummary.totalBytes)}`}
        />
        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-white/[0.04]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-white/35">Free space</p>
            <p className="mt-1 text-[16px] font-bold text-slate-900 dark:text-white">{formatBytes(storageSummary.freeBytes)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-white/[0.04]">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-white/35">Worth reviewing</p>
            <p className="mt-1 text-[16px] font-bold text-indigo-500">{formatBytes(totalRecoverable)}</p>
          </div>
        </div>
      </Card>

      <Card
        className="mt-4 flex items-center justify-between"
        onClick={() => pushOverlay({ type: "cleanupReview" })}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
            <Sparkles size={19} />
          </div>
          <div>
            <p className="text-[14.5px] font-semibold text-slate-900 dark:text-white">Review cleanup suggestions</p>
            <p className="text-[12.5px] text-slate-400 dark:text-white/40">{recommendations.length} items found · you decide what to remove</p>
          </div>
        </div>
        <ChevronRight size={18} className="shrink-0 text-slate-300 dark:text-white/25" />
      </Card>

      <SectionTitle>Cleanup score</SectionTitle>
      <Card onClick={() => setTab("insights")}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[28px] font-bold text-slate-900 dark:text-white">{cleanupScore.score}<span className="text-[15px] font-medium text-slate-400 dark:text-white/35">/100</span></p>
            <p className="text-[13px] font-medium text-indigo-500">{cleanupScore.label}</p>
          </div>
          <div className="max-w-[55%] text-right text-[12px] leading-relaxed text-slate-400 dark:text-white/40">
            {cleanupScore.factors.length > 0
              ? `Biggest factor: ${cleanupScore.factors[0].label.toLowerCase()}`
              : "No major issues found."}
          </div>
        </div>
      </Card>

      <SectionTitle>Storage by category</SectionTitle>
      <Card>
        {topCategories.map((cat, i) => {
          const meta = (FILE_CATEGORY_META as any)[cat.category];
          return (
            <div key={cat.category}>
              <StatRow
                icon={<HardDrive size={16} style={{ color: meta?.color }} />}
                label={cat.label}
                value={formatBytes(cat.sizeBytes)}
                hint={`${cat.percent.toFixed(1)}% of storage`}
              />
              {i < topCategories.length - 1 && <div className="h-px bg-slate-100 dark:bg-white/[0.05]" />}
            </div>
          );
        })}
      </Card>

      <SectionTitle right={lastScan && <span className="text-[11px] font-medium text-slate-400 dark:text-white/30">Just now</span>}>
        Top recommendations
      </SectionTitle>
      <div className="flex flex-col gap-3">
        {recommendations.slice(0, 4).map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} onClick={() => pushOverlay({ type: "cleanupReview" })} />
        ))}
      </div>

      {lastScan && (
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400 dark:text-white/30">
          <Clock size={12} />
          Last scan analyzed {lastScan.appsScanned} apps and {lastScan.filesScanned} files
        </div>
      )}
    </motion.div>
  );
}
