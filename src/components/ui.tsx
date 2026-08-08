import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-sm shadow-slate-200/50 backdrop-blur",
        "dark:border-white/[0.06] dark:bg-white/[0.035] dark:shadow-none",
        onClick && "cursor-pointer transition active:scale-[0.985]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3 px-1">
      <div className="flex items-start gap-2">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
          >
            ←
          </button>
        )}
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-white/45">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Pill({
  children,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
        active
          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/10",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SeverityBadge({ severity }: { severity: "green" | "yellow" | "red" }) {
  const map = {
    green: { label: "Worth reviewing", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    yellow: { label: "Review carefully", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
    red: { label: "Potentially important", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  } as const;
  const item = map[severity];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", item.cls)}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          severity === "green" ? "bg-emerald-500" : severity === "yellow" ? "bg-amber-500" : "bg-rose-500"
        )}
      />
      {item.label}
    </span>
  );
}

export function StatRow({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/60">
          {icon}
        </div>
        <div>
          <p className="text-[14px] font-medium text-slate-800 dark:text-white/85">{label}</p>
          {hint && <p className="text-[12px] text-slate-400 dark:text-white/35">{hint}</p>}
        </div>
      </div>
      <span className="text-[14px] font-semibold tabular-nums text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "danger" | "ghost";
}) {
  const styles = {
    primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 active:bg-indigo-700",
    danger: "bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 active:bg-rose-700",
    ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/10",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 px-6 py-14 text-center dark:border-white/10">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400 dark:bg-white/5 dark:text-white/30">
        {icon}
      </div>
      <div>
        <p className="text-[15px] font-semibold text-slate-700 dark:text-white/80">{title}</p>
        <p className="mx-auto mt-1 max-w-[240px] text-[13px] text-slate-400 dark:text-white/40">{description}</p>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2.5 mt-6 flex items-center justify-between px-1 first:mt-0">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-400 dark:text-white/35">{children}</h2>
      {right}
    </div>
  );
}

export function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      aria-label={checked ? "Deselect item" : "Select item"}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
        checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 dark:border-white/20"
      )}
    >
      {checked && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3.5 w-3.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
