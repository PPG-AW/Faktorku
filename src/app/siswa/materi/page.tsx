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

  // Untuk siswa, jangan tampilkan PR pada slide preview (nomor 22)
  let displayKonten = item.konten;
  if (item.key === "preview" && displayKonten) {
    displayKonten = {
      ...displayKonten,
      title: "Pertemuan Berikutnya",
      sub: "Rumus ABC + Melengkapkan Kuadrat Sempurna",
      blocks: displayKonten.blocks.filter((b) => {
        if (b.t === "steps") return false;
        if (b.t === "box" && (b.title?.toLowerCase().includes("pr") || b.title?.toLowerCase().includes("bonus"))) return false;
        if (b.t === "text" && b.v.toLowerCase().includes("kumpulkan")) return false;
        return true;
      }),
    };
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-x-hidden">
      <Ambient />
      <div className="relative z-10 flex items-center justify-between border-b-2 border-[var(--ink)] bg-[var(--card)] px-3 py-3 sm:px-5">
        <div className="flex items-center gap-2 sm:gap-3">
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

      <div className="relative z-10 flex flex-1 items-stretch px-2 py-3 sm:px-4 sm:py-5 md:px-8">
        <div className="glass relative flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
          {displayKonten ? (
            <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center py-2">
              <SlideViewer konten={displayKonten} nomor={item.nomor} total={total} />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--ink-3)]">
              <Hourglass className="h-8 w-8 animate-spin [animation-duration:4s]" />
              <p className="text-sm">Menunggu guru membuka aktivitas…</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex justify-center px-3 pb-3 sm:px-5 sm:pb-5">
        <span className="chip !text-[var(--ink-3)] text-center text-xs">
          <MonitorUp className="h-3.5 w-3.5 shrink-0" /> Layar mengikuti slide guru, perhatikan juga proyektor
        </span>
      </div>
    </main>
  );
}
