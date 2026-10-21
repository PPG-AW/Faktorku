"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { GuruShell } from "@/components/guru-shell";
import { TimerRing } from "@/components/timer";
import { MOODS, moodByKey } from "@/lib/moods";
import { fetcher, useGuruKode, useKelasState } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { Hand, MessagesSquare, Pause, Play, RotateCcw, Users } from "lucide-react";

interface Rekap {
  totalSiswa: number;
  terisi: number;
  moodCount: Record<string, number>;
  messages: { nama: string; mood: string; pesan: string; waktu: string }[];
}

const DURASI_OPSI = [60, 120, 180];

export default function GuruSapaan() {
  const { kode } = useGuruKode();
  const { state, mutate: mutateState } = useKelasState(kode, 3000);
  const { data } = useSWR<Rekap>(
    state ? `/api/sapaan/rekap/${state.kelas.id}` : null,
    fetcher,
    { refreshInterval: 2000 }
  );

  // ---- Timer sesi sapaan (soft, di sisi guru/proyektor) ----
  const [durasi, setDurasi] = useState(180);
  const [sisa, setSisa] = useState(180);
  const [jalan, setJalan] = useState(false);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (jalan) {
      ivRef.current = setInterval(() => {
        setSisa((s) => {
          if (s <= 1) {
            setJalan(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, [jalan]);

  function resetTimer(d: number = durasi) {
    setJalan(false);
    setSisa(d);
    setDurasi(d);
  }

  async function bukaSesi() {
    if (!state) return;
    await fetch("/api/guru/kontrol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kelasId: state.kelas.id, action: "setStage", value: "sapaan" }),
    });
    mutateState();
  }

  const sudahSapaan = state?.kelas.stage === "sapaan";
  const maxMood = Math.max(1, ...MOODS.map((m) => data?.moodCount[m.key] ?? 0));

  return (
    <GuruShell
      title="Papan Sapaan Pembuka"
      icon={<Hand className="h-5 w-5 text-amber-300" />}
      maxW="max-w-7xl"
      headerRight={
        !sudahSapaan ? (
          <button onClick={bukaSesi} className="btn btn-amber px-4 py-2 text-sm">
            <Hand className="h-4 w-4" /> Buka Sesi Sapaan
          </button>
        ) : undefined
      }
    >
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* PANEL KIRI: timer + mood stats */}
        <div className="space-y-4">
          {/* TIMER */}
          <div className="border-gradient rounded-3xl p-6 text-center">
            <p className="label !text-amber-300">Timer sesi sapaan</p>
            <div className="mt-3 flex justify-center">
              <TimerRing sisa={sisa} total={durasi} size={120} stroke={9} />
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              {jalan ? (
                <button onClick={() => setJalan(false)} className="btn btn-amber px-5 py-2.5 text-sm">
                  <Pause className="h-4 w-4" /> Jeda
                </button>
              ) : (
                <button onClick={() => setJalan(true)} disabled={sisa === 0} className="btn btn-primary px-5 py-2.5 text-sm">
                  <Play className="h-4 w-4" /> {sisa < durasi ? "Lanjut" : "Mulai"}
                </button>
              )}
              <button onClick={() => resetTimer()} className="btn btn-ghost h-11 w-11 !rounded-xl">
                <RotateCcw className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="mt-3 flex justify-center gap-1.5">
              {DURASI_OPSI.map((d) => (
                <button
                  key={d}
                  onClick={() => resetTimer(d)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-bold transition-colors",
                    durasi === d ? "bg-amber-400/20 text-amber-200" : "bg-white/6 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {d / 60} mnt
                </button>
              ))}
            </div>
            <p className="mt-3 text-[0.7rem] text-zinc-500">
              {sisa === 0 ? "Waktu sapaan habis — lanjut ke aktivitas berikutnya!" : "Atur ritme pembuka kelas dengan timer ini."}
            </p>
          </div>

          {/* MOOD DISTRIBUTION */}
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <p className="label !mb-0">Kabar kelas hari ini</p>
              <span className="chip mono tabular !text-emerald-300 border-emerald-400/25 bg-emerald-400/8">
                <Users className="h-3.5 w-3.5" /> {data?.terisi ?? 0}/{data?.totalSiswa ?? 0}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {MOODS.map((m) => {
                const n = data?.moodCount[m.key] ?? 0;
                const terisi = Math.max(data?.terisi ?? 0, 1);
                const pct = Math.round((n / terisi) * 100);
                return (
                  <div key={m.key} className="flex items-center gap-3">
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", m.bg, m.border)}>
                      <m.icon className={cn("h-4.5 w-4.5", m.color)} />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-bold text-zinc-200">{m.label}</span>
                        <span className="mono text-zinc-500 tabular">{n} · {pct}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/8">
                        <div
                          className={cn("bar-grow h-full rounded-full bg-gradient-to-r transition-all", m.bar)}
                          style={{ width: `${(n / maxMood) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PANEL KANAN: stream pesan */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <p className="label !mb-0 flex items-center gap-2">
              <MessagesSquare className="h-3.5 w-3.5" /> Kabar masuk · live
            </p>
            <span className="chip !text-amber-300 border-amber-400/25 bg-amber-400/8">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-amber-400" /> Streaming
            </span>
          </div>

          {(data?.messages ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Hand className="h-12 w-12 text-zinc-700" />
              <p className="max-w-sm text-sm text-zinc-500">
                {sudahSapaan
                  ? "Ajak siswa masuk dengan kode kelas — kabar mereka akan mengalir ke sini secara langsung."
                  : "Sesi sapaan belum dibuka. Tekan tombol “Buka Sesi Sapaan” di kanan atas."}
              </p>
            </div>
          ) : (
            <div className="mt-4 grid max-h-[62vh] content-start gap-2.5 overflow-y-auto pr-1 md:grid-cols-2">
              {(data?.messages ?? []).map((msg, i) => {
                const m = moodByKey(msg.mood);
                return (
                  <div
                    key={`${msg.nama}-${msg.waktu}`}
                    className={cn("anim-rise rounded-2xl border bg-white/3 p-4", i === 0 && m.border, i === 0 && m.bg)}
                    style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", m.bg, m.border)}>
                        <m.icon className={cn("h-4.5 w-4.5", m.color)} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{msg.nama}</p>
                        <p className={cn("text-[0.65rem] font-bold uppercase tracking-widest", m.color)}>{m.label}</p>
                      </div>
                      {i === 0 && <span className="chip !py-0.5 !text-[0.6rem] !text-amber-300 border-amber-400/30 bg-amber-400/10">baru</span>}
                    </div>
                    {msg.pesan && (
                      <p className="mt-2.5 text-sm leading-relaxed text-zinc-300">“{msg.pesan}”</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </GuruShell>
  );
}
