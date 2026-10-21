"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Eq } from "@/components/equation";
import { Leaderboard, type LeaderboardEntry } from "@/components/leaderboard";
import { TimerRing } from "@/components/timer";
import { WordCloud } from "@/components/word-cloud";
import { fetcher } from "@/hooks/use-session";
import { cn, formatWaktu } from "@/lib/utils";
import type { PanelProps } from "@/components/deck/panels-a";
import {
  LogOut, Layers, MoonStar, Check, ChevronRight, CircleStop,
  Play, RotateCcw, Sparkles, Star, Trophy,
} from "lucide-react";

/* ============================ 6. COBA-COBA =============================== */

/* =========================== 7. KLASIFIKASI ============================== */

/* ============================ 8. WORKSHEET =============================== */

/* =============================== 9. KUIS ================================= */

interface SoalStat { soalId: string; nomor: number; pertanyaan: string; skor: number; timer: number; answered: number; benar: number; kosong: number; avgWaktu: number }
interface LBData {
  session: { id: string; aktif: boolean; paket: number; soalAktif: number; soalMulai: string } | null;
  entries: LeaderboardEntry[]; maxSkor: number; soalStats: SoalStat[]; totalSoal: number; totalSiswa: number;
}

export function DeckKuis({
  kelasId, offset, onKontrol,
}: PanelProps & { offset: number; onKontrol: (action: string, value?: unknown) => Promise<void> }) {
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

  async function act(a: string, v?: unknown) {
    await onKontrol(a, v);
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
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => act("kuisStart", 1)} className="btn btn-amber px-8 py-4 text-lg">
            <Play className="h-5 w-5" /> Mulai Paket 1
          </button>
          <button onClick={() => act("kuisStart", 2)} className="btn btn-ghost px-6 py-4 text-base">
            <Layers className="h-4.5 w-4.5" /> Paket 2
          </button>
          <button onClick={() => act("kuisStart", 3)} className="btn btn-ghost px-6 py-4 text-base">
            <Layers className="h-4.5 w-4.5" /> Paket 3
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--ink-3)]">
          Paket 2 dan 3 adalah soal cadangan, dipakai bila waktu masih tersisa.
        </p>
      </div>
    );
  }

  return (
    <div className="grid h-full gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="border-gradient rounded-3xl p-5 text-center">
          {aktif ? (
            <>
              <p className="label !text-[var(--red)]">Paket {session?.paket ?? 1} · Soal {session?.soalAktif} dari {data?.totalSoal}</p>
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
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => act("kuisStart", n)}
                    className={cn("btn py-2.5 text-xs", n === 1 ? "btn-ghost" : "btn-amber")}
                  >
                    {n === 1 ? <RotateCcw className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
                    Paket {n}
                  </button>
                ))}
              </div>
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
            Leaderboard {aktif && <span className="text-sm text-amber-300">- LIVE</span>}
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

/* ========================== 9b. LEADERBOARD ============================== */

