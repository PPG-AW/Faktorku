"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { GuruShell } from "@/components/guru-shell";
import { Eq } from "@/components/equation";
import { TimerRing } from "@/components/timer";
import { Leaderboard, type LeaderboardEntry } from "@/components/leaderboard";
import { fetcher, useGuruKode, useKelasState } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { ChevronRight, CircleStop, Play, RotateCcw, Trophy } from "lucide-react";

interface SoalStat {
  soalId: string;
  nomor: number;
  pertanyaan: string;
  tipe: string;
  skor: number;
  timer: number;
  answered: number;
  benar: number;
  kosong: number;
  avgWaktu: number;
}
interface LBData {
  session: { id: string; aktif: boolean; soalAktif: number; soalMulai: string; endedAt: string | null } | null;
  entries: LeaderboardEntry[];
  maxSkor: number;
  soalStats: SoalStat[];
  totalSoal: number;
  totalSiswa: number;
}

export default function GuruKuis() {
  const { kode } = useGuruKode();
  const { state, mutate: mutateState, offset } = useKelasState(kode, 2000);
  const { data, mutate } = useSWR<LBData>(
    state ? `/api/kuis/leaderboard/${state.kelas.id}` : null,
    fetcher,
    { refreshInterval: 2000 }
  );

  const [busy, setBusy] = useState<string | null>(null);
  const [, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 300);
    return () => clearInterval(iv);
  }, []);

  const session = data?.session ?? null;
  const aktif = session?.aktif ?? false;
  const stats = data?.soalStats ?? [];
  const soalAktif = session?.soalAktif ?? 0;
  const currentStat = stats.find((s) => s.nomor === soalAktif);

  const sisa = aktif && session
    ? Math.max(0, Math.ceil((new Date(session.soalMulai).getTime() + (currentStat?.timer ?? 60) * 1000 - (Date.now() + offset)) / 1000))
    : 0;

  async function kontrol(action: string) {
    if (!state || busy) return;
    setBusy(action);
    try {
      await fetch("/api/guru/kontrol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kelasId: state.kelas.id, action }),
      });
      await Promise.all([mutate(), mutateState()]);
    } finally {
      setBusy(null);
    }
  }

  const kuisPernah = session !== null;
  const selesaiSemua = kuisPernah && !aktif && (data?.entries.some((e) => e.sudahJawab > 0) ?? false);

  return (
    <GuruShell
      title="Kuis & Leaderboard"
      icon={<Trophy className="h-5 w-5 text-amber-300" />}
      maxW="max-w-7xl"
      headerRight={
        aktif ? (
          <div className="flex items-center gap-2">
            <button onClick={() => kontrol("kuisNext")} disabled={busy !== null} className="btn btn-primary px-4 py-2 text-sm">
              {soalAktif >= (data?.totalSoal ?? 0) ? "Akhiri & Umumkan" : "Soal Berikutnya"}
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => kontrol("kuisStop")} disabled={busy !== null} className="btn btn-danger px-3.5 py-2 text-sm">
              <CircleStop className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => kontrol("kuisStart")} disabled={busy !== null} className={cn("btn px-5 py-2 text-sm", selesaiSemua ? "btn-ghost" : "btn-amber")}>
            {selesaiSemua ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {selesaiSemua ? "Ulangi Kuis Baru" : "Mulai Kuis"}
          </button>
        )
      }
    >
      {!aktif && !selesaiSemua && (
        <div className="glass anim-pop mx-auto max-w-xl rounded-3xl p-10 text-center">
          <Trophy className="mx-auto h-14 w-14 text-amber-300" />
          <h2 className="mt-4 text-3xl font-extrabold text-white">Siap Mengadu Cepat?</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {data?.totalSoal ?? 5} soal · timer ketat per soal · opsi diacak berbeda per siswa.
            Tekan <span className="font-bold text-amber-300">Mulai Kuis</span> — semua gawai siswa
            langsung menampilkan soal pertama.
          </p>
          <button onClick={() => kontrol("kuisStart")} disabled={busy !== null} className="btn btn-amber mt-6 px-8 py-3.5 text-base">
            <Play className="h-5 w-5" /> Mulai Kuis Sekarang
          </button>
        </div>
      )}

      {(aktif || selesaiSemua) && (
        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          {/* KIRI: status sesi */}
          <div className="space-y-4">
            <div className="border-gradient rounded-3xl p-6 text-center">
              {aktif ? (
                <>
                  <p className="label !text-amber-300">Soal {soalAktif} dari {data?.totalSoal ?? "…"}</p>
                  <div className="mt-2 flex justify-center">
                    <TimerRing sisa={sisa} total={currentStat?.timer ?? 60} size={120} stroke={9} />
                  </div>
                  <p className="mono mt-3 text-sm font-semibold text-zinc-300">
                    <Eq>{currentStat?.pertanyaan ?? ""}</Eq>
                  </p>
                  <div className="mono mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white/5 p-2.5">
                      <p className="text-xl font-extrabold text-white tabular">{currentStat?.answered ?? 0}</p>
                      <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500">Jawab</p>
                    </div>
                    <div className="rounded-xl bg-emerald-400/8 p-2.5">
                      <p className="text-xl font-extrabold text-emerald-300 tabular">{currentStat?.benar ?? 0}</p>
                      <p className="text-[0.6rem] font-bold uppercase tracking-widest text-emerald-500">Benar</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2.5">
                      <p className="text-xl font-extrabold text-amber-300 tabular">{currentStat ? currentStat.skor : "—"}</p>
                      <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500">Skor</p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-zinc-500">
                    Siswa yang belum menjawab saat lanjut akan tercatat <span className="font-bold text-rose-300">KOSONG</span>.
                  </p>
                </>
              ) : (
                <>
                  <Trophy className="mx-auto h-12 w-12 text-amber-300" />
                  <h2 className="mt-3 text-2xl font-extrabold text-white">Kuis Selesai!</h2>
                  <p className="mt-1 text-sm text-zinc-400">Pengumuman juara kelas:</p>
                  <div className="mono mt-3 inline-flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gradient tabular">{data?.entries[0]?.skor ?? 0}</span>
                    <span className="text-zinc-500">/{data?.maxSkor ?? 0} poin tertinggi</span>
                  </div>
                </>
              )}
            </div>

            {/* Statistik per soal */}
            <div className="glass rounded-3xl p-5">
              <p className="label">Statistik per soal</p>
              <div className="space-y-2">
                {stats.map((s) => {
                  const isActive = aktif && s.nomor === soalAktif;
                  const pct = s.answered > 0 ? Math.round((s.benar / s.answered) * 100) : 0;
                  return (
                    <div key={s.soalId} className={cn("rounded-xl border px-3.5 py-2.5", isActive ? "border-amber-400/40 bg-amber-400/8" : "border-white/6 bg-white/2")}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-200">Soal {s.nomor}</span>
                        <span className="mono text-zinc-500 tabular">{s.answered} jawab · avg {s.avgWaktu}s</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                          <div className="bar-grow h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="mono w-10 text-right text-xs font-bold text-emerald-300 tabular">{pct}%</span>
                      </div>
                      {s.kosong > 0 && <p className="mt-1 text-[0.65rem] text-rose-400/80">{s.kosong} kosong</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KANAN: leaderboard */}
          <div className="glass rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-extrabold text-white">
                Leaderboard {aktif && <span className="text-sm font-semibold text-amber-300">— LIVE</span>}
              </p>
              <span className="chip mono tabular">{data?.entries.filter((e) => e.sudahJawab > 0).length ?? 0}/{data?.totalSiswa ?? 0} menjawab</span>
            </div>
            <Leaderboard entries={data?.entries ?? []} maxSkor={data?.maxSkor ?? 100} />
          </div>
        </div>
      )}
    </GuruShell>
  );
}
