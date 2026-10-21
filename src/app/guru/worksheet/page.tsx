"use client";

import useSWR from "swr";
import { GuruShell } from "@/components/guru-shell";
import { Eq } from "@/components/equation";
import { fetcher, useGuruKode, useKelasState } from "@/hooks/use-session";
import { cn, formatWaktu } from "@/lib/utils";
import { BadgeCheck, CircleDashed, Lightbulb, PenLine } from "lucide-react";

interface PerSoal {
  soalId: string;
  nomor: number;
  pertanyaan: string;
  tipe: string;
  selesai: number;
  benar: number;
  avgSkor: number;
  avgHint: number;
  avgWaktu: number;
}
interface MatrixRow {
  siswaId: string;
  nama: string;
  perSoal: Record<string, { skor: number; benar: boolean; hint: number } | null>;
  totalSkor: number;
}

export default function GuruWorksheet() {
  const { kode } = useGuruKode();
  const { state } = useKelasState(kode, 4000);
  const { data } = useSWR<{ soal: PerSoal[]; matrix: MatrixRow[]; totalSiswa: number }>(
    state ? `/api/worksheet/hasil/${state.kelas.id}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const soals = data?.soal ?? [];
  const sorted = [...(data?.matrix ?? [])].sort((a, b) => b.totalSkor - a.totalSkor);

  return (
    <GuruShell title="Monitor Worksheet" icon={<PenLine className="h-5 w-5 text-emerald-300" />}>
      {/* Ringkasan per soal */}
      <div className="grid gap-3 md:grid-cols-3">
        {soals.map((s, i) => {
          const pct = data && data.totalSiswa > 0 ? Math.round((s.selesai / data.totalSiswa) * 100) : 0;
          const pctBenar = s.selesai > 0 ? Math.round((s.benar / s.selesai) * 100) : 0;
          return (
            <div key={s.soalId} className="glass anim-rise rounded-3xl p-5" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center justify-between">
                <span className="mono text-xs font-bold uppercase tracking-widest text-zinc-500">Soal {s.nomor} · {s.tipe === "metode-ac" ? "Metode AC" : "T-Faktor"}</span>
                <span className={cn("chip !text-[0.65rem]", pctBenar >= 70 ? "!text-emerald-300 border-emerald-400/25 bg-emerald-400/8" : "!text-amber-300 border-amber-400/25 bg-amber-400/8")}>
                  {pctBenar}% benar
                </span>
              </div>
              <p className="mono mt-2 text-sm font-semibold text-zinc-200"><Eq>{s.pertanyaan.replace(/^Faktorkan:?\s*/i, "").replace(/Faktorkan dengan Metode AC:\s*/i, "")}</Eq></p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                <div className="bar-grow h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                <span>{s.selesai}/{data?.totalSiswa ?? 0} selesai</span>
                <span>avg skor <span className="mono font-bold text-zinc-300">{s.avgSkor}</span></span>
                <span className="flex items-center gap-1"><Lightbulb className="h-3 w-3 text-amber-300" />{s.avgHint}</span>
                <span className="mono">{formatWaktu(s.avgWaktu)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matriks siswa */}
      <div className="glass anim-rise anim-fade-up-1 mt-4 overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3 text-xs uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-3.5 text-left font-bold">Siswa</th>
                {soals.map((s) => (
                  <th key={s.soalId} className="px-4 py-3.5 text-center font-bold">Soal {s.nomor}</th>
                ))}
                <th className="px-5 py-3.5 text-right font-bold">Total Skor</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, ri) => (
                <tr key={row.siswaId} className="border-b border-white/4 transition-colors hover:bg-white/3">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="mono w-5 text-center text-xs font-bold text-zinc-600 tabular">{ri + 1}</span>
                      <span className="font-semibold text-zinc-200">{row.nama}</span>
                    </div>
                  </td>
                  {soals.map((s) => {
                    const cell = row.perSoal[s.soalId];
                    return (
                      <td key={s.soalId} className="px-4 py-3 text-center">
                        {cell ? (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold",
                            cell.benar ? "bg-emerald-400/12 text-emerald-300" : "bg-amber-400/12 text-amber-300"
                          )}>
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {cell.skor}
                            {cell.hint > 0 && (
                              <span className="flex items-center text-amber-400/80">
                                <Lightbulb className="h-3 w-3" />
                                {cell.hint}
                              </span>
                            )}
                          </span>
                        ) : (
                          <CircleDashed className="mx-auto h-4 w-4 text-zinc-700" />
                        )}
                      </td>
                    );
                  })}
                  <td className="mono px-5 py-3 text-right text-sm font-extrabold text-white tabular">
                    {row.totalSkor}
                    <span className="text-zinc-600">/{soals.length * 100}</span>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={soals.length + 2} className="px-5 py-10 text-center text-sm text-zinc-500">
                    Belum ada siswa di kelas ini. Bagikan kode kelas dari dasbor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </GuruShell>
  );
}
