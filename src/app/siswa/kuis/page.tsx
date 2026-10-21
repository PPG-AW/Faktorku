"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { Eq } from "@/components/equation";
import { TimerRing } from "@/components/timer";
import { Leaderboard, type LeaderboardEntry } from "@/components/leaderboard";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn, seededShuffle } from "@/lib/utils";
import { CheckCircle2, Hourglass, Send, ShieldAlert, TimerOff, Trophy, Zap } from "lucide-react";

interface SoalKuisClient {
  id: string;
  nomor: number;
  pertanyaan: string;
  tipe: "pg" | "isian";
  opsi: { A: string; B: string; C: string; D: string } | null;
  timer: number;
  skor: number;
}

export default function KuisPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state, offset } = useKelasState(siswa?.kelasKode, 1000);
  useStageFollow(state?.kelas.stage, "kuis", state?.kelas.stage !== "kuis");

  const { data: soalData } = useSWR<{ soal: SoalKuisClient[] }>("/api/kuis/soal", fetcher);
  const soals = useMemo(() => soalData?.soal ?? [], [soalData]);

  const session = state?.kuis ?? null;
  const aktif = session?.aktif ?? false;
  const ended = Boolean(session && !session.aktif);

  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [justAnswered, setJustAnswered] = useState<"benar" | "salah" | "kosong" | null>(null);
  const [isian, setIsian] = useState("");
  const [timedOut, setTimedOut] = useState(false);
  const startRef = useRef<number>(Date.now());
  const lastSessionRef = useRef<string | null>(null);
  const timeoutSentRef = useRef(false);

  // Reset lokal saat sesi baru dimulai
  useEffect(() => {
    if (session && session.sessionId !== lastSessionRef.current) {
      lastSessionRef.current = session.sessionId;
      setAnsweredIds(new Set());
      setJustAnswered(null);
      setIsian("");
      setTimedOut(false);
      timeoutSentRef.current = false;
      startRef.current = Date.now();
    }
  }, [session]);

  const soal = useMemo(() => {
    if (!session) return null;
    return soals.find((s) => s.nomor === session.soalAktif) ?? null;
  }, [soals, session]);

  // Reset per soal
  const nomor = session?.soalAktif ?? 0;
  useEffect(() => {
    setJustAnswered(null);
    setIsian("");
    setTimedOut(false);
    timeoutSentRef.current = false;
    startRef.current = Date.now();
  }, [nomor, session?.sessionId]);

  // Countdown halus
  const [sisaMs, setSisaMs] = useState(999_000);
  useEffect(() => {
    if (!aktif || !session || !soal) return;
    const mulai = new Date(session.soalMulai).getTime();
    const totalMs = soal.timer * 1000;
    const iv = setInterval(() => {
      const nowServer = Date.now() + offset;
      setSisaMs(mulai + totalMs - nowServer);
    }, 200);
    return () => clearInterval(iv);
  }, [aktif, session, soal, offset]);

  const sisa = Math.max(0, Math.ceil(sisaMs / 1000));
  const habis = aktif && soal && sisaMs <= 0;

  // Opsi diacak stabil per siswa+soal
  const opsiAcak = useMemo(() => {
    if (!soal?.opsi || !siswa) return [];
    return seededShuffle(Object.entries(soal.opsi) as [string, string][], `${siswa.siswaId}:${soal.id}`);
  }, [soal, siswa]);

  const sudahJawab = soal ? answeredIds.has(soal.id) : false;

  async function kirim(nilai: string, kosong = false) {
    if (!soal || !siswa || answeredIds.has(soal.id)) return;
    const waktu = Math.min(soal.timer, Math.max(0, Math.floor((Date.now() - startRef.current) / 1000)));
    try {
      const res = await fetch("/api/kuis/jawab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: siswa.siswaId, soalId: soal.id, jawaban: nilai, waktu, kosong }),
      });
      const r = await res.json();
      setAnsweredIds((prev) => new Set(prev).add(soal.id));
      if (kosong) setJustAnswered("kosong");
      else if (r.benar === true) setJustAnswered("benar");
      else if (r.benar === false) setJustAnswered("salah");
      else setJustAnswered(null);
    } catch {
      // abaikan
    }
  }

  // Timer habis → kunci & tandai kosong (sekali)
  useEffect(() => {
    if (habis && !sudahJawab && !timeoutSentRef.current) {
      timeoutSentRef.current = true;
      setTimedOut(true);
      kirim("", true);
    }
  }, [habis, sudahJawab]);

  if (!ready || !siswa) return null;

  const totalSoal = session?.totalSoal ?? soals.length;

  return (
    <main className="relative min-h-screen">
      <Ambient variant="warm" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="chip"><ShieldAlert className="h-3.5 w-3.5 text-amber-300" /> Opsi diacak, jangan contek!</span>
        </div>

        {/* ============ MENUNGGU MULAI ============ */}
        {!aktif && !ended ? (
          <div className="glass mt-10 flex flex-1 flex-col items-center justify-center rounded-3xl p-10 text-center">
            <Trophy className="h-12 w-12 text-amber-300" />
            <h1 className="mt-4 text-3xl font-extrabold text-white">Kuis Segera Dimulai</h1>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">
              {soals.length} soal · timer per soal · skor langsung ke leaderboard di papan.
              Begitu guru menekan mulai, soal muncul di sini otomatis.
            </p>
            <div className="chip mt-6"><Hourglass className="h-3.5 w-3.5 animate-spin [animation-duration:4s]" /> Menunggu sinyal guru…</div>
          </div>
        ) : null}

        {/* ============ SOAL AKTIF ============ */}
        {aktif && soal && !sudahJawab && !habis && (
          <>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10">
                  <Zap className="h-4.5 w-4.5 text-amber-300" />
                </span>
                <div>
                  <h1 className="text-lg font-extrabold text-white">Soal {nomor} dari {totalSoal}</h1>
                  <p className="mono text-[0.7rem] text-zinc-500">Skor benar: +{soal.skor}</p>
                </div>
              </div>
              <TimerRing sisa={sisa} total={soal.timer} size={84} stroke={7} />
            </div>

            <div key={`${session?.sessionId}-${soal.id}`} className="anim-slide glass mt-5 rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold leading-snug text-white md:text-2xl">
                <Eq>{soal.pertanyaan}</Eq>
              </h2>

              {soal.tipe === "pg" && (
                <div className="mt-6 space-y-3">
                  {opsiAcak.map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => kirim(key)}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-amber-400/50 hover:bg-amber-400/8"
                    >
                      <span className="mono flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-sm font-extrabold text-amber-300 group-hover:bg-amber-400/25">
                        {key}
                      </span>
                      <span className="text-sm font-semibold text-zinc-200 md:text-base"><Eq>{val}</Eq></span>
                    </button>
                  ))}
                </div>
              )}

              {soal.tipe === "isian" && (
                <form
                  className="mt-6 flex gap-3"
                  onSubmit={(e) => { e.preventDefault(); if (isian.trim()) kirim(isian.trim()); }}
                >
                  <input
                    className="input mono text-lg"
                    placeholder="Ketik jawabanmu (angka)…"
                    value={isian}
                    onChange={(e) => setIsian(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" disabled={!isian.trim()} className="btn btn-primary px-6">
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              )}

              <p className="mt-5 text-center text-xs text-zinc-500">
                Terkunci otomatis saat waktu habis, jawab sebelum timer berakhir!
              </p>
            </div>
          </>
        )}

        {/* ============ TERKIRIM / MENUNGGU ============ */}
        {aktif && soal && (sudahJawab || habis) && (
          <div className="glass mt-10 flex flex-1 flex-col items-center justify-center rounded-3xl p-10 text-center">
            {timedOut && justAnswered === "kosong" ? (
              <>
                <TimerOff className="h-14 w-14 text-rose-400" />
                <h2 className="mt-4 text-3xl font-extrabold text-white">Waktu Habis!</h2>
                <p className="mt-2 max-w-sm text-sm text-zinc-400">
                  Soal ini tercatat <span className="font-bold text-rose-300">KOSONG</span>.
                  Bersiap untuk soal berikutnya…
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-14 w-14 text-emerald-300" />
                <h2 className="mt-4 text-3xl font-extrabold text-white">Jawaban Terkirim</h2>
                <p className="mt-2 max-w-sm text-sm text-zinc-400">
                  {justAnswered === "benar"
                    ? "Mantap, hasilnya masuk leaderboard di papan. Menunggu soal berikutnya…"
                    : "Terkunci! Menunggu guru membuka soal berikutnya…"}
                </p>
              </>
            )}
            <div className="chip mt-6"><Hourglass className="h-3.5 w-3.5 animate-spin [animation-duration:4s]" /> Sinkron dengan guru…</div>
          </div>
        )}

        {/* ============ SELESAI ============ */}
        {ended && (
          <RingkasanKuis siswaId={siswa.siswaId} kelasId={siswa.kelasId} totalSoal={totalSoal} />
        )}
      </div>
    </main>
  );
}

