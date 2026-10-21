"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Eq } from "@/components/equation";
import { Leaderboard, type LeaderboardEntry } from "@/components/leaderboard";
import { TimerRing } from "@/components/timer";
import { WordCloud } from "@/components/word-cloud";
import { fetcher } from "@/hooks/use-session";
import { COBA, POLA_ROWS, SORT_ITEMS } from "@/lib/aktivitas-data";
import { cn, formatWaktu } from "@/lib/utils";
import type { PanelProps } from "@/components/deck/panels-a";
import {
  BadgeCheck, CheckCircle2, ChevronRight, CircleStop, Download, Lightbulb,
  Play, RotateCcw, Shapes, Sparkles, Star, Table2, Target, Trophy,
} from "lucide-react";

/* ============================ 6. COBA-COBA =============================== */

export function DeckCoba({ monitor }: PanelProps) {
  const cob = monitor?.agg.cobaCoba;
  const siswa = monitor?.siswa ?? [];
  const maxAttempts = Math.max(1, ...siswa.map((s) => s.progress.cobacoba.attempts));
  const pencoba = siswa.filter((s) => s.progress.cobacoba.attempts > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="text-center">
        <span className="chip !text-sky-300 border-sky-400/30 bg-sky-400/10 uppercase tracking-[0.2em] !text-[0.6rem]">
          Fase 2 · Problem Statement
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
          Coba Tebak Nilai <span className="text-gradient"><Eq>x</Eq></span>!
        </h1>
        <div className="mono eq-badge mx-auto mt-4 w-fit px-6 py-3 text-2xl font-bold text-indigo-100 xl:text-3xl">
          <Eq>{`${COBA.eq} = 0`}</Eq>
        </div>
      </div>

      <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Penemu akar */}
        <div className="space-y-3">
          <div className="glass rounded-3xl p-5 text-center">
            <p className="mono text-4xl font-extrabold text-white tabular">{cob?.totalAttempts ?? 0}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">tebakan kelas · {pencoba.length} siswa mencoba</p>
          </div>
          {COBA.akar.map((r) => {
            const founders = cob?.founders[String(r)] ?? [];
            return (
              <div key={r} className={cn("rounded-3xl border p-5", founders.length > 0 ? "border-emerald-400/30 bg-emerald-400/8" : "border-white/10 bg-white/3")}>
                <div className="flex items-center justify-between">
                  <span className="mono text-2xl font-extrabold text-white"><Eq>x</Eq> = {r}</span>
                  <span className={cn("chip", founders.length > 0 && "!text-emerald-300 border-emerald-400/25 bg-emerald-400/8")}>
                    {founders.length > 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
                    {founders.length} penemu
                  </span>
                </div>
                {founders.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {founders.map((n) => (
                      <span key={n} className="anim-pop rounded-lg bg-emerald-400/15 px-2 py-1 text-xs font-bold text-emerald-200">{n.split(" ")[0]}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="rounded-3xl border border-amber-400/30 bg-amber-400/8 p-5">
            <p className="flex items-center gap-2 text-sm font-extrabold text-amber-200">
              <Lightbulb className="h-4.5 w-4.5" /> Tanyakan ke kelas
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
              “Berapa kali kalian menebak? Apakah cara ini <span className="font-bold text-amber-200">cepat dan pasti</span>?
              Bagaimana kalau akarnya pecahan?”
            </p>
          </div>
        </div>

        {/* Bar per siswa */}
        <div className="glass overflow-y-auto rounded-3xl p-5">
          <p className="label">Aktivitas tebakan per siswa · live</p>
          <div className="space-y-1.5">
            {siswa.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-3 py-2">
                <span className="w-24 truncate text-xs font-semibold text-zinc-200">{s.nama.split(" ")[0]}</span>
                <div className="h-5 flex-1 overflow-hidden rounded-lg bg-white/5">
                  {s.progress.cobacoba.attempts > 0 && (
                    <div
                      className="bar-grow flex h-full items-center rounded-lg bg-gradient-to-r from-sky-500/70 to-indigo-400/40 px-2"
                      style={{ width: `${Math.max(8, (s.progress.cobacoba.attempts / maxAttempts) * 100)}%` }}
                    >
                      <span className="mono text-[0.6rem] font-bold text-white tabular">{s.progress.cobacoba.attempts}×</span>
                    </div>
                  )}
                </div>
                <div className="flex w-14 justify-end gap-1">
                  {s.progress.cobacoba.roots.slice(0, 2).map((r) => (
                    <span key={r} className="mono rounded bg-emerald-400/15 px-1.5 py-0.5 text-[0.6rem] font-extrabold text-emerald-300">{r}</span>
                  ))}
                </div>
              </div>
            ))}
            {siswa.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Belum ada siswa.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================== 7. KLASIFIKASI ============================== */

export function DeckKlasifikasi({ monitor }: PanelProps) {
  const k = monitor?.agg.klasifikasi;
  const siswa = monitor?.siswa ?? [];
  const submitted = siswa.filter((s) => s.progress.klasifikasi !== null);
  const avgSort = submitted.length > 0 ? (k!.sortBenarTotal / submitted.length).toFixed(1) : "0";
  const avgPola = submitted.length > 0 ? (k!.polaBenarTotal / submitted.length).toFixed(1) : "0";

  return (
    <div className="flex h-full flex-col">
      <div className="text-center">
        <span className="chip !text-violet-300 border-violet-400/30 bg-violet-400/10 uppercase tracking-[0.2em] !text-[0.6rem]">
          <Shapes className="h-3.5 w-3.5" /> Fase 3 · Data Collection (Think)
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
          Temukan <span className="text-gradient">Polanya</span> Sendiri
        </h1>
      </div>

      <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-3">
        {/* Bagian A */}
        <div className="glass rounded-3xl p-5">
          <p className="label !text-sky-300">A · Linear atau Kuadrat?</p>
          <div className="space-y-1.5">
            {SORT_ITEMS.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-3 py-2">
                <span className="mono text-sm text-zinc-100"><Eq>{it.eq}</Eq></span>
                <span className={cn("rounded-md px-2 py-0.5 text-[0.6rem] font-extrabold uppercase", it.bucket === "linear" ? "bg-sky-400/15 text-sky-300" : "bg-indigo-400/20 text-indigo-200")}>
                  {it.bucket}
                </span>
              </div>
            ))}
          </div>
          <p className="mono mt-3 text-center text-xs text-zinc-500">
            Rata-rata benar: <span className="font-extrabold text-emerald-300">{avgSort}/6</span>
          </p>
        </div>

        {/* Bagian B */}
        <div className="glass rounded-3xl p-5">
          <p className="label !text-emerald-300 flex items-center gap-2"><Table2 className="h-3.5 w-3.5" /> B · Tabel penemuan</p>
          <div className="space-y-2">
            {POLA_ROWS.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/8 bg-white/3 p-2.5">
                <p className="mono text-xs text-zinc-200"><Eq>{r.eq}</Eq></p>
                <p className="mono mt-1 text-xs">
                  <span className="text-zinc-500">p+q = </span>
                  <span className="font-extrabold text-amber-300">{r.p + r.q}</span>
                  <span className="mx-2 text-zinc-700">|</span>
                  <span className="text-zinc-500">p×q = </span>
                  <span className="font-extrabold text-amber-300">{r.p * r.q}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="mono mt-3 text-center text-xs text-zinc-500">
            Rata-rata benar: <span className="font-extrabold text-emerald-300">{avgPola}/6</span>
          </p>
        </div>

        {/* Kesimpulan + progres */}
        <div className="space-y-3">
          <div className="border-gradient rounded-3xl p-5 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-amber-300" />
            <p className="mt-2 text-sm font-bold text-zinc-300">Rahasia yang ditemukan</p>
            <div className="mono mt-3 space-y-2">
              <p className="eq-badge px-4 py-2 text-lg font-extrabold text-amber-200"><Eq>p + q = b</Eq></p>
              <p className="eq-badge px-4 py-2 text-lg font-extrabold text-amber-200"><Eq>p x q = c</Eq></p>
            </div>
            <p className="mt-3 text-xs text-zinc-500">Inilah inti metode T-Faktor!</p>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="label">Progres pengiriman</p>
            <p className="mono text-center text-4xl font-extrabold text-white tabular">
              {k?.submitted ?? 0}<span className="text-zinc-600">/{siswa.length}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {siswa.map((s) => (
                <span key={s.id} className={cn("rounded-md px-1.5 py-0.5 text-[0.62rem] font-bold", s.progress.klasifikasi ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-zinc-600")}>
                  {s.nama.split(" ")[0]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ 8. WORKSHEET =============================== */

interface WsSoal { soalId: string; nomor: number; pertanyaan: string; tipe: string; selesai: number; benar: number; avgSkor: number; avgHint: number; avgWaktu: number }
interface WsMatrix { siswaId: string; nama: string; perSoal: Record<string, { skor: number; benar: boolean; hint: number } | null>; totalSkor: number }

export function DeckWorksheet({ kelasId }: PanelProps) {
  const { data } = useSWR<{ soal: WsSoal[]; matrix: WsMatrix[]; totalSiswa: number }>(
    `/api/worksheet/hasil/${kelasId}`, fetcher, { refreshInterval: 2500 }
  );
  const soals = data?.soal ?? [];
  const sorted = [...(data?.matrix ?? [])].sort((a, b) => b.totalSkor - a.totalSkor);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip !text-emerald-300 border-emerald-400/30 bg-emerald-400/10 uppercase tracking-[0.2em] !text-[0.6rem]">
            Fase 3–4 · Think & Pair
          </span>
          <h1 className="mt-2.5 text-3xl font-extrabold tracking-tight text-white xl:text-4xl">Worksheet Berjalan</h1>
        </div>
        <span className="chip !text-sm">
          {soals.filter((s) => s.selesai >= (data?.totalSiswa ?? 0) && (data?.totalSiswa ?? 0) > 0).length}/{soals.length} soal tuntas sekelas
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {soals.map((s) => {
          const pct = data && data.totalSiswa > 0 ? Math.round((s.selesai / data.totalSiswa) * 100) : 0;
          const pctBenar = s.selesai > 0 ? Math.round((s.benar / s.selesai) * 100) : 0;
          return (
            <div key={s.soalId} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="mono text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                  Soal {s.nomor} · {s.tipe === "metode-ac" ? "Metode AC" : "T-Faktor"}
                </span>
                <span className={cn("chip !py-0.5 !text-[0.6rem]", pctBenar >= 70 ? "!text-emerald-300 border-emerald-400/25 bg-emerald-400/8" : "!text-amber-300 border-amber-400/25 bg-amber-400/8")}>
                  {pctBenar}% benar
                </span>
              </div>
              <p className="mono mt-1.5 text-sm font-semibold text-zinc-100">
                <Eq>{s.pertanyaan.replace(/^Faktorkan( dengan Metode AC)?:?\s*/i, "")}</Eq>
              </p>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/8">
                <div className="bar-grow h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[0.65rem] text-zinc-500">
                <span>{s.selesai}/{data?.totalSiswa ?? 0} selesai</span>
                <span className="flex items-center gap-1"><Lightbulb className="h-3 w-3 text-amber-300" />{s.avgHint}</span>
                <span className="mono">{formatWaktu(s.avgWaktu)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass mt-3 flex-1 overflow-y-auto rounded-3xl p-4">
        <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((row, i) => (
            <div key={row.siswaId} className="flex items-center gap-2.5 rounded-xl border border-white/6 bg-white/2 px-3 py-2">
              <span className="mono w-5 text-xs font-bold text-zinc-600 tabular">{i + 1}</span>
              <span className="flex-1 truncate text-xs font-semibold text-zinc-200">{row.nama}</span>
              <div className="flex gap-1">
                {soals.map((s) => {
                  const c = row.perSoal[s.soalId];
                  return (
                    <span key={s.soalId} className={cn("h-5 w-5 rounded-md text-center text-[0.6rem] font-extrabold leading-5", !c ? "bg-white/5 text-zinc-700" : c.benar ? "bg-emerald-400/20 text-emerald-300" : "bg-amber-400/20 text-amber-300")}>
                      {c ? (c.benar ? "✓" : "~") : "·"}
                    </span>
                  );
                })}
              </div>
              <span className="mono w-10 text-right text-xs font-extrabold text-white tabular">{row.totalSkor}</span>
            </div>
          ))}
          {sorted.length === 0 && <p className="col-span-full py-10 text-center text-sm text-zinc-500">Belum ada pengerjaan.</p>}
        </div>
      </div>
    </div>
  );
}

/* =============================== 9. KUIS ================================= */

interface SoalStat { soalId: string; nomor: number; pertanyaan: string; skor: number; timer: number; answered: number; benar: number; kosong: number; avgWaktu: number }
interface LBData {
  session: { id: string; aktif: boolean; soalAktif: number; soalMulai: string } | null;
  entries: LeaderboardEntry[]; maxSkor: number; soalStats: SoalStat[]; totalSoal: number; totalSiswa: number;
}

export function DeckKuis({
  kelasId, offset, onKontrol,
}: PanelProps & { offset: number; onKontrol: (action: string) => Promise<void> }) {
  const { data, mutate } = useSWR<LBData>(`/api/kuis/leaderboard/${kelasId}`, fetcher, { refreshInterval: 1500 });
  const [, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 300);
    return () => clearInterval(iv);
  }, []);

  const session = data?.session ?? null;
  const aktif = session?.aktif ?? false;
  const stat = data?.soalStats.find((s) => s.nomor === session?.soalAktif);
  const sisa = aktif && session && stat
    ? Math.max(0, Math.ceil((new Date(session.soalMulai).getTime() + stat.timer * 1000 - (Date.now() + offset)) / 1000))
    : 0;
  const sudahMain = (data?.entries ?? []).some((e) => e.sudahJawab > 0);

  async function act(a: string) {
    await onKontrol(a);
    mutate();
  }

  if (!aktif && !sudahMain) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Trophy className="h-20 w-20 text-amber-300" />
        <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-white">Siap Beradu Cepat?</h1>
        <p className="mt-3 max-w-lg text-base text-zinc-400">
          {data?.totalSoal ?? 5} soal · timer ketat per soal · opsi diacak berbeda tiap siswa.
          Semua HP akan menampilkan soal pertama secara serentak.
        </p>
        <button onClick={() => act("kuisStart")} className="btn btn-amber mt-7 px-9 py-4 text-lg">
          <Play className="h-5 w-5" /> Mulai Kuis
        </button>
      </div>
    );
  }

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        <div className="border-gradient rounded-3xl p-5 text-center">
          {aktif ? (
            <>
              <p className="label !text-amber-300">Soal {session?.soalAktif} dari {data?.totalSoal}</p>
              <div className="mt-2 flex justify-center"><TimerRing sisa={sisa} total={stat?.timer ?? 60} size={128} stroke={10} /></div>
              <p className="mono mt-3 text-sm font-semibold text-zinc-200"><Eq>{stat?.pertanyaan ?? ""}</Eq></p>
              <div className="mono mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/5 p-2">
                  <p className="text-xl font-extrabold text-white tabular">{stat?.answered ?? 0}</p>
                  <p className="text-[0.55rem] font-bold uppercase tracking-widest text-zinc-500">Jawab</p>
                </div>
                <div className="rounded-xl bg-emerald-400/8 p-2">
                  <p className="text-xl font-extrabold text-emerald-300 tabular">{stat?.benar ?? 0}</p>
                  <p className="text-[0.55rem] font-bold uppercase tracking-widest text-emerald-500">Benar</p>
                </div>
                <div className="rounded-xl bg-rose-400/8 p-2">
                  <p className="text-xl font-extrabold text-rose-300 tabular">{stat?.kosong ?? 0}</p>
                  <p className="text-[0.55rem] font-bold uppercase tracking-widest text-rose-400">Kosong</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => act("kuisNext")} className="btn btn-primary flex-1 py-3 text-sm">
                  {(session?.soalAktif ?? 0) >= (data?.totalSoal ?? 0) ? "Akhiri & Umumkan" : "Soal Berikutnya"}
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={() => act("kuisStop")} className="btn btn-danger px-3.5 py-3"><CircleStop className="h-4 w-4" /></button>
              </div>
            </>
          ) : (
            <>
              <Trophy className="mx-auto h-12 w-12 text-amber-300" />
              <h2 className="mt-2 text-2xl font-extrabold text-white">Kuis Selesai!</h2>
              <p className="mono mt-2 text-sm text-zinc-400">
                Skor tertinggi:{" "}
                <span className="text-3xl font-extrabold text-gradient tabular">{data?.entries[0]?.skor ?? 0}</span>
                <span className="text-zinc-600">/{data?.maxSkor ?? 0}</span>
              </p>
              <button onClick={() => act("kuisStart")} className="btn btn-ghost mt-4 w-full py-2.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Ulangi kuis baru
              </button>
            </>
          )}
        </div>

        <div className="glass rounded-3xl p-4">
          <p className="label">Statistik per soal</p>
          <div className="space-y-1.5">
            {(data?.soalStats ?? []).map((s) => {
              const pct = s.answered > 0 ? Math.round((s.benar / s.answered) * 100) : 0;
              const act2 = aktif && s.nomor === session?.soalAktif;
              return (
                <div key={s.soalId} className={cn("rounded-lg border px-3 py-2", act2 ? "border-amber-400/40 bg-amber-400/8" : "border-white/6 bg-white/2")}>
                  <div className="flex justify-between text-[0.7rem]">
                    <span className="font-bold text-zinc-300">Soal {s.nomor}</span>
                    <span className="mono text-zinc-500 tabular">{s.answered} jwb · {s.avgWaktu}s</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="bar-grow h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass overflow-y-auto rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xl font-extrabold text-white">
            Leaderboard {aktif && <span className="text-sm text-amber-300">— LIVE</span>}
          </p>
          <span className="chip mono tabular">
            {(data?.entries ?? []).filter((e) => e.sudahJawab > 0).length}/{data?.totalSiswa ?? 0} bermain
          </span>
        </div>
        <Leaderboard entries={data?.entries ?? []} maxSkor={data?.maxSkor ?? 100} />
      </div>
    </div>
  );
}

/* ============================= 10. REFLEKSI ============================== */

interface Rekap {
  totalSiswa: number; terisi: number;
  tujuan: { tujuan1: number; tujuan2: number; tujuan3: number };
  rating: { tf: number; ac: number; keseruan: number };
  satuKataTexts: string[];
  mudahTexts: string[];
  kesulitanTexts: string[];
  exitTickets: { nama: string; teks: string }[];
}

export function DeckRefleksi({ kelasId }: PanelProps) {
  const { data } = useSWR<Rekap>(`/api/refleksi/rekap/${kelasId}`, fetcher, { refreshInterval: 2500 });
  const T = [
    { label: "Paham konsep PK", n: data?.tujuan.tujuan1 ?? 0 },
    { label: "Bisa T-Faktor", n: data?.tujuan.tujuan2 ?? 0 },
    { label: "Bisa Metode AC", n: data?.tujuan.tujuan3 ?? 0 },
  ];
  const CLOUD: { judul: string; texts: string[] }[] = [
    { judul: "Satu Kata", texts: data?.satuKataTexts ?? [] },
    { judul: "Paling Mudah", texts: data?.mudahTexts ?? [] },
    { judul: "Paling Sulit", texts: data?.kesulitanTexts ?? [] },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="text-center">
        <span className="chip uppercase tracking-[0.22em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8 !text-[0.6rem]">
          <Sparkles className="h-3.5 w-3.5" /> Fase 6 · Refleksi & Exit Ticket
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight xl:text-5xl">
          Apa yang <em className="ff-italic text-[var(--red)]">kalian rasakan</em>?
        </h1>
        <p className="mono mt-2 text-sm text-[var(--ink-3)] tabular">
          {data?.terisi ?? 0}/{data?.totalSiswa ?? 0} siswa mengisi · keseruan rata-rata <b className="text-[var(--red)]">{(data?.rating.keseruan ?? 0).toFixed(1)}/5</b>
        </p>
      </div>

      <div className="mt-6 grid flex-1 gap-4 xl:grid-cols-4">
        {/* Kolom 1: ketercapaian + rating */}
        <div className="glass p-6 xl:col-span-1" style={{ borderRadius: 3 }}>
          <p className="label">Ketercapaian tujuan</p>
          <div className="space-y-4">
            {T.map((t) => {
              const terisi = Math.max(data?.terisi ?? 0, 1);
              const pct = Math.round((t.n / terisi) * 100);
              return (
                <div key={t.label}>
                  <div className="flex justify-between text-sm">
                    <span className="font-extrabold text-[var(--ink)]">{t.label}</span>
                    <span className="mono font-bold text-[var(--ink-3)] tabular">{t.n}/{data?.terisi ?? 0} · {pct}%</span>
                  </div>
                  <div className="mt-1.5 h-4 overflow-hidden border border-[var(--hairline)] bg-[var(--paper-2)]">
                    <div className="bar-grow h-full bg-gradient-to-r from-emerald-700 to-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {[{ l: "T-Faktor", v: data?.rating.tf ?? 0 }, { l: "Metode AC", v: data?.rating.ac ?? 0 }].map((r) => (
              <div key={r.l} className="border border-[var(--hairline)] bg-[var(--card)] p-3.5 text-center" style={{ borderRadius: 3 }}>
                <p className="text-[0.62rem] font-bold uppercase tracking-widest text-[var(--ink-3)]">{r.l}</p>
                <div className="mt-1 flex items-center justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn("h-4 w-4", n <= Math.round(r.v) ? "fill-[var(--red)] text-[var(--red)]" : "text-[var(--ink-3)]")} />
                  ))}
                </div>
                <p className="mono mt-1 text-2xl font-extrabold text-[var(--red)] tabular">{r.v.toFixed(1)}</p>
              </div>
            ))}
          </div>
          {/* Exit ticket review */}
          {(data?.exitTickets ?? []).length > 0 && (
            <div className="mt-4 border-t border-[var(--hairline)] pt-3">
              <p className="label">Exit Ticket — x² + 9x + 14</p>
              <div className="mono max-h-32 space-y-1 overflow-y-auto text-xs">
                {(data?.exitTickets ?? []).slice(0, 10).map((t, i) => (
                  <p key={i} className="flex gap-2 text-[var(--ink-2)]">
                    <span className="inline-block h-1.5 w-1.5 translate-y-1.5 bg-[var(--red)]" />
                    <b className="text-[var(--ink)]">{t.nama.split(" ")[0]}</b> — {t.teks}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kolom 2–4: tiga word cloud */}
        {CLOUD.map((c) => (
          <div key={c.judul} className="glass flex flex-col p-6" style={{ borderRadius: 3 }}>
            <p className="label !text-center">{c.judul}</p>
            <div className="flex flex-1 items-center justify-center">
              <WordCloud texts={c.texts} />
            </div>
            <p className="mono mt-2 text-center text-xs text-[var(--ink-3)] tabular">{c.texts.length} siswa</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== 11. HASIL ================================ */

interface HasilRow {
  siswaId: string; nama: string;
  apersepsi: { benar: number; total: number; nilai: number };
  worksheet: { skor: number; max: number; nilai: number; selesai: number };
  kuis: { skor: number; max: number; nilai: number; benar: number; kosong: number };
  refleksiDone: boolean; total: number;
}

export function DeckHasil({ kelasId }: PanelProps) {
  const { data } = useSWR<{ kelas: { nama: string; guru: string; kode: string }; rows: HasilRow[] }>(
    `/api/hasil/${kelasId}`, fetcher, { refreshInterval: 5000 }
  );
  const [exporting, setExporting] = useState(false);
  const rows = data?.rows ?? [];
  const avg = rows.length > 0 ? Math.round(rows.reduce((a, b) => a + b.total, 0) / rows.length) : 0;

  async function exportPdf() {
    if (!data || exporting) return;
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const { autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      doc.setFont("helvetica", "bold"); doc.setFontSize(18);
      doc.text("LAPORAN HASIL BELAJAR — FAKTORKU", 14, 16);
      doc.setFontSize(11); doc.setFont("helvetica", "normal");
      doc.text(`Kelas: ${data.kelas.nama} (${data.kelas.kode})  ·  Guru: ${data.kelas.guru}`, 14, 23);
      doc.text(`Materi: Memfaktorkan Persamaan Kuadrat  ·  ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`, 14, 29);
      autoTable(doc, {
        startY: 34,
        head: [["#", "Nama Siswa", "Apersepsi", "Worksheet", "Kuis", "Refleksi", "Nilai Akhir", "Predikat"]],
        body: rows.map((r, i) => [
          i + 1, r.nama,
          `${r.apersepsi.benar}/${r.apersepsi.total} (${r.apersepsi.nilai})`,
          `${r.worksheet.skor}/${r.worksheet.max} (${r.worksheet.nilai})`,
          `${r.kuis.skor}/${r.kuis.max} (${r.kuis.nilai})`,
          r.refleksiDone ? "Selesai" : "-", r.total,
          r.total >= 85 ? "A" : r.total >= 70 ? "B" : r.total >= 55 ? "C" : "D",
        ]),
        styles: { fontSize: 9, cellPadding: 2.4 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 246, 252] },
      });
      const fy = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 150;
      doc.setFontSize(9); doc.setTextColor(110);
      doc.text(`Rata-rata kelas: ${avg} · ${rows.length} siswa · Bobot: Apersepsi 25%, Worksheet 40%, Kuis 35%`, 14, fy + 10);
      doc.save(`faktorku-hasil-${data.kelas.kode}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Rekap Nilai Kelas</h1>
          <p className="text-xs text-zinc-500">Bobot: Apersepsi 25% · Worksheet 40% · Kuis 35%</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip mono tabular">Rata-rata: <span className="font-extrabold text-white">{avg}</span></span>
          <button onClick={exportPdf} disabled={exporting || rows.length === 0} className="btn btn-primary px-4 py-2 text-sm">
            {exporting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Download className="h-4 w-4" />}
            Ekspor PDF
          </button>
        </div>
      </div>

      <div className="glass mt-4 flex-1 overflow-y-auto rounded-3xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-ink-800/95 backdrop-blur">
            <tr className="border-b border-white/8 text-xs uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-3 text-left font-bold">#</th>
              <th className="px-4 py-3 text-left font-bold">Nama</th>
              <th className="px-3 py-3 text-center font-bold">Apersepsi</th>
              <th className="px-3 py-3 text-center font-bold">Worksheet</th>
              <th className="px-3 py-3 text-center font-bold">Kuis</th>
              <th className="px-3 py-3 text-center font-bold">Refleksi</th>
              <th className="px-4 py-3 text-right font-bold">Nilai</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.siswaId} className="border-b border-white/4 hover:bg-white/3">
                <td className="mono px-4 py-2.5 text-xs text-zinc-600 tabular">{i + 1}</td>
                <td className="px-4 py-2.5 font-semibold text-zinc-200">{r.nama}</td>
                {[r.apersepsi.nilai, r.worksheet.nilai, r.kuis.nilai].map((n, k) => (
                  <td key={k} className="px-3 py-2.5 text-center">
                    <span className={cn("mono inline-block min-w-10 rounded-lg px-2 py-0.5 text-xs font-extrabold tabular",
                      n >= 80 ? "bg-emerald-400/12 text-emerald-300" : n >= 60 ? "bg-amber-400/12 text-amber-300" : n > 0 ? "bg-rose-400/12 text-rose-300" : "text-zinc-600")}>
                      {n}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-2.5 text-center">
                  {r.refleksiDone ? <BadgeCheck className="mx-auto h-4 w-4 text-emerald-300" /> : <span className="text-zinc-700">·</span>}
                </td>
                <td className="mono px-4 py-2.5 text-right text-base font-extrabold text-white tabular">{r.total}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-500">Belum ada data nilai.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
