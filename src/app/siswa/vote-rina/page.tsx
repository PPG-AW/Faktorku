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
            <Vote className="h-3.5 w-3.5" /> Kasus untuk Dijawab
          </span>
          <h1 className="mt-3 text-center text-2xl font-extrabold leading-tight md:text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            Rina Mendapat Pesanan 30 Kaos
          </h1>
          <p className="mt-1 text-center text-xs text-[var(--ink-3)] md:text-sm">
            Minggu ini Rina menerima pesanan sebanyak 30 kaos. Semua pesanan selesai dan terjual habis.
          </p>

          {/* Tabel Data Usaha Rina */}
          <div className="glass mt-5 overflow-hidden rounded-2xl border-2 border-[var(--hairline-strong)]">
            <div className="border-b border-[var(--hairline)] bg-[var(--paper-2)] px-4 py-2">
              <p className="label !mb-0 text-[0.65rem]">Data Perhitungan Minggu Ini</p>
            </div>
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="border-b border-[var(--hairline)] bg-[var(--card)] font-bold text-[var(--ink-2)]">
                <tr>
                  <th className="px-3.5 py-2">Komponen</th>
                  <th className="px-3.5 py-2">Perhitungan</th>
                  <th className="px-3.5 py-2 text-right">Hasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hairline)]">
                <tr className="bg-emerald-500/5">
                  <td className="px-3.5 py-2 font-semibold text-emerald-800">Uang masuk</td>
                  <td className="mono px-3.5 py-2 text-zinc-600">50 ribu × 30 kaos</td>
                  <td className="mono px-3.5 py-2 text-right font-bold text-emerald-700">1,5 juta</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-semibold text-[var(--ink)]">Bahan sablon</td>
                  <td className="mono px-3.5 py-2 text-zinc-600">30 ribu × 30 kaos</td>
                  <td className="mono px-3.5 py-2 text-right font-semibold">900 ribu</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-semibold text-[var(--ink)]">Upah tenaga kerja</td>
                  <td className="mono px-3.5 py-2 text-zinc-600">30 ribu × 30 kaos</td>
                  <td className="mono px-3.5 py-2 text-right font-semibold">900 ribu</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-semibold text-[var(--ink)]">Sewa dan listrik</td>
                  <td className="mono px-3.5 py-2 text-zinc-600">tetap seminggu</td>
                  <td className="mono px-3.5 py-2 text-right font-semibold">75 ribu</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <p className="text-center text-sm font-bold text-[var(--ink)] md:text-base">
              Menurutmu, apakah Rina untung atau rugi pada minggu ini?
            </p>
            <div className="mt-3 space-y-2.5">
              {OPSI.map((o) => {
                const aktif = pilih === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => kirim(o.key)}
                    className={cn(
                      "flex w-full items-center gap-3 border-2 px-4 py-3 text-left text-sm font-bold transition-all md:text-base",
                      aktif ? "border-[var(--red)] bg-[var(--red)] text-white shadow-[2px_2px_0_var(--ink)]" : "border-[var(--hairline-strong)] bg-[var(--card)] hover:-translate-y-0.5"
                    )}
                  >
                    <span className={cn("grid h-6 w-6 shrink-0 place-items-center border-2", aktif ? "border-white bg-white text-[var(--red)]" : "border-[var(--ink-3)]")}>
                      {aktif && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {pilih && (
            <p className="anim-rise mt-5 text-center text-sm text-emerald-700">
              Pilihanmu tercatat, lihat layar depan untuk hasil seluruh kelas.
            </p>
          )}
          <p className="mono mt-3 text-center text-xs tabular text-[var(--ink-3)]">
            {data?.terisi ?? 0}/{data?.total ?? 0} teman sudah memilih
          </p>
        </div>
      </div>
    </main>
  );
}
