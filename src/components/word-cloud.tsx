"use client";

import { useMemo } from "react";
import { tokenizeForCloud } from "@/lib/utils";
import { Cloud } from "lucide-react";

const PALETTE = [
  "text-indigo-300",
  "text-cyan-300",
  "text-violet-300",
  "text-amber-300",
  "text-emerald-300",
  "text-sky-300",
  "text-orange-300",
  "text-fuchsia-300",
];

export function WordCloud({ texts }: { texts: string[] }) {
  const words = useMemo(() => tokenizeForCloud(texts), [texts]);

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-500">
        <Cloud className="h-8 w-8 opacity-60" />
        <p className="text-sm">Word cloud akan muncul setelah ada jawaban masuk.</p>
      </div>
    );
  }

  const max = words[0].count;
  const min = words[words.length - 1].count;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4">
      {words.map((w, i) => {
        const ratio = max === min ? 1 : (w.count - min) / (max - min);
        const size = 0.85 + ratio * 1.85;
        const rot = ((i * 37) % 13) - 6;
        return (
          <span
            key={w.word}
            className={`font-bold tracking-tight transition-transform hover:scale-110 ${PALETTE[i % PALETTE.length]}`}
            style={{
              fontSize: `calc(${size}rem + 10px)`,
              transform: `rotate(${rot}deg)`,
              opacity: 0.62 + ratio * 0.38,
            }}
            title={`${w.count} siswa`}
          >
            {w.word}
            <sup className="ml-0.5 align-super text-[0.45em] font-semibold text-zinc-500">
              {w.count}
            </sup>
          </span>
        );
      })}
    </div>
  );
}
