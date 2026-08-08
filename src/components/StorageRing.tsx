import { useEffect, useState } from "react";

interface Props {
  percent: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel: string;
}

export function StorageRing({ percent, size = 200, stroke = 16, label, sublabel }: Props) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(percent), 100);
    return () => clearTimeout(t);
  }, [percent]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(animated, 100) / 100) * circumference;

  const color = percent > 90 ? "#ef4444" : percent > 75 ? "#f59e0b" : "#22c55e";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-200/70 dark:text-white/5"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{Math.round(animated)}%</span>
        <span className="mt-1 text-[13px] font-medium text-slate-500 dark:text-white/50">{label}</span>
        <span className="text-[11px] text-slate-400 dark:text-white/30">{sublabel}</span>
      </div>
    </div>
  );
}
