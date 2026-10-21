"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { Eq } from "@/components/equation";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn, formatWaktu } from "@/lib/utils";
import { Check, ChevronRight, MessageSquareText, PartyPopper, Send, Target } from "lucide-react";

interface Soal {
  id: string;
  nomor: number;
  pertanyaan: string;
  tipe: "pg" | "isian" | "terbuka";
  opsi: { A: string; B: string; C: string; D: string } | null;
  skor: number;
}

const SOFT_TIMER = 90;

export default function ApersepsiPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 2000);
  useStageFollow(state?.kelas.stage, "apersepsi", state?.kelas.stage !== "apersepsi");

  const { data, mutate } = useSWR<{ soal: Soal[]; jawaban: Record<string, { jawaban: string; benar: boolean }> }>(
    siswa ? `/api/apersepsi/soal?siswaId=${siswa.siswaId}` : null,
    fetcher
  );

  const [idx, setIdx] = useState(0);
  const [pilihan, setPilihan] = useState<string | null>(null);
  const [teks, setTeks] = useState("");
  const [sending, setSending] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const soals = useMemo(() => data?.soal ?? [], [data]);
  const answeredMap = data?.jawaban ?? {};
  const soal = soals[idx];
  const terjawab = soals.filter((s) => answeredMap[s.id]).length;
  const selesai = soals.length > 0 && terjawab >= soals.length;

  useEffect(() => {
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [idx]);

  // Lompat ke soal pertama yang belum dijawab saat data tiba
  useEffect(() => {
    if (!soals.length) return;
    const firstUnanswered = soals.findIndex((s) => !answeredMap[s.id]);
    if (firstUnanswered >= 0) setIdx(firstUnanswered);
  }, [data]);

  if (!ready || !siswa) return null;

  async function jawab(nilai: string) {
    if (!soal || sending || answeredMap[soal.id]) return;
    setSending(true);
    try {
      await fetch("/api/apersepsi/jawab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: siswa!.siswaId, soalId: soal.id, jawaban: nilai }),
      });
      await mutate();
      setPilihan(null);
      setTeks("");
      setElapsed(0);
      setTimeout(() => {
        setIdx((i) => Math.min(i + 1, soals.length - 1));
      }, 350);
    } finally {
      setSending(false);
    }
  }

  const benarCount = soals.filter((s) => answeredMap[s.id]?.benar).length;

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="text-right">
            <p className="text-xs font-semibold text-zinc-400">{siswa.nama}</p>
            <p className="text-[0.65rem] text-zinc-500">{siswa.kelasNama}</p>
          </div>
        </div>

        {/* Header kartu */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-400/10">
              <Target className="h-4.5 w-4.5 text-rose-300" />
            </span>
            <div>
              <h1 className="text-lg font-extrabold text-white">APERSEPSI</h1>
              <p className="text-[0.7rem] text-zinc-500">Ukur kemampuan awalmu — santai saja</p>
            </div>
          </div>
          <span className="mono chip !text-amber-300 border-amber-400/25 bg-amber-400/8 tabular">
            {formatWaktu(SOFT_TIMER - (elapsed % (SOFT_TIMER + 1)))}
          </span>
        </div>

        {/* Progres */}
        {!selesai && soals.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span>Soal {Math.min(idx + 1, soals.length)} dari {soals.length}</span>
              <span className="mono tabular">{terjawab}/{soals.length}</span>
            </div>
            <div className="mt-2 flex gap-1">
              {soals.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setIdx(i); setElapsed(0); }}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    answeredMap[s.id]
                      ? answeredMap[s.id].benar || s.tipe === "terbuka"
                        ? "bg-emerald-400"
                        : "bg-rose-400"
                      : i === idx
                        ? "bg-indigo-400"
                        : "bg-white/12"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* SOAL */}
        {!data && (
          <div className="glass mt-8 animate-pulse rounded-3xl p-10 text-center text-zinc-500">Memuat soal…</div>
        )}

        {data && !selesai && soal && !answeredMap[soal.id] && (
          <div key={soal.id} className="anim-slide glass mt-5 rounded-3xl p-6 md:p-8">
            <p className="label">Soal {soal.nomor}</p>
            <h2 className="text-xl font-bold leading-snug text-white md:text-2xl">
              <Eq>{soal.pertanyaan}</Eq>
            </h2>

            {soal.tipe === "pg" && soal.opsi && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(Object.entries(soal.opsi) as [string, string][]).map(([key, val]) => {
                  const active = pilihan === key;
                  return (
                    <button
                      key={key}
                      disabled={sending}
                      onClick={() => { setPilihan(key); jawab(key); }}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all hover:-translate-y-0.5",
                        active
                          ? "border-indigo-400/70 bg-indigo-500/15"
                          : "border-white/10 bg-white/4 hover:border-indigo-400/40 hover:bg-indigo-500/8"
                      )}
                    >
                      <span className={cn(
                        "mono flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold",
                        active ? "bg-indigo-500 text-white" : "bg-white/8 text-indigo-300 group-hover:bg-indigo-500/30"
                      )}>
                        {sending && active ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : key}
                      </span>
                      <span className="text-sm font-semibold text-zinc-200 md:text-base"><Eq>{val}</Eq></span>
                    </button>
                  );
                })}
              </div>
            )}

            {soal.tipe === "isian" && (
              <form
                className="mt-6 flex gap-3"
                onSubmit={(e) => { e.preventDefault(); if (teks.trim()) jawab(teks.trim()); }}
              >
                <input className="input mono" placeholder="Ketik jawaban angka…" value={teks} onChange={(e) => setTeks(e.target.value)} />
                <button type="submit" disabled={sending || !teks.trim()} className="btn btn-primary px-5">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}

            {soal.tipe === "terbuka" && (
              <form
                className="mt-6"
                onSubmit={(e) => { e.preventDefault(); if (teks.trim().length >= 3) jawab(teks.trim()); }}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-300">
                  <MessageSquareText className="h-3.5 w-3.5" /> Ceritakan pengalamanmu
                </div>
                <textarea
                  className="input mt-2 min-h-28 resize-none"
                  placeholder="Ketik jawabanmu di sini…"
                  value={teks}
                  maxLength={400}
                  onChange={(e) => setTeks(e.target.value)}
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{teks.length}/400</span>
                  <button type="submit" disabled={sending || teks.trim().length < 3} className="btn btn-primary px-6 py-2.5">
                    <Send className="h-4 w-4" /> Kirim
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Sudah dijawab → tampil ringkas */}
        {data && !selesai && soal && answeredMap[soal.id] && (
          <div className="glass mt-5 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", answeredMap[soal.id].benar || soal.tipe === "terbuka" ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300")}>
                <Check className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-white">Soal {soal.nomor} sudah kamu jawab</p>
                <p className="text-sm text-zinc-400">
                  {soal.tipe === "terbuka" ? "Cerita terekam. Terima kasih!" : answeredMap[soal.id].benar ? "Jawabanmu benar!" : "Jawaban terekam."}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = soals.findIndex((s) => !answeredMap[s.id]);
                setIdx(next >= 0 ? next : idx);
                setElapsed(0);
              }}
              className="btn btn-primary mt-5 px-5 py-2.5"
            >
              Lanjut <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* SELESAI */}
        {selesai && (
          <div className="anim-pop glass mt-8 rounded-3xl p-8 text-center">
            <PartyPopper className="mx-auto h-12 w-12 text-amber-300" />
            <h2 className="mt-4 text-2xl font-extrabold text-white">Apersepsi Selesai!</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Kamu menjawab benar <span className="font-bold text-emerald-300">{benarCount}</span> dari{" "}
              {soals.filter((s) => s.tipe !== "terbuka").length} soal pilihan.
              Guru akan membahasnya di papan sekarang.
            </p>
            <div className="mx-auto mt-6 h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-white/8">
              <div
                className="bar-grow h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                style={{ width: `${(benarCount / Math.max(1, soals.filter((s) => s.tipe !== "terbuka").length)) * 100}%` }}
              />
            </div>
            <p className="mt-6 text-xs text-zinc-500">Halaman ini akan berpindah otomatis saat guru membuka aktivitas berikutnya…</p>
          </div>
        )}
      </div>
    </main>
  );
}
