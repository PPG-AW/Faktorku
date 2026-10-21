"use client";

import { useRef, useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import {
  Star, AlarmClock, MessageCircleQuestion, Heart, CircleCheck, Trash2, Sticker,
} from "lucide-react";

export type StikerIkon = "star" | "star3" | "exclaim" | "thought" | "heart" | "check" | "question";
export type StikerWarna = "red" | "navy" | "gold" | "black";

export interface StikerItem {
  id: string;
  x: number; y: number;
  warna: StikerWarna; ikon: StikerIkon;
}

const IKON_MAP: Record<StikerIkon, typeof Star> = {
  star: Star,
  star3: Star,
  exclaim: AlarmClock,
  thought: MessageCircleQuestion,
  heart: Heart,
  check: CircleCheck,
  question: MessageCircleQuestion,
};

const WARNA_MAP: Record<StikerWarna, string> = {
  red: "#E63946",
  navy: "#1D3557",
  gold: "#E9B949",
  black: "#111111",
};

export function AnnotationLayer({
  kelasId,
  stage,
  children,
}: {
  kelasId: string;
  stage: string;
  children: React.ReactNode;
}) {
  const [edit, setEdit] = useState(false);
  const [ikon, setIkon] = useState<StikerIkon>("star");
  const [warna, setWarna] = useState<StikerWarna>("red");
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, mutate } = useSWR<{ stiker: StikerItem[] }>(
    `/api/annotation?kelasId=${kelasId}&stage=${stage}`,
    fetcher,
    { refreshInterval: 3000 }
  );
  const stikers = data?.stiker ?? [];

  function klikContainer(e: React.MouseEvent) {
    if (!edit) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    setPending({ x, y });
  }

  async function tempel() {
    if (!pending) return;
    const p = pending;
    setPending(null);
    await fetch("/api/annotation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kelasId, stage, x: p.x, y: p.y, ikon, warna }),
    });
    mutate();
  }

  async function hapusSemua() {
    await fetch(`/api/annotation?kelasId=${kelasId}&stage=${stage}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        onClick={klikContainer}
        className={cn("relative h-full", edit && pending === null && "cursor-crosshair")}
      >
        {children}

        {/* Stiker guru */}
        {stikers.map((s) => {
          const Icon = IKON_MAP[s.ikon];
          const c = WARNA_MAP[s.warna];
          return (
            <span
              key={s.id}
              className="anim-pop pointer-events-none absolute z-20"
              style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, transform: "translate(-50%,-50%)" }}
            >
              <span className="animate-float inline-grid place-items-center border-2 border-black bg-white p-1.5 shadow-[3px_3px_0_#111]" style={{ color: c }}>
                <Icon className="h-5 w-5" fill={s.ikon === "star" ? c : "none"} />
              </span>
            </span>
          );
        })}

        {/* Picker ikon setelah klik (draf stiker) */}
        {pending && edit && (
          <div
            className="anim-pop absolute z-30 border-2 border-black bg-white p-2 shadow-[4px_4px_0_#111]"
            style={{ left: `${pending.x * 100}%`, top: `${pending.y * 100}%`, transform: "translate(-50%, calc(-100% - 10px))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5">
              {(Object.keys(IKON_MAP) as StikerIkon[]).map((k) => {
                const Icon = IKON_MAP[k];
                return (
                  <button
                    key={k}
                    onClick={() => setIkon(k)}
                    className={cn("border-2 border-black p-1.5", ikon === k ? "bg-[#FFDD00]" : "bg-white hover:bg-[#FFDD00]/40")}
                  >
                    <Icon className="h-4 w-4" color={WARNA_MAP[warna]} fill={k === "star" ? WARNA_MAP[warna] : "none"} />
                  </button>
                );
              })}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 border-t border-black pt-1.5">
              {(Object.keys(WARNA_MAP) as StikerWarna[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setWarna(w)}
                  className={cn("h-6 w-6 border-2", warna === w && "ring-2 ring-offset-1 ring-black")}
                  style={{ backgroundColor: WARNA_MAP[w], borderColor: "black" }}
                />
              ))}
              <button onClick={tempel} className="btn btn-primary ml-auto px-3 py-1.5 text-xs">Tempel</button>
              <button onClick={() => setPending(null)} className="btn btn-ghost px-2.5 py-1.5 text-xs">Batal</button>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar anotasi */}
      <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 border-2 border-black bg-white p-1.5 shadow-[4px_4px_0_#111]">
        <button
          onClick={(e) => { e.stopPropagation(); setEdit((v) => !v); setPending(null); }}
          className={cn("btn gap-1.5 px-3 py-1.5 text-xs", edit ? "btn-primary" : "btn-ghost")}
        >
          <Sticker className="h-4 w-4" /> {edit ? "Mode Coretan ON" : "Coretan Guru"}
        </button>
        {edit && (
          <>
            <span className="px-1 text-[0.6rem] font-bold uppercase tracking-widest text-ink-3">Klik slide untuk tempelkan ikon</span>
            {stikers.length > 0 && (
              <button onClick={hapusSemua} className="btn btn-ghost px-2.5 py-1.5 text-xs">
                <Trash2 className="h-3.5 w-3.5" /> Hapus semua ({stikers.length})
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
