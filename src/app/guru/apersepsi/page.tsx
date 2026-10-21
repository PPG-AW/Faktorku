"use client";

import useSWR from "swr";
import { GuruShell } from "@/components/guru-shell";
import { Eq } from "@/components/equation";
import { WordCloud } from "@/components/word-cloud";
import { fetcher, useGuruKode, useKelasState } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { CheckCircle2, MessageSquareText, Target, XCircle } from "lucide-react";

interface PerSoalPG {
  soalId: string;
  nomor: number;
  pertanyaan: string;
  tipe: string;
  opsi: { A: string; B: string; C: string; D: string } | null;
  kunci: string;
  terjawab: number;
  benar: number;
  opsiCount: Record<string, number>;
}
interface PerSoalTerbuka {
  soalId: string;
  nomor: number;
  pertanyaan: string;
  tipe: string;
  terjawab: number;
  texts: string[];
}
type PerSoal = PerSoalPG | PerSoalTerbuka;

export default function GuruApersepsi() {
  const { kode } = useGuruKode();
  const { state } = useKelasState(kode, 4000);
  const kelasId = state?.kelas.id;

  const { data } = useSWR<{ soal: PerSoal[]; totalSiswa: number; siswaMenjawab: number }>(
    kelasId ? `/api/apersepsi/hasil/${kelasId}` : null,
    fetcher,
    { refreshInterval: 2500 }
  );

  const terbukaTexts = (data?.soal.find((s) => s.tipe === "terbuka") as PerSoalTerbuka | undefined)?.texts ?? [];

  return (
    <GuruShell title="Hasil Apersepsi — Real-Time" icon={<Target className="h-5 w-5 text-rose-300" />}>
      <div className="glass mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
        <p className="text-sm text-zinc-300">
          <span className="mono text-lg font-extrabold text-white tabular">{data?.siswaMenjawab ?? 0}</span>
          <span className="text-zinc-500">/{data?.totalSiswa ?? 0} siswa sudah mulai menjawab</span>
        </p>
        <span className="chip !text-rose-300 border-rose-400/25 bg-rose-400/8">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-rose-400" /> Live
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(data?.soal ?? []).filter((s) => s.tipe !== "terbuka").map((s0) => {
          const s = s0 as PerSoalPG;
          const pct = s.terjawab > 0 ? Math.round((s.benar / s.terjawab) * 100) : 0;
          return (
            <div key={s.soalId} className="glass anim-rise rounded-3xl p-5" style={{ animationDelay: `${(s.nomor - 1) * 0.06}s` }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold leading-snug text-zinc-100">
                  <span className="mono mr-2 text-indigo-300">#{s.nomor}</span>
                  <Eq>{s.pertanyaan}</Eq>
                </p>
                <span className={cn("chip shrink-0", pct >= 70 ? "!text-emerald-300 border-emerald-400/25 bg-emerald-400/8" : pct >= 40 ? "!text-amber-300 border-amber-400/25 bg-amber-400/8" : "!text-rose-300 border-rose-400/25 bg-rose-400/8")}>
                  {pct >= 70 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {pct}% benar
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {(Object.entries(s.opsi ?? {}) as [string, string][]).map(([key, val]) => {
                  const n = s.opsiCount[key] ?? 0;
                  const max = Math.max(1, ...(Object.values(s.opsiCount).map((v) => v ?? 0)));
                  const isKey = key === s.kunci;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className={cn("mono flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold", isKey ? "bg-emerald-400/20 text-emerald-300" : "bg-white/8 text-zinc-400")}>
                        {key}
                      </span>
                      <div className="h-8 flex-1 overflow-hidden rounded-lg bg-white/5">
                        <div
                          className={cn("bar-grow flex h-full items-center rounded-lg px-2.5 transition-all", isKey ? "bg-gradient-to-r from-emerald-500/70 to-emerald-400/40" : "bg-gradient-to-r from-indigo-500/50 to-indigo-400/25")}
                          style={{ width: `${Math.max(n === 0 ? 0 : 8, (n / max) * 100)}%` }}
                        >
                          <span className="mono text-xs font-bold text-white/95 tabular">{n}</span>
                        </div>
                      </div>
                      <span className="mono w-28 truncate text-right text-xs text-zinc-400"><Eq>{val}</Eq></span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-zinc-500">{s.terjawab} jawaban masuk</p>
            </div>
          );
        })}
      </div>

      {/* Word cloud pertanyaan terbuka */}
      <div className="glass anim-rise mt-4 rounded-3xl p-6">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4.5 w-4.5 text-violet-300" />
          <p className="font-bold text-white">Soal Terbuka: “Pernahkah kamu berjualan?”</p>
        </div>
        <WordCloud texts={terbukaTexts} />
        {terbukaTexts.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-semibold text-zinc-500 hover:text-zinc-300">
              Lihat {terbukaTexts.length} jawaban mentah
            </summary>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {terbukaTexts.map((t, i) => (
                <p key={i} className="rounded-xl border border-white/8 bg-white/3 px-3.5 py-2.5 text-xs leading-relaxed text-zinc-300">“{t}”</p>
              ))}
            </div>
          </details>
        )}
      </div>
    </GuruShell>
  );
}