export function DeckLeaderboard({ kelasId }: PanelProps) {
  const { data } = useSWR<LBData>(`/api/kuis/leaderboard/${kelasId}`, fetcher, { refreshInterval: 2000 });
  const entries = data?.entries ?? [];
  const main = entries.filter((e) => e.sudahJawab > 0);
  const avg = main.length > 0 ? Math.round(main.reduce((a, b) => a + b.skor, 0) / main.length) : 0;
  const stats = data?.soalStats ?? [];
  const tersulit = [...stats].filter((s) => s.answered > 0).sort((a, b) => a.benar / a.answered - b.benar / b.answered)[0];
  const termudah = [...stats].filter((s) => s.answered > 0).sort((a, b) => b.benar / b.answered - a.benar / a.answered)[0];

  return (
    <div className="flex h-full flex-col">
      <div className="text-center">
        <span className="chip uppercase tracking-[0.22em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8 !text-[0.6rem]">
          <Trophy className="h-3.5 w-3.5" /> Hasil Kuis
        </span>
        <h1 className="mt-3 text-4xl xl:text-5xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          Leaderboard <em className="ff-italic text-[var(--red)]">Kelas</em>
        </h1>
      </div>

      <div className="mt-5 grid flex-1 gap-4 lg:grid-cols-2">
        <div className="glass p-6">
          <Leaderboard entries={entries} maxSkor={data?.maxSkor ?? 100} />
        </div>
        <div className="space-y-3">
          <div className="border-gradient p-5 text-center">
            <p className="label !mb-1">Rata-rata kelas</p>
            <p className="mono text-5xl font-extrabold tabular text-[var(--red)]">{avg}</p>
            <p className="mt-1 text-xs text-[var(--ink-3)]">dari {main.length} siswa bermain</p>
          </div>
          {tersulit && (
            <div className="glass p-4">
              <p className="label !mb-1">Soal tersulit</p>
              <p className="text-sm font-extrabold">Soal {tersulit.nomor}</p>
              <p className="mono text-xs text-[var(--ink-3)]">{tersulit.benar}/{tersulit.answered} benar</p>
            </div>
          )}
          {termudah && (
            <div className="glass p-4">
              <p className="label !mb-1">Soal termudah</p>
              <p className="text-sm font-extrabold">Soal {termudah.nomor}</p>
              <p className="mono text-xs text-[var(--ink-3)]">{termudah.benar}/{termudah.answered} benar</p>
            </div>
          )}
        </div>
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
              <p className="label">Exit Ticket, x² + 9x + 14</p>
              <div className="mono max-h-32 space-y-1 overflow-y-auto text-xs">
                {(data?.exitTickets ?? []).slice(0, 10).map((t, i) => (
                  <p key={i} className="flex gap-2 text-[var(--ink-2)]">
                    <span className="inline-block h-1.5 w-1.5 translate-y-1.5 bg-[var(--red)]" />
                    <b className="text-[var(--ink)]">{t.nama.split(" ")[0]}</b>, {t.teks}
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

/* ============================== 12. DOA ================================= */

export function DeckDoa({ monitor, onKontrol }: PanelProps & { onKontrol: (action: string, value?: unknown) => Promise<void> }) {
  const [sent, setSent] = useState(false);
  const online = monitor?.agg.online ?? 0;

  async function akhiri() {
    setSent(true);
    await onKontrol("sesiEnd");
  }

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <span className="chip uppercase tracking-[0.24em] !text-[0.6rem]">
        <MoonStar className="h-3.5 w-3.5" /> Penutup
      </span>
      <h1 className="mt-4 text-5xl leading-tight xl:text-6xl" style={{ fontFamily: '"Playfair Display", serif' }}>
        Terima kasih,
        <br />
        <em className="ff-italic text-[var(--red)]">sampai jumpa.</em>
      </h1>

      <div className="glass mt-7 w-full max-w-2xl p-6">
        <p className="font-serif text-xl italic leading-relaxed text-[var(--ink-2)]">
          Pembelajaran hari ini telah selesai. Semoga ilmu yang kita pelajari
          menjadi bekal yang bermanfaat bagi diri sendiri maupun orang lain.
        </p>
        <p className="mt-3 text-base font-bold text-[var(--ink-2)]">Mari kita tutup dengan berdoa menurut keyakinan masing-masing.</p>
      </div>

      <button onClick={akhiri} disabled={sent} className="btn btn-danger mt-7 px-8 py-3.5 text-base">
        {sent ? <Check className="h-4.5 w-4.5" /> : <LogOut className="h-4.5 w-4.5" />}
        {sent ? `Mengakhiri sesi, ${online} HP logout…` : "Akhiri Sesi & Logout Kelas"}
      </button>
      <p className="mt-3 text-xs text-[var(--ink-3)]">Data sesi tersimpan permanen di database.</p>
    </div>
  );
}
