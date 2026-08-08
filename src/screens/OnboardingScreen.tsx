import { useAppStore } from "../store/useAppStore";
import { PrimaryButton } from "../components/ui";
import { Sparkles, Activity, FolderOpen, ShieldCheck } from "lucide-react";

export function OnboardingScreen() {
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const runScan = useAppStore((s) => s.runScan);

  return (
    <div className="flex h-full flex-col justify-between px-6 pb-8 pt-14">
      <div>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-600/30">
          <Sparkles className="text-white" size={28} />
        </div>
        <h1 className="text-center text-[26px] font-bold tracking-tight text-slate-900 dark:text-white">SpaceWise</h1>
        <p className="mx-auto mt-2 max-w-[280px] text-center text-[14px] text-slate-500 dark:text-white/50">
          Understand your phone. Reclaim your space. Not another cleaner — a digital declutter assistant.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <Feature icon={Activity} title="Usage Access" body="Helps identify apps you haven't opened in a while. You can deny this and still use SpaceWise." />
          <Feature icon={FolderOpen} title="Media & Files" body="Lets SpaceWise categorize photos, videos, downloads, and documents using Android's supported storage APIs." />
          <Feature icon={ShieldCheck} title="You stay in control" body="Nothing is ever deleted or uninstalled automatically. Every action requires your explicit review and confirmation." />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <PrimaryButton
          onClick={() => {
            setOnboarded(true);
            runScan();
          }}
        >
          Get started
        </PrimaryButton>
        <p className="text-center text-[11.5px] leading-relaxed text-slate-400 dark:text-white/30">
          Analysis happens locally. No data ever leaves your device.
        </p>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, body }: { icon: typeof Activity; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[14px] font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-500 dark:text-white/45">{body}</p>
      </div>
    </div>
  );
}
