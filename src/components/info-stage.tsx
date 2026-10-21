"use client";

import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { SlideViewer } from "@/components/slide-viewer";
import { INFO_KONTEN, stageMeta } from "@/lib/stages";
import { useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { MonitorUp } from "lucide-react";

/** Halaman stage konten (tujuan / presentasi / penutup) — mengikuti paparan guru di papan */
export function InfoStagePage({ stage }: { stage: "tujuan" | "presentasi" | "penutup" }) {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 2500);
  useStageFollow(state?.kelas.stage, stage, state?.kelas.stage !== stage);

  if (!ready || !siswa) return null;
  const konten = INFO_KONTEN[stage];
  const meta = stageMeta(stage);

  return (
    <main className="relative flex min-h-screen flex-col">
      <Ambient />
      <div className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Logo compact />
          <span className="chip hidden sm:inline-flex">
            <meta.icon className="h-3.5 w-3.5" /> {meta.label} · {meta.fase}
          </span>
        </div>
        <span className="chip">{siswa.nama}</span>
      </div>

      <div className="relative z-10 flex flex-1 items-stretch px-4 pb-5 md:px-8 md:pb-8">
        <div className="glass relative flex-1 overflow-hidden rounded-[2rem] p-6 md:p-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
          <div className="mx-auto flex h-full max-w-3xl flex-col justify-center">
            <SlideViewer konten={konten} nomor={1} total={1} />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-center px-5 pb-6">
        <span className="chip !text-zinc-400">
          <MonitorUp className="h-3.5 w-3.5" /> Perhatikan juga paparan guru di layar proyektor
        </span>
      </div>
    </main>
  );
}
