"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { TFaktorInput, type WsResultServer, type WsSoalClient } from "@/components/t-faktor-input";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { BadgeCheck, PenLine } from "lucide-react";

interface SoalResp {
  soal: WsSoalClient[];
  hasil: Record<string, WsResultServer | null>;
}

export default function WorksheetPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 2000);
  useStageFollow(state?.kelas.stage, "worksheet", state?.kelas.stage !== "worksheet");

  const { data, mutate } = useSWR<SoalResp>(
    siswa ? `/api/worksheet/soal?siswaId=${siswa.siswaId}` : null,
    fetcher
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, WsResultServer>>({});
  const [submitting, setSubmitting] = useState(false);

  const soals = useMemo(() => data?.soal ?? [], [data]);

  useEffect(() => {
    if (!activeId && soals.length > 0) {
      const firstUn = soals.find((s) => !data?.hasil?.[s.id]);
      setActiveId((firstUn ?? soals[0]).id);
    }
  }, [soals, activeId, data]);

  const current = soals.find((s) => s.id === activeId) ?? soals[0];
  const totalSkor = soals.reduce((a, s) => a + (data?.hasil?.[s.id]?.skor ?? results[s.id]?.skor ?? 0), 0);
  const selesaiCount = soals.filter((s) => data?.hasil?.[s.id] || results[s.id]).length;

  if (!ready || !siswa) return null;

  async function submit(
    jawaban: { p: number | null; q: number | null; fb1: number | null; fb2: number | null; x1: number | null; x2: number | null },
    hintDipakai: number,
    waktu: number
  ) {
    if (!current || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/worksheet/jawab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: siswa!.siswaId, soalId: current.id, jawaban, hintDipakai, waktu }),
      });
      const r = await res.json();
      if (res.ok && r.solusi) {
        setResults((prev) => ({ ...prev, [current.id]: r as WsResultServer }));
      }
      await mutate();
    } finally {
      setSubmitting(false);
    }
  }

  // Hasil dari server (sudah dikerjakan sebelumnya, lengkap dengan pembahasan)
  // atau hasil yang baru saja disubmit pada sesi ini
  const displayResult: WsResultServer | null = current
    ? results[current.id] ?? data?.hasil?.[current.id] ?? null
    : null;

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-5 md:px-6">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="chip !text-emerald-300 border-emerald-400/25 bg-emerald-400/8 mono tabular">
              <BadgeCheck className="h-3.5 w-3.5" /> Skor: {totalSkor}/{soals.length * 100}
            </span>
            <span className="chip hidden sm:inline-flex">{siswa.nama}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10">
            <PenLine className="h-4.5 w-4.5 text-emerald-300" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white">WORKSHEET</h1>
            <p className="text-[0.7rem] text-zinc-500">Latihan berpanduan · {selesaiCount}/{soals.length} selesai</p>
          </div>
        </div>

        {/* Tab soal */}
        <div className="mt-5 flex gap-2">
          {soals.map((s) => {
            const done = Boolean(data?.hasil?.[s.id] || results[s.id]);
            const active = s.id === current?.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={cn(
                  "flex-1 rounded-2xl border px-3 py-3 text-left transition-all",
                  active
                    ? "border-indigo-400/60 bg-indigo-500/15 shadow-[0_10px_30px_-14px_rgba(99,102,241,0.7)]"
                    : "border-white/8 bg-white/3 hover:bg-white/6"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="mono text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">Soal {s.nomor}</span>
                  {done && <BadgeCheck className="h-4 w-4 text-emerald-300" />}
                </div>
                <p className={cn("mt-1 text-xs font-bold md:text-sm", active ? "text-white" : "text-zinc-300")}>
                  {s.tipe === "metode-ac" ? "Metode AC" : "T-Faktor"}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex-1">
          {!current && <div className="glass animate-pulse rounded-3xl p-10 text-center text-zinc-500">Memuat soal…</div>}
          {current && (
            <TFaktorInput
              key={current.id}
              soal={current}
              result={displayResult}
              submitting={submitting}
              onSubmit={submit}
            />
          )}

          {selesaiCount === soals.length && soals.length > 0 && (
            <div className="anim-rise glass mt-4 rounded-3xl p-6 text-center">
              <p className="text-lg font-extrabold text-white">
                Semua soal selesai! Total skor: <span className="text-gradient">{totalSkor}</span>
              </p>
              <p className="mt-1.5 text-sm text-zinc-400">
                Siap-siap — berikutnya kuis dengan leaderboard. Pelajari lagi pembahasannya sambil menunggu.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
