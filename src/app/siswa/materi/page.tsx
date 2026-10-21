"use client";

import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { SlideViewer } from "@/components/slide-viewer";
import { DECK_TOTAL, deckByNomor } from "@/lib/deck-slides";
import { useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { Hourglass, MonitorUp } from "lucide-react";

export default function SiswaMateriPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 1500);
  useStageFollow(state?.kelas.stage, "materi");

  if (!ready || !siswa) return null;

  const nomor = state?.kelas.slideAktif ?? 1;
  const item = deckByNomor(nomor);
  const total = DECK_TOTAL;

  return (
    <main className="relative flex min-h-screen flex-col">
      <Ambient />
      <div className="relative z-10 flex items-center justify-between border-b-2 border-[var(--ink)] bg-[var(--card)] px-5 py-3">
        <div className="flex items-center gap-3">
          <Logo compact />
          <span className="chip hidden sm:inline-flex">
            <item.icon className="h-3.5 w-3.5" /> {item.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="mono chip !text-[0.68rem] tabular">{nomor}/{total}</span>
          <span className="chip hidden md:inline-flex">{siswa.nama}</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-stretch px-4 py-5 md:px-8">
        <div className="glass relative flex-1 overflow-hidden p-6 md:p-10">
          {item.konten ? (
            <div className="mx-auto flex h-full max-w-3xl flex-col justify-center">
              <SlideViewer konten={item.konten} nomor={item.nomor} total={total} />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--ink-3)]">
              <Hourglass className="h-8 w-8 animate-spin [animation-duration:4s]" />
              <p className="text-sm">Menunggu guru membuka aktivitas…</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex justify-center px-5 pb-5">
        <span className="chip !text-[var(--ink-3)]">
          <MonitorUp className="h-3.5 w-3.5" /> Layar mengikuti slide guru, perhatikan juga proyektor
        </span>
      </div>
    </main>
  );
}
