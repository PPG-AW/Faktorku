"use client";

import type { SlideBlock, SlideKonten } from "@/db/schema";
import { Eq, EqText } from "@/components/equation";
import { Check, X, ArrowDown, Lightbulb, AlertTriangle, Sparkles, Info } from "lucide-react";

const TONE = {
  info: { border: "border-sky-400/30", bg: "bg-sky-400/8", icon: Info, iconColor: "text-sky-300" },
  success: { border: "border-emerald-400/30", bg: "bg-emerald-400/8", icon: Check, iconColor: "text-emerald-300" },
  warn: { border: "border-amber-400/30", bg: "bg-amber-400/8", icon: AlertTriangle, iconColor: "text-amber-300" },
  violet: { border: "border-violet-400/30", bg: "bg-violet-400/8", icon: Lightbulb, iconColor: "text-violet-300" },
} as const;

function Block({ block, index }: { block: SlideBlock; index: number }) {
  const delay = { animationDelay: `${0.12 + index * 0.09}s` };

  switch (block.t) {
    case "text":
      return (
        <p className="anim-fade-up text-sm leading-relaxed text-zinc-300 break-words sm:text-base md:text-lg" style={delay}>
          <EqText>{block.v}</EqText>
        </p>
      );
    case "big":
      return (
        <p className="anim-fade-up text-lg font-bold leading-relaxed text-zinc-100 break-words sm:text-xl md:text-2xl" style={delay}>
          <Eq>{block.v}</Eq>
        </p>
      );
    case "eq":
      return (
        <div
          className={`anim-fade-up mono eq-badge mx-auto w-fit max-w-full overflow-x-auto px-4 py-2.5 text-center font-semibold tracking-wide text-indigo-100 ${
            block.big ? "text-[clamp(1.05rem,2.8vw,2rem)] py-3 px-5 sm:px-7 sm:py-4" : "text-[clamp(0.9rem,2vw,1.35rem)]"
          }`}
          style={delay}
        >
          <Eq>{block.v}</Eq>
        </div>
      );
    case "arrow":
      return (
        <div className="anim-fade-up flex items-center justify-center gap-2 text-sm font-medium text-zinc-400" style={delay}>
          <ArrowDown className="h-4 w-4 text-indigo-300" />
          <Eq>{block.v}</Eq>
        </div>
      );
    case "box": {
      const tone = TONE[block.tone ?? "info"];
      const Icon = tone.icon;
      return (
        <div className={`anim-fade-up flex items-start gap-3 rounded-2xl border ${tone.border} ${tone.bg} px-4 py-3.5`} style={delay}>
          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.iconColor}`} />
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest ${tone.iconColor}`}>{block.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300 md:text-base">
              <EqText>{block.v}</EqText>
            </p>
          </div>
        </div>
      );
    }
    case "list":
      return (
        <ul className="anim-fade-up space-y-2.5" style={delay}>
          {block.items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 text-base leading-relaxed text-zinc-300 md:text-lg">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--red)]" />
              <span className="min-w-0 flex-1"><EqText>{it}</EqText></span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <div className="anim-fade-up space-y-2" style={delay}>
          {block.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-3.5 py-2.5">
              <span className="mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/25 text-xs font-bold text-indigo-200">
                {i + 1}
              </span>
              <span className="mono min-w-0 flex-1 text-sm leading-relaxed text-zinc-200 md:text-base">
                <EqText>{it}</EqText>
              </span>
            </div>
          ))}
        </div>
      );
    case "check":
      return (
        <div className={`anim-fade-up flex items-center gap-3 rounded-xl border px-4 py-3 ${block.ok ? "border-emerald-400/25 bg-emerald-400/8" : "border-rose-400/20 bg-rose-400/6"}`} style={delay}>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${block.ok ? "bg-emerald-400/20 text-emerald-300" : "bg-rose-400/20 text-rose-300"}`}>
            {block.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </span>
          <span className="mono min-w-0 flex-1 text-sm text-zinc-200 md:text-base">
            <Eq>{block.eq}</Eq>
          </span>
          <span className={`mono ml-auto shrink-0 text-sm font-bold md:text-base ${block.ok ? "text-emerald-300" : "text-rose-300"}`}>
            <Eq>{block.result}</Eq>
          </span>
        </div>
      );
    case "table":
      return (
        <div className="anim-fade-up overflow-x-auto rounded-2xl border border-white/10" style={delay}>
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="bg-indigo-500/15 text-indigo-200">
                {block.head.map((h, i) => (
                  <th key={i} className={`px-3 py-2.5 font-bold tracking-wide ${i === block.head.length - 1 ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-white/6 text-zinc-300">
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-3 py-2.5 ${ci === 0 ? "font-semibold" : "mono"} ${ci === row.length - 1 ? "whitespace-nowrap text-right" : ""}`}>
                      {ci === 0 ? cell : <Eq>{cell}</Eq>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export function SlideViewer({
  konten,
  nomor,
  total,
  tampil,
}: {
  konten: SlideKonten;
  nomor: number;
  total: number;
  /** jumlah blok yang ditampilkan (untuk animasi bertahap); undefined = semua */
  tampil?: number;
}) {
  const blocks = tampil === undefined ? konten.blocks : konten.blocks.slice(0, Math.max(0, tampil));
  const layout = konten.layout ?? "content";
  const isHero = layout === "title" || layout === "closing";

  return (
    <div
      key={nomor}
      className={`anim-slide relative flex h-full w-full flex-col ${isHero ? "items-center justify-center text-center" : "justify-center"}`}
    >
      {konten.kicker && (
        <div className={`anim-fade-up chip mb-4 !text-[0.7rem] uppercase tracking-[0.18em] !text-indigo-300 border-indigo-400/30 bg-indigo-400/10 ${isHero ? "" : "self-start"}`}>
          <Sparkles className="h-3 w-3" />
          {konten.kicker}
        </div>
      )}

      {isHero ? (
        <>
          <h1 className="anim-fade-up anim-fade-up-1 text-gradient text-glow text-5xl font-extrabold tracking-tight md:text-7xl">
            {konten.title}
          </h1>
          {konten.sub && (
            <p className="anim-fade-up anim-fade-up-2 mt-4 max-w-3xl text-base leading-relaxed text-zinc-400 md:text-xl">{konten.sub}</p>
          )}
          <div className="anim-fade-up anim-fade-up-3 mt-8 flex w-full max-w-2xl flex-col items-center gap-4">
            {blocks.map((b, i) => (
              <Block key={i} block={b} index={i + 3} />
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-end justify-between gap-4">
            <h1 className="anim-fade-up anim-fade-up-1 text-3xl font-extrabold tracking-tight text-zinc-50 md:text-5xl">
              {konten.title}
            </h1>
            <span className="mono shrink-0 text-sm font-semibold text-zinc-500 tabular">
              {String(nomor).padStart(2, "0")}<span className="text-zinc-700">/{total}</span>
            </span>
          </div>
          {konten.sub && (
            <p className="anim-fade-up anim-fade-up-2 mt-2 text-sm leading-relaxed text-indigo-300/90 md:text-base">{konten.sub}</p>
          )}
          <div className="anim-fade-up-3 mt-6 space-y-4 md:mt-8">
            {blocks.map((b, i) => (
              <Block key={i} block={b} index={i + 3} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
