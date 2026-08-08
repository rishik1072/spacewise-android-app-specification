import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import { ScreenHeader, Pill, Card, EmptyState } from "../components/ui";
import { AppRow } from "../components/AppRow";
import { Search } from "lucide-react";
import type { AppUsageBucket } from "../types/models";

type SortMode = "size" | "recent" | "name";
type FilterMode = "all" | AppUsageBucket;

export function AppsScreen() {
  const apps = useAppStore((s) => s.apps);
  const pushOverlay = useAppStore((s) => s.pushOverlay);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortMode>("size");

  const filtered = useMemo(() => {
    let list = apps.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
    if (filter !== "all") list = list.filter((a) => a.category === filter);
    list = [...list].sort((a, b) => {
      if (sort === "size") return b.sizeBytes - a.sizeBytes;
      if (sort === "name") return a.name.localeCompare(b.name);
      return (a.lastUsedDaysAgo ?? 9999) - (b.lastUsedDaysAgo ?? 9999);
    });
    return list;
  }, [apps, query, filter, sort]);

  const counts = {
    all: apps.length,
    frequently_used: apps.filter((a) => a.category === "frequently_used").length,
    occasionally_used: apps.filter((a) => a.category === "occasionally_used").length,
    unused: apps.filter((a) => a.category === "unused").length,
    system: apps.filter((a) => a.category === "system").length,
  };

  return (
    <div className="px-4 pb-6 pt-6">
      <ScreenHeader title="Apps" subtitle={`${apps.length} installed applications`} />

      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-2.5 dark:bg-white/[0.05]">
        <Search size={16} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps"
          className="w-full bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/30"
        />
      </div>

      <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto pb-1">
        <Pill active={filter === "all"} onClick={() => setFilter("all")}>All ({counts.all})</Pill>
        <Pill active={filter === "frequently_used"} onClick={() => setFilter("frequently_used")}>Frequent ({counts.frequently_used})</Pill>
        <Pill active={filter === "occasionally_used"} onClick={() => setFilter("occasionally_used")}>Occasional ({counts.occasionally_used})</Pill>
        <Pill active={filter === "unused"} onClick={() => setFilter("unused")}>Unused ({counts.unused})</Pill>
        <Pill active={filter === "system"} onClick={() => setFilter("system")}>System ({counts.system})</Pill>
      </div>

      <div className="mb-3 flex justify-end gap-2">
        {(["size", "recent", "name"] as SortMode[]).map((s) => (
          <Pill key={s} active={sort === s} onClick={() => setSort(s)} className="text-[12px]">
            {s === "size" ? "Largest" : s === "recent" ? "Recently used" : "A–Z"}
          </Pill>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📱" title="No apps found" description="Try a different search or filter." />
      ) : (
        <Card className="divide-y divide-slate-100 dark:divide-white/[0.05]">
          <AnimatePresence mode="popLayout">
            {filtered.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <AppRow app={app} onClick={() => pushOverlay({ type: "appDetail", appId: app.id })} />
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
}
