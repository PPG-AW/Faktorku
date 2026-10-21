"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { Check, Vote } from "lucide-react";

const OPSI = [
  { key: "untung", label: "Rina untung" },
  { key: "rugi", label: "Rina rugi" },
  { key: "impas", label: "Pas, tidak untung tidak rugi" },
];

export default function SiswaVotePage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 2000);
  useStageFollow(state?.kelas.stage, "vote-rina", state?.kelas.stage !== "vote-rina");

  const { data, mutate } = useSWR<{ sayaPilih: string | null; terisi: number; total: number }>(
    siswa ? `/api/voting?kelasId=${siswa.kelasId}&topik=untung-rugi&siswaId=${siswa.siswaId}` : null,
    fetcher, { refreshInterval: 2500 }
  );

  const [pilih, setPilih] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data?.sayaPilih) setPilih(data.sayaPilih); }, [data?.sayaPilih]);

  if (!ready || !siswa) return null;

  async function kirim(key: string) {
    if (busy) return;
    setBusy(true); setPilih(key);
    try {
      await fetch("/api/voting", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: siswa!.siswaId, topik: "untung-rugi", pilihan: key }),
      });
      mutate();
    } finally { setBusy(false); }
  }

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="chip">{siswa.nama}</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          <span className="chip mx-auto uppercase tracking-[0.2em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8">
            <Vote className="h-3.5 w-3.5" /> Pendapatmu
          </span>
          <h1 className="mt-4 text-center text-xl sm:text-2xl leading-tight break-words font-extrabold md:text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            Rina menerima pesanan 30 kaos. Menurutmu dia{" "}
            <em className="ff-italic text-[var(--red)]">untung atau rugi</em>?
          </h1>

          {/* Rincian data pesanan 30 kaos agar siswa dapat membaca konteks */}
          <div className="mt-4 border-2 border-[var(--hairline-strong)] bg-[var(--card)] p-3 text-xs sm:text-sm">
            <p className="font-bold text-[var(--ink)] mb-2 text-center text-xs uppercase tracking-wider text-[var(--red)]">
              Data Pesanan 30 Kaos
            </p>
            <div className="space-y-1.5 mono">
              <div className="flex justify-between border-b border-dashed border-[var(--hairline)] pb-1">
                <span>Uang masuk (50 × 30):</span>
                <b className="text-emerald-700">1,5 juta</b>
              </div>
              <div className="flex justify-between border-b border-dashed border-[var(--hairline)] pb-1">
                <span>Bahan sablon (30 × 30):</span>
                <span>900 ribu</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-[var(--hairline)] pb-1">
                <span>Upah tenaga (30 × 30):</span>
                <span>900 ribu</span>
              </div>
              <div className="flex justify-between">
                <span>Sewa & listrik tetap:</span>
                <span>75 ribu</span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {OPSI.map((o) => {
              const aktif = pilih === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => kirim(o.key)}
                  className={cn(
                    "flex w-full items-center gap-3 border-2 px-4 py-3 text-left text-sm sm:text-base font-bold transition-all",
                    aktif ? "border-[var(--red)] bg-[var(--red)] text-white" : "border-[var(--hairline-strong)] bg-[var(--card)] hover:-translate-y-0.5"
                  )}
                >
                  <span className={cn("grid h-6 w-6 shrink-0 place-items-center border-2", aktif ? "border-white bg-white text-[var(--red)]" : "border-[var(--ink-3)]")}>
                    {aktif && <Check className="h-4 w-4" strokeWidth={3} />}
                  </span>
                  {o.label}
                </button>
              );
            })}
          </div>

          {pilih && (
            <p className="anim-rise mt-4 text-center text-sm font-semibold text-emerald-700">
              Pilihanmu tercatat! Perhatikan guru saat membahas jawaban bersama di layar.
            </p>
          )}
          <p className="mono mt-2 text-center text-xs tabular text-[var(--ink-3)]">
            {data?.terisi ?? 0}/{data?.total ?? 0} teman sudah memilih
          </p>
        </div>
      </div>
    </main>
  );
}
