"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { SlideViewer } from "@/components/slide-viewer";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import type { SlideKonten } from "@/db/schema";
import { ChevronLeft, ChevronRight, Hourglass, Lock, LockOpen, MonitorPlay } from "lucide-react";

interface SlideRow {
  nomor: number;
  judul: string;
  konten: SlideKonten;
}

export default function SiswaSlidePage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 1500);
  useStageFollow(state?.kelas.stage, "slide", state?.kelas.stage !== "slide");

  const { data } = useSWR<{ slide: SlideRow[] }>("/api/slide", fetcher);
  const slides = data?.slide ?? [];

  const slideAktif = state?.kelas.slideAktif ?? 1;
  const locked = state?.kelas.slideLocked ?? true;
  const [freeIndex, setFreeIndex] = useState(1);

  // Saat tidak terkunci, siswa bebas; saat terkunci, paksa ikut guru
  useEffect(() => {
    if (locked) setFreeIndex(slideAktif);
  }, [locked, slideAktif]);

  const currentNomor = locked ? slideAktif : freeIndex;
  const current = slides.find((s) => s.nomor === currentNomor);

  if (!ready || !siswa) return null;

  return (
    <main className="relative flex min-h-screen flex-col">
      <Ambient />
      <div className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Logo compact />
          <span className="chip hidden sm:inline-flex"><MonitorPlay className="h-3.5 w-3.5" /> Slide {currentNomor} dari {slides.length || "…"}</span>
        </div>
        <div className="flex items-center gap-2">
          {locked ? (
            <span className="chip !text-amber-300 border-amber-400/25 bg-amber-400/8">
              <Lock className="h-3.5 w-3.5" /> Navigasi dikunci guru
            </span>
          ) : (
            <span className="chip !text-emerald-300 border-emerald-400/25 bg-emerald-400/8">
              <LockOpen className="h-3.5 w-3.5" /> Mode jelajah bebas
            </span>
          )}
          <span className="chip hidden md:inline-flex">{siswa.nama}</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-stretch px-4 pb-5 md:px-8 md:pb-8">
        <div className="glass relative flex-1 overflow-hidden rounded-[2rem] p-6 md:p-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
          {!current ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-500">
              <Hourglass className="h-8 w-8 animate-spin [animation-duration:4s]" />
              <p className="text-sm">Menyiapkan slide…</p>
            </div>
          ) : (
            <SlideViewer konten={current.konten} nomor={current.nomor} total={slides.length} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between px-5 pb-6 md:px-10">
        <div className="mono text-xs font-semibold text-zinc-500 tabular">
          {String(currentNomor).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>

        {locked ? (
          <div className="chip !text-zinc-400">
            <Hourglass className="h-3.5 w-3.5 animate-spin [animation-duration:5s]" />
            Menunggu guru lanjut…
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              disabled={currentNomor <= 1}
              onClick={() => setFreeIndex((i) => Math.max(1, i - 1))}
              className="btn btn-ghost px-4 py-2.5"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <div className="hidden items-center gap-1 md:flex">
              {slides.map((s) => (
                <span key={s.nomor} className={`h-1.5 rounded-full transition-all ${s.nomor === currentNomor ? "w-6 bg-indigo-400" : "w-1.5 bg-white/15"}`} />
              ))}
            </div>
            <button
              disabled={currentNomor >= slides.length}
              onClick={() => setFreeIndex((i) => Math.min(slides.length, i + 1))}
              className="btn btn-ghost px-4 py-2.5"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
