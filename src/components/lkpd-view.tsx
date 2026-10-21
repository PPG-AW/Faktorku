"use client";

import { useEffect, useRef, useState } from "react";
import { Eq, EqText } from "@/components/equation";
import { LKPD, LKPD_KUNCI, TABEL_POLA, type LkpdBagian, type LkpdBlok } from "@/lib/lkpd";
import { cn, formatWaktu } from "@/lib/utils";
import { Clock3, Eye, EyeOff, KeyRound, Pause, Play, RotateCcw } from "lucide-react";

/* --------------------------- elemen isian --------------------------- */

function Garis({ n }: { n: number }) {
  return (
    <div className="mt-2 space-y-5">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="border-b-2 border-dotted border-black/55" />
      ))}
    </div>
  );
}

function Kotak({ w = "w-20" }: { w?: string }) {
  return <span className={cn("mono inline-block h-9 border-2 border-dashed border-black/70 bg-white align-middle", w)} />;
}

function Blok({ b }: { b: LkpdBlok }) {
  switch (b.tipe) {
    case "teks":
      return <p className="text-base leading-relaxed"><EqText>{b.v}</EqText></p>;

    case "eq":
      return (
        <p className="mono my-1 text-center text-xl font-bold">
          <Eq>{b.v}</Eq>
        </p>
      );

    case "soal":
      return (
        <div className="mt-2">
          <p className="text-base font-semibold leading-relaxed"><EqText>{b.label}</EqText></p>
          {b.eq && <p className="mono mt-1 text-lg font-bold"><Eq>{b.eq}</Eq></p>}
          <Garis n={b.jalan} />
        </div>
      );

    case "isian-abc":
      return (
        <div className="mono mt-2 flex flex-wrap items-center gap-6 text-lg font-bold">
          {["a", "b", "c"].map((k) => (
            <span key={k} className="flex items-center gap-2">
              <span className="font-serif italic">{k}</span> = <Kotak w="w-24" />
            </span>
          ))}
        </div>
      );

    case "bentuk-umum":
      return (
        <div className="mono mt-2 flex flex-wrap items-center justify-center gap-2 text-2xl font-bold">
          <Kotak w="w-16" />
          <span><Eq>x^2</Eq></span>
          <span>+</span>
          <Kotak w="w-16" />
          <span className="font-serif italic">x</span>
          <span>+</span>
          <Kotak w="w-16" />
          <span>= 0</span>
        </div>
      );

    case "tfaktor":
      return (
        <div className="mt-3 border-2 border-black">
          <div className="border-b-2 border-black bg-[#E63946] px-3 py-2 text-center text-sm font-extrabold text-white">
            T-FAKTOR · hasil kali c = {b.c} · hasil jumlah b = {b.b}
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1D3557] text-white">
                <th className="w-20 border border-black px-2 py-1.5 text-sm font-extrabold">p</th>
                <th className="w-20 border border-black px-2 py-1.5 text-sm font-extrabold">q</th>
                <th className="border border-black px-2 py-1.5 text-sm font-extrabold">p + q</th>
                <th className="w-24 border border-black px-2 py-1.5 text-sm font-extrabold">= b ?</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: b.baris }).map((_, i) => (
                <tr key={i}>
                  <td className="h-11 border border-black bg-white" />
                  <td className="h-11 border border-black bg-white" />
                  <td className="h-11 border border-black bg-white" />
                  <td className="h-11 border border-black bg-white" />
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t-2 border-black bg-[#FFF7DC] px-3 py-2.5">
            <span className="mono text-base font-bold">
              Dua bilangan itu: <Kotak w="w-24" /> dan <Kotak w="w-24" />
            </span>
          </div>
        </div>
      );

    case "faktor-x":
      return (
        <div className="mt-3 space-y-3 border-2 border-black bg-[#FFF7DC] p-3.5">
          <div className="mono flex flex-wrap items-center justify-center gap-1.5 text-xl font-bold">
            <span>(</span><span className="font-serif italic">x</span><span>+</span><Kotak w="w-20" />
            <span>)(</span><span className="font-serif italic">x</span><span>+</span><Kotak w="w-20" />
            <span>) = 0</span>
          </div>
          <div className="mono flex flex-wrap items-center justify-center gap-5 text-xl font-bold">
            <span className="whitespace-nowrap"><span className="font-serif italic">x</span> = <Kotak w="w-24" /></span>
            <span className="text-base font-semibold">atau</span>
            <span className="whitespace-nowrap"><span className="font-serif italic">x</span> = <Kotak w="w-24" /></span>
          </div>
        </div>
      );

    case "tabel-pola":
      return (
        <div className="mt-3 overflow-x-auto border-2 border-black">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="bg-[#1D3557] text-white">
                {TABEL_POLA.head.map((h, i) => (
                  <th key={h} className={cn("border border-black px-2.5 py-2 text-sm font-extrabold", i === 0 ? "w-[32%] text-left" : i === 1 || i === 2 ? "w-[9%]" : "w-[25%]")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABEL_POLA.rows.map((r) => (
                <tr key={r.eq} className={r.contoh ? "bg-[#FFDD00]" : "bg-white"}>
                  <td className="mono border border-black px-2.5 py-2.5 text-left text-base font-bold">
                    <Eq>{r.eq}</Eq>
                    {r.contoh && <span className="ml-2 bg-black px-1.5 py-0.5 text-[0.6rem] font-extrabold text-[#FFDD00]">CONTOH</span>}
                  </td>
                  <td className="mono h-12 border border-black px-2 text-center text-base font-bold">{r.b}</td>
                  <td className="mono h-12 border border-black px-2 text-center text-base font-bold">{r.c}</td>
                  <td className="mono h-12 border border-black px-2 text-center text-base font-bold">{r.tanda}</td>
                  <td className="mono h-12 border border-black px-2.5 text-center text-base font-bold">
                    {r.faktor ? <Eq>{r.faktor}</Eq> : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "catatan":
      return (
        <div className="mt-3 border-2 border-dashed border-black bg-white p-3.5">
          <p className="text-sm font-extrabold uppercase tracking-wider">{b.v}</p>
          <Garis n={2} />
        </div>
      );

    default:
      return null;
  }
}

/* ---------------------------- panel bagian ---------------------------- */

export function LkpdPanel({ bagian }: { bagian: LkpdBagian }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 border-2 border-black bg-[#FFDD00] px-3.5 py-2.5 shadow-[3px_3px_0_#111]">
        <span className={cn("border-2 border-black px-2.5 py-1 text-xs font-extrabold tracking-wider text-white",
          bagian.key === "a" ? "bg-[#E63946]" : bagian.key === "b" ? "bg-[#1D3557]" : "bg-[#2563EB]")}>
          {bagian.tag}
        </span>
        <span className="flex-1 text-base font-extrabold tracking-wide">{bagian.judul}</span>
        <span className="mono border-2 border-black bg-white px-2.5 py-1 text-xs font-extrabold">{bagian.durasi}</span>
      </div>

      {bagian.panels.map((p) => (
        <div key={p.no} className="border-2 border-black bg-white shadow-[3px_3px_0_#111]">
          <div className="flex flex-wrap items-center gap-2 border-b-2 border-black bg-[#F7F2E4] px-3.5 py-2">
            <span className="border-2 border-black bg-[#1D3557] px-2.5 py-0.5 text-xs font-extrabold tracking-wider text-white">{p.no}</span>
            {p.durasi && <span className="mono border-2 border-black bg-white px-2 py-0.5 text-[0.68rem] font-extrabold">{p.durasi}</span>}
            {p.judul && <span className="text-sm font-extrabold uppercase tracking-wide">{p.judul}</span>}
          </div>
          <div className="space-y-3 p-4">
            {p.intro && <p className="text-base leading-relaxed"><EqText>{p.intro}</EqText></p>}
            {p.eq && (
              <p className="mono border-2 border-black bg-[#FFF7DC] px-4 py-2.5 text-center text-2xl font-bold">
                <Eq>{p.eq}</Eq>
              </p>
            )}
            {p.blok.map((b, i) => <Blok key={i} b={b} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------- timer melayang ------------------------- */

const DURASI: Record<string, number> = {
  "aktivitas-think": 20 * 60,
  "aktivitas-pair": 12 * 60,
  "aktivitas-share": 8 * 60,
};

export function FloatingTimer({
  stageKey,
  onKontrol,
}: {
  stageKey: string;
  onKontrol?: (action: string, value?: unknown) => Promise<void>;
}) {
  const total = DURASI[stageKey] ?? 10 * 60;
  const [jalan, setJalan] = useState(false);
  const [sisa, setSisa] = useState(total);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Drag and drop state
  const [pos, setPos] = useState({ x: 20, y: 110 }); // right: 20px, top: 110px
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 20,
    initY: 110,
  });

  useEffect(() => {
    setSisa(total);
    setJalan(false);
    onKontrol?.("timerUpdate", { jalan: false, total, sisa: total });
  }, [total, stageKey]);

  useEffect(() => {
    if (jalan) {
      ivRef.current = setInterval(() => {
        setSisa((s) => {
          if (s <= 1) {
            setJalan(false);
            onKontrol?.("timerUpdate", { jalan: false, sisa: 0 });
            return 0;
          }
          const next = s - 1;
          if (next % 5 === 0) {
            onKontrol?.("timerUpdate", { jalan: true, sisa: next });
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (ivRef.current) clearInterval(ivRef.current);
    };
  }, [jalan, onKontrol]);

  function togglePlay() {
    const nextJalan = !jalan;
    setJalan(nextJalan);
    onKontrol?.("timerUpdate", { jalan: nextJalan, total, sisa });
  }

  function handleReset() {
    setJalan(false);
    setSisa(total);
    onKontrol?.("timerUpdate", { jalan: false, total, sisa: total });
  }

  function handlePointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: pos.x,
      initY: pos.y,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = dragRef.current.startX - e.clientX; // drag left increases offset from right
    const dy = e.clientY - dragRef.current.startY; // drag down increases offset from top
    setPos({
      x: Math.max(10, Math.min(window.innerWidth - 180, dragRef.current.initX + dx)),
      y: Math.max(60, Math.min(window.innerHeight - 180, dragRef.current.initY + dy)),
    });
  }

  function handlePointerUp() {
    setDragging(false);
  }

  const merah = sisa <= 60 && sisa > 0;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ right: `${pos.x}px`, top: `${pos.y}px`, cursor: dragging ? "grabbing" : "grab" }}
      className={cn(
        "fixed z-40 flex flex-col items-center border-2 border-[var(--ink)] bg-[var(--card)] px-4 py-3 shadow-[4px_4px_0_var(--ink)] select-none",
        merah && "border-[var(--red)]"
      )}
    >
      <span className="flex items-center gap-1 text-[0.6rem] font-extrabold uppercase tracking-widest text-[var(--ink-3)]">
        <Clock3 className="h-3.5 w-3.5" /> Waktu (Geser)
      </span>
      <span className={cn("mono mt-0.5 text-3xl font-extrabold leading-none tabular", merah ? "text-[var(--red)]" : "text-[var(--ink)]")}>
        {formatWaktu(sisa)}
      </span>
      <div className="mt-2 flex gap-1.5">
        <button onClick={togglePlay} disabled={sisa === 0} className="border-2 border-[var(--ink)] bg-[var(--card)] p-1.5 disabled:opacity-40 hover:bg-[var(--paper-2)]">
          {jalan ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button onClick={handleReset} className="border-2 border-[var(--ink)] bg-[var(--card)] p-1.5 hover:bg-[var(--paper-2)]">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* --------------------------- panel deck LKPD --------------------------- */

export function DeckLkpd({ modeShare = false, initialBagian }: { modeShare?: boolean; initialBagian?: "a" | "b" | "c" }) {
  const [bagianKey, setBagianKey] = useState<"a" | "b" | "c">(initialBagian ?? (modeShare ? "c" : "a"));
  const bagian = LKPD.find((b) => b.key === bagianKey) ?? LKPD[0];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 border-2 border-black bg-white p-1 shadow-[3px_3px_0_#111]">
          {LKPD.map((b) => (
            <button
              key={b.key}
              onClick={() => setBagianKey(b.key)}
              className={cn("px-5 py-2 text-xs font-extrabold uppercase tracking-widest transition-colors",
                bagianKey === b.key ? "bg-[#E63946] text-white" : "hover:bg-[#FFF7DC]")}
            >
              Bagian {b.key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <LkpdPanel bagian={bagian} />
      </div>
    </div>
  );
}
