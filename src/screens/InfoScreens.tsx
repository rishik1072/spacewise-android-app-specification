import { Sheet } from "../components/Sheet";
import { ScreenHeader, Card } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import { Lock, EyeOff, Server, Ban, ShieldCheck, FolderOpen, Activity } from "lucide-react";

export function PrivacyScreen() {
  const popOverlay = useAppStore((s) => s.popOverlay);
  const points = [
    { icon: Lock, title: "Analysis happens locally", body: "SpaceWise inspects apps and files entirely on your device. Metadata never leaves your phone for analysis." },
    { icon: Ban, title: "No cloud upload", body: "File contents, photos, videos, and documents are never uploaded anywhere." },
    { icon: EyeOff, title: "No tracking or ads", body: "SpaceWise has no analytics SDKs, ad networks, or trackers." },
    { icon: Server, title: "No server dependency", body: "The core experience works fully offline — there is no backend involved in scanning or recommendations." },
    { icon: FolderOpen, title: "Minimal metadata only", body: "Only what's needed for categorization (size, dates, type) is used — file contents are read only when strictly required for a feature." },
  ];
  return (
    <Sheet>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-10 pt-6">
        <ScreenHeader title="Privacy" subtitle="How SpaceWise treats your data" onBack={popOverlay} />
        <div className="flex flex-col gap-3">
          {points.map((p) => (
            <Card key={p.title} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <p.icon size={18} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-900 dark:text-white">{p.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-500 dark:text-white/45">{p.body}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-4 border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/[0.06]">
          <p className="text-[12.5px] font-semibold text-amber-700 dark:text-amber-400">Platform note</p>
          <p className="mt-1 text-[12px] leading-relaxed text-amber-700/80 dark:text-amber-300/70">
            This build runs inside a web sandbox that cannot access Android's PackageManager, UsageStatsManager,
            MediaStore, or StorageStatsManager. To demonstrate the full experience, SpaceWise generates one
            locally-computed device snapshot instead of reading real hardware — nothing is fetched from a network. On
            an Android device, this exact engine runs against genuine platform APIs. See About for details.
          </p>
        </Card>
      </div>
    </Sheet>
  );
}

export function AboutScreen() {
  const popOverlay = useAppStore((s) => s.popOverlay);
  return (
    <Sheet>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-10 pt-6">
        <ScreenHeader title="About" onBack={popOverlay} />
        <Card className="flex flex-col items-center py-8 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl text-white shadow-lg shadow-indigo-600/25">
            ✨
          </div>
          <p className="text-[17px] font-bold text-slate-900 dark:text-white">SpaceWise</p>
          <p className="text-[12.5px] text-slate-400 dark:text-white/40">Version 1.0.0 (build 100)</p>
          <p className="mt-3 max-w-[280px] text-[13px] leading-relaxed text-slate-500 dark:text-white/50">
            Understand your phone. Reclaim your space. A digital declutter assistant — not another cleaner.
          </p>
        </Card>

        <Card className="mt-4">
          <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white">Product positioning</p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-white/50">
            Analyze locally. Understand what matters. Review before removing. Stay in control. SpaceWise explains the
            reasoning behind every recommendation and never performs destructive actions automatically.
          </p>
        </Card>

        <Card className="mt-4 border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/[0.06]">
          <p className="text-[12.5px] font-semibold text-amber-700 dark:text-amber-400">Implementation note</p>
          <p className="mt-1 text-[12px] leading-relaxed text-amber-700/80 dark:text-amber-300/70">
            This is a web-based demonstration build. Real Android system APIs (PackageManager, UsageStatsManager,
            StorageStatsManager, MediaStore, Storage Access Framework) are unavailable inside a browser sandbox, so a
            deterministic, locally-generated device snapshot stands in for genuine hardware reads. Every downstream
            engine — categorization, duplicate detection, recommendations, and cleanup scoring — is fully implemented
            and runs for real against that data, and is architected to be dropped onto real repository
            implementations on an actual Android build.
          </p>
        </Card>

        <Card className="mt-4">
          <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white">Open-source</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500 dark:text-white/50">
            Built with React, TypeScript, Tailwind CSS, Zustand, Framer Motion, and Recharts.
          </p>
        </Card>
      </div>
    </Sheet>
  );
}

export function PermissionsScreen() {
  const popOverlay = useAppStore((s) => s.popOverlay);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const perms = [
    {
      key: "usageAccessGranted" as const,
      icon: Activity,
      title: "Usage Access",
      body: "Needed to determine when apps were last used, so unused-app recommendations can be accurate.",
      fallback: "Without it, SpaceWise still lists apps but shows \"usage data unavailable\" instead of guessing.",
    },
    {
      key: "storageAccessGranted" as const,
      icon: ShieldCheck,
      title: "Media & File Access",
      body: "Needed to categorize photos, videos, downloads, and documents using MediaStore and scoped storage APIs.",
      fallback: "Without it, file-based features are disabled but the rest of the app remains usable.",
    },
  ];

  return (
    <Sheet>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-10 pt-6">
        <ScreenHeader title="Permissions" subtitle="Only what's needed, nothing more" onBack={popOverlay} />
        <div className="flex flex-col gap-3">
          {perms.map((p) => (
            <Card key={p.key}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <p.icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-semibold text-slate-900 dark:text-white">{p.title}</p>
                    <button
                      onClick={() => updateSettings({ [p.key]: !settings[p.key] } as any)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${settings[p.key] ? "bg-indigo-600" : "bg-slate-200 dark:bg-white/10"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          settings[p.key] ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-white/45">{p.body}</p>
                  {!settings[p.key] && (
                    <p className="mt-1.5 text-[11.5px] italic text-amber-600 dark:text-amber-400">{p.fallback}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-5 px-1 text-center text-[11.5px] leading-relaxed text-slate-400 dark:text-white/30">
          SpaceWise never requests permissions unrelated to its features and always remains usable if a permission is denied.
        </p>
      </div>
    </Sheet>
  );
}
