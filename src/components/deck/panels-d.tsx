"use client";

import { useEffect, useRef, useState } from "react";
import { Eq } from "@/components/equation";
import { WIZARD_STAGE } from "@/lib/aktivitas-data";
import { cn, formatWaktu } from "@/lib/utils";
import type { PanelProps } from "@/components/deck/panels-a";
import { BookOpen, Handshake, Pause, Play, Presentation, RotateCcw, TimerReset, LogOut, MoonStar, Check, SquarePen } from "lucide-react";

/* ===================== slide: THINK / PAIR / SHARE ======================= */

export function DeckAktivitas({
  stageKey,
  onKontrol,
}: PanelProps & {
  stageKey: "aktivitas-think" | "aktivitas-pair" | "aktivitas-share";
  onKontrol: (action: string, value?: unknown) => Promise<void>;
}) {
  const meta = WIZARD_STAGE[stageKey];
  const [jalan, setJalan] = useState(false);
  const [sisa, setSisa] = useState(meta.durasi);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSisa(meta.durasi);
    setJalan(false);
  }, [stageKey, meta.durasi]);

  useEffect(() => {
    if (jalan) {
      ivRef.current = setInterval(() => {
        setSisa((s) => {
          if (s <= 1) {
            setJalan(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, [jalan]);

  const iconMap = { "aktivitas-think": BookOpen, "aktivitas-pair": Handshake, "aktivitas-share": Presentation } as const;
  const Icon = iconMap[stageKey];
  const urgent = sisa <= 300 && sisa > 0;

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <span className="chip uppercase tracking-[0.22em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8 !text-[0.6rem]">
        <Icon className="h-3.5 w-3.5" /> {meta.cara.split(".")[0]}
      </span>
      <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-7xl" style={{ fontFamily: '"Playfair Display", serif' }}>
        {meta.label.replace(/ — .*/, "")}
      </h1>
      <p className="mt-1 font-serif text-2xl italic text-[var(--ink-2)] md:text-3xl">{meta.label.split(" — ")[1]}</p>

      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--ink-2)] md:text-lg">{meta.cara}</p>

      {/* Timer */}
      <div className="mt-8 mono tabular">
        <div className={cn("text-7xl font-extrabold tracking-tight md:text-8xl", sisa === 0 ? "text-emerald-700" : urgent ? "text-[var(--red)]" : "text-[var(--ink)]")}>
          {formatWaktu(sisa)}
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[var(--ink-3)]">
          {jalan ? "Berjalan" : sisa === 0 ? "Waktu habis" : "Siap dimulai"}
        </p>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        {jalan ? (
          <button onClick={() => setJalan(false)} className="btn btn-amber px-6 py-3 text-sm">
            <Pause className="h-4.5 w-4.5" /> Jeda
          </button>
        ) : (
          <button onClick={() => setJalan(true)} disabled={sisa === 0} className="btn btn-primary px-6 py-3 text-sm">
            <Play className="h-4.5 w-4.5" /> {meta.durasi === sisa ? "Mulai Timer" : "Lanjut"}
          </button>
        )}
        <button onClick={() => { setJalan(false); setSisa(meta.durasi); }} className="btn btn-ghost px-5 py-3 text-sm">
          <RotateCcw className="h-4.5 w-4.5" /> Reset
        </button>
      </div>

      <p className="mono mt-6 flex items-center gap-2 text-xs text-[var(--ink-3)]">
        <TimerReset className="h-3.5 w-3.5" /> Timer tampil persis sama di setiap HP siswa — saat habis, guru lanjut ke slide berikutnya
      </p>
    </div>
  );
}

/* ============================ slide: DOA ================================ */

export function DeckDoa({ monitor, onKontrol }: PanelProps & { onKontrol: (action: string, value?: unknown) => Promise<void> }) {
  const [sent, setSent] = useState(false);
  const [count, setCount] = useState(3);

  async function akhiriSesi() {
    setSent(true);
    await onKontrol("sesiEnd");
  }

  const online = monitor?.agg.online ?? 0;

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <span className="chip uppercase tracking-[0.24em] !text-[var(--ink-2)] border-[var(--hairline)] bg-[var(--card)] !text-[0.6rem]">
        <MoonStar className="h-3.5 w-3.5" /> Penutup
      </span>
      <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl" style={{ fontFamily: '"Playfair Display", serif' }}>
        Terima kasih,
        <br />
        <em className="ff-italic text-[var(--red)]">sampai jumpa.</em>
      </h1>
      <p className="mt-4 font-serif text-xl italic text-[var(--ink-2)] md:text-2xl">
        Mari tutup pembelajaran ini dengan doa bersama.
      </p>

      <div className="glass mt-9 w-full max-w-xl p-6" style={{ borderRadius: 3 }}>
        <div className="space-y-3 text-center">
          <p className="font-serif text-lg italic leading-relaxed text-[var(--ink-2)]">
            “Ya Allah, terima kasih atas ilmu yang kami peroleh hari ini. Jadikanlah ilmu ini bermanfaat, mudahkan kami memahaminya, dan jagalah kami dalam kebaikan.”
          </p>
          <p className="font-serif text-xl font-bold italic text-[var(--red)]">Aamiin.</p>
        </div>

        <div className="mt-6 border-t border-[var(--hairline)] pt-5">
          <p className="mono text-xs uppercase tracking-[0.28em] text-[var(--ink-3)]">Pertemuan berikutnya · Rumus ABC</p>
          <div className="mono mt-3 space-y-1.5 text-sm text-[var(--ink-2)]">
            <p><Eq>PR 1 · x^2 + 11x + 24 = 0</Eq></p>
            <p><Eq>PR 2 · x^2 - 13x + 36 = 0</Eq></p>
            <p><Eq>PR 3 · 2x^2 + 11x + 5 = 0</Eq></p>
            <p className="text-[var(--red)]"><Eq>Tantangan · x^2 + 3x + 1 = 0</Eq></p>
          </div>
        </div>
      </div>

      <button
        onClick={akhiriSesi}
        disabled={sent}
        className="btn btn-danger mt-7 px-8 py-3.5 text-base"
      >
        {sent ? <Check className="h-4.5 w-4.5" /> : <LogOut className="h-4.5 w-4.5" />}
        {sent ? `Mengakhiri sesi — ${online} HP logout…` : "Akhiri Sesi & Logout Kelas"}
      </button>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--ink-3)]">
        <SquarePen className="h-3.5 w-3.5" /> Data sesi disimpan permanen. Siswa keluar otomatis dari layar masing-masing.
      </p>
    </div>
  );
}
