"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { GuruShell } from "@/components/guru-shell";
import { SlideViewer } from "@/components/slide-viewer";
import { fetcher, useGuruKode, useKelasState } from "@/hooks/use-session";
import type { SlideKonten } from "@/db/schema";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Lock, LockOpen, Presentation } from "lucide-react";

interface SlideRow {
  nomor: number;
  judul: string;
  konten: SlideKonten;
}

export default function GuruSlide() {
  const { kode } = useGuruKode();
  const { state, mutate } = useKelasState(kode, 2000);
  const { data } = useSWR<{ slide: SlideRow[] }>("/api/slide", fetcher);
  const slides = useMemo(() => data?.slide ?? [], [data]);
  const [busy, setBusy] = useState(false);

  const { data: siswaData } = useSWR<{ siswa: { id: string; nama: string; online: boolean }[] }>(
    state ? `/api/guru/${state.kelas.id}/siswa` : null,
    fetcher,
    { refreshInterval: 6000 }
  );

  const slideAktif = state?.kelas.slideAktif ?? 1;
  const locked = state?.kelas.slideLocked ?? true;
  const current = slides.find((s) => s.nomor === slideAktif);

  const kontrol = useCallback(
    async (action: string, value?: unknown) => {
      if (!state || busy) return;
      setBusy(true);
      try {
        await fetch("/api/guru/kontrol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kelasId: state.kelas.id, action, value }),
        });
        await mutate();
      } finally {
        setBusy(false);
      }
    },
    [state, busy, mutate]
  );

  // Keyboard: panah navigasi, L = lock
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") kontrol("slideNext");
      else if (e.key === "ArrowLeft") kontrol("slidePrev");
      else if (e.key.toLowerCase() === "l") kontrol("slideLock", !locked);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [kontrol, locked]);

  const total = slides.length || state?.kelas.slideTotal || 18;

  return (
    <GuruShell
      title="Kontrol Slide"
      icon={<Presentation className="h-5 w-5 text-sky-300" />}
      maxW="max-w-7xl"
      headerRight={
        <button onClick={() => kontrol("slideLock", !locked)} className={cn("btn px-4 py-2 text-sm", locked ? "btn-amber" : "btn-ghost")}>
          {locked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
          {locked ? "Terkunci" : "Bebas"}
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* PANEL KIRI */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <p className="label !mb-0">Slide aktif</p>
              <span className="mono text-sm font-bold text-zinc-400 tabular">{slideAktif}/{total}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => kontrol("slidePrev")} disabled={busy || slideAktif <= 1} className="btn btn-ghost py-3.5">
                <ChevronLeft className="h-5 w-5" /> Prev
              </button>
              <button onClick={() => kontrol("slideNext")} disabled={busy || slideAktif >= total} className="btn btn-primary py-3.5">
                Next <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <p className="mono mt-3 text-center text-[0.65rem] text-zinc-600">← → navigasi · L kunci</p>
          </div>

          <div className="glass max-h-[46vh] overflow-y-auto rounded-3xl p-4">
            <p className="label">Daftar slide</p>
            <div className="space-y-1">
              {slides.map((s) => {
                const done = s.nomor < slideAktif;
                const active = s.nomor === slideAktif;
                return (
                  <button
                    key={s.nomor}
                    onClick={() => kontrol("slideSet", s.nomor)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      active ? "bg-indigo-500/20 text-white" : "text-zinc-400 hover:bg-white/5"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : active ? (
                      <span className="pulse-dot h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    )}
                    <span className="mono w-6 shrink-0 text-xs tabular">{s.nomor}.</span>
                    <span className={cn("truncate font-semibold", active && "text-indigo-100")}>{s.judul}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-3xl p-4">
            <p className="label">Siswa online ({(siswaData?.siswa ?? []).filter((s) => s.online).length}/{(siswaData?.siswa ?? []).length})</p>
            <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
              {(siswaData?.siswa ?? []).map((s) => (
                <span key={s.id} className={cn("chip !text-[0.68rem]", s.online ? "!text-emerald-300 border-emerald-400/25 bg-emerald-400/8" : "opacity-50")}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.online ? "bg-emerald-400 pulse-dot" : "bg-zinc-600")} />
                  {s.nama.split(" ")[0]}
                </span>
              ))}
              {(siswaData?.siswa ?? []).length === 0 && <p className="text-xs text-zinc-500">Belum ada siswa masuk.</p>}
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="glass flex min-h-[70vh] flex-col overflow-hidden rounded-[2rem] p-6 md:p-10">
          <p className="label !text-zinc-500">Pratinjau proyektor · slide {slideAktif}</p>
          <div className="flex flex-1">
            {current ? (
              <SlideViewer konten={current.konten} nomor={current.nomor} total={total} />
            ) : (
              <p className="self-center text-zinc-500">Memuat…</p>
            )}
          </div>
        </div>
      </div>
    </GuruShell>
  );
}
