"use client";

import { useEffect, useRef, useState } from "react";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { TimerRing } from "@/components/timer";
import { WIZARD_STAGE } from "@/lib/aktivitas-data";
import { useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { BookOpen, Handshake, Presentation } from "lucide-react";

export default function SiswaAktivitasPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 1000);
  const stage = state?.kelas.stage ?? "aktivitas-think";
  useStageFollow(stage && stage.startsWith("aktivitas-") ? stage : "aktivitas-think",
    "aktivitas-think",
    !(stage && stage.startsWith("aktivitas-"))
  );

  const meta = WIZARD_STAGE[stage] ?? WIZARD_STAGE["aktivitas-think"];
  const [total] = useState(meta.durasi);
  const [sisa, setSisa] = useState(meta.durasi);
  const audioRef = useRef<AudioContext | null>(null);
  const finishedRef = useRef(false);

  // Ketika guru mengganti stage, reset timer ke durasi stage tsb (simple, murni client)
  useEffect(() => {
    setSisa(meta.durasi);
    finishedRef.current = false;
    try { navigator.vibrate?.(0); } catch {}
  }, [stage]);

  useEffect(() => {
    const iv = setInterval(() => {
      setSisa((s) => {
        if (s <= 1) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            try {
              navigator.vibrate?.([500, 150, 500]);
              const ctx = audioRef.current ?? new AudioContext();
              audioRef.current = ctx;
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.connect(g); g.connect(ctx.destination);
              o.frequency.setValueAtTime(880, ctx.currentTime);
              o.frequency.setValueAtTime(660, ctx.currentTime + 0.25);
              g.gain.setValueAtTime(0.001, ctx.currentTime);
              g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
              g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
              o.start(); o.stop(ctx.currentTime + 0.8);
            } catch {}
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  if (!ready || !siswa) return null;

  const iconMap = {
    "aktivitas-think": BookOpen,
    "aktivitas-pair": Handshake,
    "aktivitas-share": Presentation,
  } as const;
  const Icon = iconMap[stage as keyof typeof iconMap] ?? BookOpen;
  const urgent = sisa <= 60;

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="chip">{siswa.nama}</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="chip uppercase tracking-[0.22em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8">
            <Icon className="h-3.5 w-3.5" /> {meta.label}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-6xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            Buka <em className="ff-italic text-[var(--red)]">LKPD-mu</em>
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--ink-2)] md:text-lg">
            {meta.cara}
          </p>

          <div className="mt-9">
            <TimerRing sisa={sisa} total={total} size={200} stroke={14} />
          </div>

          {urgent && sisa > 0 && (
            <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-[var(--red)]">
              Sisa waktu kurang dari satu menit!
            </p>
          )}
          {sisa === 0 && (
            <p className="anim-pop mt-4 text-lg font-extrabold text-emerald-700">
              Waktu habis — perhatikan instruksi guru.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
