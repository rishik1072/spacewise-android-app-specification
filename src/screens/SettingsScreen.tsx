import type { ReactNode } from "react";
import { useAppStore } from "../store/useAppStore";
import { ScreenHeader, Card, SectionTitle, Pill } from "../components/ui";
import type { LargeFileThresholdMB, ThresholdDays } from "../types/models";
import { Moon, Sun, Monitor, ShieldCheck, Info, ChevronRight, RotateCcw } from "lucide-react";

export function SettingsScreen() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const pushOverlay = useAppStore((s) => s.pushOverlay);
  const runScan = useAppStore((s) => s.runScan);

  return (
    <div className="px-4 pb-10 pt-6">
      <ScreenHeader title="Settings" subtitle="Tune how SpaceWise analyzes your device" />

      <SectionTitle>Appearance</SectionTitle>
      <Card className="flex gap-2">
        {[
          { key: "light", label: "Light", icon: Sun },
          { key: "dark", label: "Dark", icon: Moon },
          { key: "system", label: "System", icon: Monitor },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => updateSettings({ appearance: key as any })}
            className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 text-[12.5px] font-medium transition ${
              settings.appearance === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500 dark:bg-white/[0.05] dark:text-white/50"
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </Card>

      <SectionTitle>Unused app threshold</SectionTitle>
      <Card>
        <p className="mb-3 text-[12.5px] text-slate-400 dark:text-white/40">
          Apps not opened within this period are flagged as potentially unused.
        </p>
        <div className="flex flex-wrap gap-2">
          {([30, 60, 90, 180] as ThresholdDays[]).map((d) => (
            <Pill key={d} active={settings.unusedAppThresholdDays === d} onClick={() => updateSettings({ unusedAppThresholdDays: d })}>
              {d} days
            </Pill>
          ))}
        </div>
      </Card>

      <SectionTitle>Old file threshold</SectionTitle>
      <Card>
        <p className="mb-3 text-[12.5px] text-slate-400 dark:text-white/40">
          Files untouched longer than this are surfaced for review — old doesn't mean unwanted.
        </p>
        <div className="flex flex-wrap gap-2">
          {([30, 90, 180, 365] as ThresholdDays[]).map((d) => (
            <Pill key={d} active={settings.oldFileThresholdDays === d} onClick={() => updateSettings({ oldFileThresholdDays: d })}>
              {d < 365 ? `${d} days` : "1 year"}
            </Pill>
          ))}
        </div>
      </Card>

      <SectionTitle>Large file threshold</SectionTitle>
      <Card>
        <p className="mb-3 text-[12.5px] text-slate-400 dark:text-white/40">Files above this size are flagged as large.</p>
        <div className="flex flex-wrap gap-2">
          {([100, 500, 1000, 2000] as LargeFileThresholdMB[]).map((mb) => (
            <Pill key={mb} active={settings.largeFileThresholdMB === mb} onClick={() => updateSettings({ largeFileThresholdMB: mb })}>
              {mb >= 1000 ? `${mb / 1000} GB` : `${mb} MB`}
            </Pill>
          ))}
        </div>
      </Card>

      <SectionTitle>Scan preferences</SectionTitle>
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-medium text-slate-800 dark:text-white/85">Scan on launch</p>
          <p className="text-[12px] text-slate-400 dark:text-white/35">Automatically analyze storage each time you open SpaceWise</p>
        </div>
        <button
          onClick={() => updateSettings({ scanOnLaunch: !settings.scanOnLaunch })}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${settings.scanOnLaunch ? "bg-indigo-600" : "bg-slate-200 dark:bg-white/10"}`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              settings.scanOnLaunch ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </Card>
      <Card className="mt-3 flex items-center gap-3" onClick={() => runScan()}>
        <RotateCcw size={16} className="text-indigo-500" />
        <p className="text-[14px] font-medium text-slate-800 dark:text-white/85">Re-run scan now</p>
      </Card>

      <SectionTitle>Privacy &amp; permissions</SectionTitle>
      <Card className="divide-y divide-slate-100 dark:divide-white/[0.05]">
        <Row icon={<ShieldCheck size={16} />} label="Privacy" onClick={() => pushOverlay({ type: "privacy" })} />
        <Row icon={<ShieldCheck size={16} />} label="Permission management" onClick={() => pushOverlay({ type: "permissions" })} />
        <Row icon={<Info size={16} />} label="About SpaceWise" onClick={() => pushOverlay({ type: "about" })} />
      </Card>
    </div>
  );
}

function Row({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <div onClick={onClick} className="flex cursor-pointer items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/60">
          {icon}
        </div>
        <p className="text-[14px] font-medium text-slate-800 dark:text-white/85">{label}</p>
      </div>
      <ChevronRight size={16} className="text-slate-300 dark:text-white/25" />
    </div>
  );
}
