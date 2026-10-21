"use client";

import useSWR from "swr";
import { GuruShell } from "@/components/guru-shell";
import { WordCloud } from "@/components/word-cloud";
import { fetcher, useGuruKode, useKelasState } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { AlertTriangle, BookOpenCheck, CheckCircle2, CloudSun, Home, Star } from "lucide-react";

interface Rekap {
  totalSiswa: number;
  terisi: number;
  tujuan: { tujuan1: number; tujuan2: number; tujuan3: number };
  rating: { tf: number; ac: number };
  kesulitanTexts: string[];
  tugasRumah: { nama: string; teks: string }[];
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("h-4 w-4", n <= Math.round(value) ? "fill-amber-300 text-amber-300" : "text-zinc-700")} />
      ))}
      <span className="mono ml-1.5 text-sm font-bold text-amber-200 tabular">{value.toFixed(1)}</span>
    </span>
  );
}

export default function GuruRefleksi() {
  const { kode } = useGuruKode();
  const { state } = useKelasState(kode, 5000);
  const { data } = useSWR<Rekap>(
    state ? `/api/refleksi/rekap/${state.kelas.id}` : null,
    fetcher,
    { refreshInterval: 4000 }
  );

  const TUJUAN = [
    { key: "tujuan1" as const, label: "Paham konsep persamaan kuadrat", n: data?.tujuan.tujuan1 ?? 0 },
    { key: "tujuan2" as const, label: "Bisa T-Faktor (a = 1)", n: data?.tujuan.tujuan2 ?? 0 },
    { key: "tujuan3" as const, label: "Bisa Metode AC (a > 1)", n: data?.tujuan.tujuan3 ?? 0 },
  ];

  return (
    <GuruShell title="Rekap Refleksi Kelas" icon={<CloudSun className="h-5 w-5 text-violet-300" />}>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ketercapaian tujuan */}
        <div className="glass anim-rise rounded-3xl p-6">
          <p className="label flex items-center gap-2"><BookOpenCheck className="h-3.5 w-3.5" /> Ketercapaian tujuan pembelajaran</p>
          <div className="mt-4 space-y-4">
            {TUJUAN.map((t) => {
              const terisi = Math.max(data?.terisi ?? 0, 1);
              const pct = Math.round((t.n / terisi) * 100);
              const baik = pct >= 75;
              return (
                <div key={t.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold text-zinc-200">
                      {baik ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 text-amber-300" />}
                      {t.label}
                    </span>
                    <span className="mono text-xs font-bold text-zinc-400 tabular">{t.n}/{data?.terisi ?? 0} ({pct}%)</span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className={cn("bar-grow h-full rounded-full", baik ? "bg-gradient-to-r from-emerald-500 to-emerald-300" : "bg-gradient-to-r from-amber-500 to-orange-400")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Rating T-Faktor</p>
              <div className="mt-2"><Stars value={data?.rating.tf ?? 0} /></div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Rating Metode AC</p>
              <div className="mt-2"><Stars value={data?.rating.ac ?? 0} /></div>
            </div>
          </div>

          <p className="mono mt-5 text-xs text-zinc-500 tabular">
            {data?.terisi ?? 0}/{data?.totalSiswa ?? 0} siswa mengisi refleksi
          </p>
        </div>

        {/* Word cloud */}
        <div className="glass anim-rise anim-fade-up-1 rounded-3xl p-6">
          <p className="label">Word cloud “bagian paling sulit”</p>
          <WordCloud texts={data?.kesulitanTexts ?? []} />
        </div>
      </div>

      {/* Tugas rumah */}
      <div className="glass anim-rise anim-fade-up-2 mt-4 rounded-3xl p-6">
        <p className="label flex items-center gap-2"><Home className="h-3.5 w-3.5" /> Karya tugas rumah — persamaan kuadrat dari kehidupan nyata</p>
        {(data?.tugasRumah ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">Belum ada tugas rumah yang masuk.</p>
        ) : (
          <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
            {(data?.tugasRumah ?? []).map((t, i) => (
              <div key={i} className="anim-rise rounded-2xl border border-white/8 bg-white/3 p-4" style={{ animationDelay: `${Math.min(i * 0.05, 0.6)}s` }}>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">{t.nama}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">“{t.teks}”</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </GuruShell>
  );
}
