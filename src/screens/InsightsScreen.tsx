import { useAppStore } from "../store/useAppStore";
import { ScreenHeader, Card, SectionTitle, EmptyState } from "../components/ui";
import { formatBytes } from "../engine/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FILE_CATEGORY_META } from "../engine/categorization";
import {
  findApkFiles, findDownloads, findOldFiles, findScreenshots, findUnusedApps,
} from "../engine/useCases";

const CAT_COLORS: Record<string, string> = { apps: "#6366f1", system: "#64748b", free: "#e2e8f0" };

export function InsightsScreen() {
  const storageSummary = useAppStore((s) => s.storageSummary);
  const apps = useAppStore((s) => s.apps);
  const files = useAppStore((s) => s.files);
  const duplicates = useAppStore((s) => s.duplicates);
  const settings = useAppStore((s) => s.settings);
  const cleanupScore = useAppStore((s) => s.cleanupScore);

  if (!storageSummary || !cleanupScore) {
    return (
      <div className="px-4 pb-6 pt-6">
        <ScreenHeader title="Insights" />
        <EmptyState icon="📊" title="No data yet" description="Run a scan from the Home tab to see insights." />
      </div>
    );
  }

  const chartData = storageSummary.categories
    .filter((c) => c.sizeBytes > 0)
    .map((c) => ({
      name: c.label,
      value: c.sizeBytes,
      color: CAT_COLORS[c.category as string] ?? (FILE_CATEGORY_META as any)[c.category]?.color ?? "#94a3b8",
    }));

  const largestFiles = [...files].sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, 5);
  const unused = findUnusedApps(apps, settings.unusedAppThresholdDays);
  const oldFiles = findOldFiles(files, settings.oldFileThresholdDays);
  const screenshots = findScreenshots(files);
  const downloads = findDownloads(files);
  const apks = findApkFiles(files);
  const dupBytes = duplicates.reduce((s, g) => s + g.recoverableBytes, 0);

  const topCategory = [...storageSummary.categories].filter((c) => c.category !== "free").sort((a, b) => b.sizeBytes - a.sizeBytes)[0];

  const insightLines = [
    topCategory && `${topCategory.label} use ${topCategory.percent.toFixed(0)}% of your total storage.`,
    screenshots.length > 0 && `You have ${formatBytes(screenshots.reduce((s, f) => s + f.sizeBytes, 0))} of screenshots across ${screenshots.length} images.`,
    largestFiles[0] && `Your largest file is ${formatBytes(largestFiles[0].sizeBytes)} (${largestFiles[0].name}).`,
    unused.length > 0 && `${unused.length} apps haven't been opened in ${settings.unusedAppThresholdDays}+ days.`,
    oldFiles.length > 0 && `${oldFiles.length} files haven't been modified in ${settings.oldFileThresholdDays}+ days.`,
    dupBytes > 0 && `Duplicate files account for ${formatBytes(dupBytes)} of recoverable space.`,
    downloads.length > 0 && `Downloads folder totals ${formatBytes(downloads.reduce((s, f) => s + f.sizeBytes, 0))}.`,
    apks.length > 0 && `${apks.length} leftover APK installers were found.`,
  ].filter(Boolean) as string[];

  return (
    <div className="px-4 pb-10 pt-6">
      <ScreenHeader title="Insights" subtitle="Where your storage is really going" />

      <Card>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatBytes(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
          {chartData.map((c) => (
            <div key={c.name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="truncate text-[12px] text-slate-500 dark:text-white/50">{c.name}</span>
              <span className="ml-auto shrink-0 text-[12px] font-semibold text-slate-700 dark:text-white/70">{formatBytes(c.value)}</span>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Cleanup score breakdown</SectionTitle>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[26px] font-bold text-slate-900 dark:text-white">{cleanupScore.score}<span className="text-[14px] font-medium text-slate-400 dark:text-white/35">/100</span></p>
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[12px] font-semibold text-indigo-500">{cleanupScore.label}</span>
        </div>
        {cleanupScore.factors.length === 0 ? (
          <p className="text-[13px] text-slate-400 dark:text-white/40">No significant issues detected.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {cleanupScore.factors.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-slate-700 dark:text-white/75">{f.label}</span>
                  <span className="font-semibold text-rose-500">{f.impact}</span>
                </div>
                <p className="text-[11.5px] text-slate-400 dark:text-white/35">{f.detail}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <SectionTitle>Largest files</SectionTitle>
      <Card className="divide-y divide-slate-100 dark:divide-white/[0.05]">
        {largestFiles.map((f) => (
          <div key={f.id} className="flex items-center justify-between py-2.5">
            <span className="truncate pr-3 text-[13.5px] text-slate-700 dark:text-white/75">{f.name}</span>
            <span className="shrink-0 text-[13.5px] font-semibold text-slate-900 dark:text-white">{formatBytes(f.sizeBytes)}</span>
          </div>
        ))}
      </Card>

      <SectionTitle>Notable insights</SectionTitle>
      <Card className="flex flex-col gap-2.5">
        {insightLines.map((line, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
            <p className="text-[13px] leading-relaxed text-slate-600 dark:text-white/60">{line}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
