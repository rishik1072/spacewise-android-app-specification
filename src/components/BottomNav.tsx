import { Home, LayoutGrid, FolderOpen, Copy, PieChart, Settings } from "lucide-react";
import { useAppStore, type TabKey } from "../store/useAppStore";
import { cn } from "../utils/cn";

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "apps", label: "Apps", icon: LayoutGrid },
  { key: "files", label: "Files", icon: FolderOpen },
  { key: "duplicates", label: "Duplicates", icon: Copy },
  { key: "insights", label: "Insights", icon: PieChart },
  { key: "settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setTab = useAppStore((s) => s.setTab);

  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 border-t border-slate-200/70 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0d0e13]/90">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1.5 py-1.5">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 transition"
              aria-label={label}
              aria-current={active}
            >
              <div
                className={cn(
                  "flex h-8 w-11 items-center justify-center rounded-full transition-colors",
                  active ? "bg-indigo-600/15 text-indigo-500" : "text-slate-400 dark:text-white/35"
                )}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              </div>
              <span
                className={cn(
                  "text-[10.5px] font-medium transition-colors",
                  active ? "text-indigo-500" : "text-slate-400 dark:text-white/35"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
