import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Sheet, ConfirmDialog } from "../components/Sheet";
import { ScreenHeader, Card, PrimaryButton, StatRow, SeverityBadge } from "../components/ui";
import { formatBytes, formatDaysAgo, formatDate } from "../engine/format";
import { Calendar, Clock, Tag, ShieldCheck, HardDrive } from "lucide-react";

export function AppDetailScreen({ appId }: { appId: string }) {
  const app = useAppStore((s) => s.apps.find((a) => a.id === appId));
  const recommendations = useAppStore((s) => s.recommendations.filter((r) => r.itemIds.includes(appId)));
  const popOverlay = useAppStore((s) => s.popOverlay);
  const uninstallApp = useAppStore((s) => s.uninstallApp);
  const [confirming, setConfirming] = useState(false);

  if (!app) {
    popOverlay();
    return null;
  }

  return (
    <Sheet>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-32 pt-6">
        <ScreenHeader title="App details" onBack={popOverlay} />

        <Card className="flex flex-col items-center py-7 text-center">
          <div
            className="mb-3 flex h-16 w-16 items-center justify-center rounded-3xl text-3xl"
            style={{ backgroundColor: `${app.color}22` }}
          >
            {app.glyph}
          </div>
          <p className="text-[18px] font-bold text-slate-900 dark:text-white">{app.name}</p>
          <p className="mt-0.5 text-[12.5px] text-slate-400 dark:text-white/40">{app.packageName}</p>
          {app.isSystemCritical && (
            <div className="mt-3 flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11.5px] font-medium text-slate-500 dark:bg-white/5 dark:text-white/50">
              <ShieldCheck size={12} /> System / critical component
            </div>
          )}
        </Card>

        <Card className="mt-4">
          <StatRow icon={<HardDrive size={16} />} label="Storage used" value={formatBytes(app.sizeBytes)} />
          <div className="h-px bg-slate-100 dark:bg-white/[0.05]" />
          <StatRow
            icon={<Clock size={16} />}
            label="Last used"
            value={app.usageAvailable ? formatDaysAgo(app.lastUsedDaysAgo) : "Unavailable"}
            hint={
              app.usageAvailable
                ? app.lastUsedDaysAgo !== null
                  ? formatDate(app.lastUsedDaysAgo)
                  : undefined
                : "Usage Access permission not granted for this app"
            }
          />
          <div className="h-px bg-slate-100 dark:bg-white/[0.05]" />
          <StatRow icon={<Calendar size={16} />} label="Installed" value={formatDaysAgo(app.installedAtDaysAgo)} />
          <div className="h-px bg-slate-100 dark:bg-white/[0.05]" />
          <StatRow icon={<Tag size={16} />} label="Version" value={app.versionName} />
        </Card>

        {recommendations.length > 0 && (
          <>
            <p className="mb-2 mt-5 px-1 text-[13px] font-bold uppercase tracking-wide text-slate-400 dark:text-white/35">
              Why this is flagged
            </p>
            <Card>
              {recommendations.map((r) => (
                <div key={r.id} className="py-1.5">
                  <p className="text-[13.5px] leading-relaxed text-slate-600 dark:text-white/60">{r.reasoning}</p>
                  <div className="mt-2">
                    <SeverityBadge severity={r.severity} />
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}

        {!app.isSystemCritical && (
          <p className="mt-5 px-1 text-center text-[12px] leading-relaxed text-slate-400 dark:text-white/35">
            SpaceWise never uninstalls apps automatically. Uninstalling always requires your explicit confirmation and
            uses Android's standard uninstall flow.
          </p>
        )}
      </div>

      {!app.isSystemCritical && (
        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200/70 bg-white/90 p-4 backdrop-blur dark:border-white/[0.06] dark:bg-[#0a0b0f]/90">
          <PrimaryButton variant="danger" onClick={() => setConfirming(true)}>
            Uninstall {app.name}
          </PrimaryButton>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title={`Uninstall ${app.name}?`}
        description="This simulates Android's standard uninstall confirmation. On a real device this would launch the system uninstall dialog — SpaceWise never uninstalls apps without your explicit action."
        confirmLabel="Uninstall"
        danger
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          uninstallApp(app.id);
          setConfirming(false);
          popOverlay();
        }}
      />
    </Sheet>
  );
}
