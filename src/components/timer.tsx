"use client";

import { formatWaktu } from "@/lib/utils";

/** Cincin countdown — sisa detik & radius menyesuaikan */
export function TimerRing({
  sisa,
  total,
  size = 88,
  stroke = 7,
}: {
  sisa: number;
  total: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = total > 0 ? Math.max(0, Math.min(1, sisa / total)) : 0;
  const urgent = sisa <= 10;
  const color = urgent ? "#ef4444" : ratio < 0.4 ? "#f59e0b" : "#34d399";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.4s", filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center mono tabular ${urgent ? "timer-urgent" : ""}`}>
        <span className="text-lg font-bold leading-none">{formatWaktu(sisa)}</span>
      </div>
    </div>
  );
}
