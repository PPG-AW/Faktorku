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
  useStageFollow(stage, stage.startsWith("aktivitas-") ? stage : "aktivitas-think", true);

  const meta = WIZARD_STAGE[stage] ?? WIZARD_STAGE["aktivitas-think"];
  
  // Sinkronisasi dengan timer guru di kelas
  const timerGuruJalan = state?.kelas.timerJalan ?? false;
  const timerTotal = state?.kelas.timerTotal ?? meta.durasi;
  const timerSisaDb = state?.kelas.timerSisa ?? meta.durasi;
  const timerUpdatedAt = state?.kelas.timerUpdatedAt ? new Date(state.kelas.timerUpdatedAt).getTime() : null;

  const [sisa, setSisa] = useState(timerSisaDb);

  useEffect(() => {
    if (!timerGuruJalan) {
      setSisa(timerSisaDb);
      return;
    }
    // Jika timer sedang jalan, hitung selisih waktu sejak update terakhir
    const elapsedSinceUpdate = timerUpdatedAt ? Math.floor((Date.now() - timerUpdatedAt) / 1000) : 0;
    const currentCalculated = Math.max(0, timerSisaDb - Math.max(0, elapsedSinceUpdate));
    setSisa(currentCalculated);

    const iv = setInterval(() => {
      setSisa((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(iv);
  }, [timerGuruJalan, timerSisaDb, timerUpdatedAt]);

  if (!ready || !siswa) return null;

  const iconMap = {
    "aktivitas-think": BookOpen,
    "aktivitas-pair": Handshake,
    "aktivitas-share": Presentation,
  } as const;
  const Icon = iconMap[stage as keyof typeof iconMap] ?? BookOpen;
  const urgent = sisa <= 60 && sisa > 0;

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

          <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight break-words md:text-5xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            Kerjakan <em className="ff-italic text-[var(--red)]">LKPD-mu</em>
          </h1>

          <p className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-[var(--ink-2)] break-words md:text-lg">
            {meta.cara}
          </p>

          <div className="mt-8">
            <TimerRing sisa={sisa} total={timerTotal} size={200} stroke={14} />
          </div>

          {!timerGuruJalan && sisa > 0 && (
            <p className="mt-3 text-xs italic text-[var(--ink-3)]">
              Menunggu guru memulai hitung mundur waktu…
            </p>
          )}

          {urgent && (
            <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-[var(--red)]">
              Sisa waktu kurang dari satu menit!
            </p>
          )}
          {sisa === 0 && (
            <p className="anim-pop mt-4 text-lg font-extrabold text-emerald-700">
              Waktu habis, perhatikan instruksi guru.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