function RingkasanKuis({ siswaId, kelasId, totalSoal }: { siswaId: string; kelasId: string; totalSoal: number }) {
  const { data } = useSWR<{ entries: LeaderboardEntry[]; maxSkor: number }>(
    `/api/kuis/leaderboard/${kelasId}`,
    fetcher,
    { refreshInterval: 3000 }
  );
  if (!data || data.entries.length === 0) return null;
  const me = data.entries.find((e) => e.siswaId === siswaId);
  const rank = data.entries.findIndex((e) => e.siswaId === siswaId) + 1;

  return (
    <div className="anim-pop mt-8">
      <div className="glass rounded-3xl p-6 text-center md:p-8">
        <Trophy className="mx-auto h-12 w-12 text-amber-300" />
        <h2 className="mt-3 text-3xl font-extrabold text-white">Kuis Selesai!</h2>
        {me && (
          <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
              <p className="mono text-2xl font-extrabold text-white tabular">#{rank}</p>
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">Peringkat</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
              <p className="mono text-2xl font-extrabold text-amber-300 tabular">{me.skor}</p>
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">Skor</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
              <p className="mono text-2xl font-extrabold text-emerald-300 tabular">{me.benar}/{totalSoal}</p>
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">Benar</p>
            </div>
          </div>
        )}
      </div>
      <div className="glass mt-4 rounded-3xl p-5">
        <p className="label">Leaderboard akhir</p>
        <Leaderboard entries={data.entries} maxSkor={data.maxSkor} highlightId={siswaId} />
      </div>
    </div>
  );
}
