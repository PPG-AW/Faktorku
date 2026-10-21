"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { MOODS } from "@/lib/moods";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { CircleCheckBig, Hand, Hourglass, PencilLine, Send, Sunrise } from "lucide-react";

function salamWaktu(): string {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

export default function SapaanPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 2000);
  useStageFollow(state?.kelas.stage, "sapaan", state?.kelas.stage !== "sapaan");

  const { data: existing, mutate } = useSWR<{ sapaan: { mood: string; pesan: string } | null }>(
    siswa ? `/api/sapaan?siswaId=${siswa.siswaId}` : null,
    fetcher
  );

  const [mood, setMood] = useState<string | null>(null);
  const [pesan, setPesan] = useState("");
  const [sent, setSent] = useState(false);
  const [edited, setEdited] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing?.sapaan && !edited) {
      setMood(existing.sapaan.mood);
      setPesan(existing.sapaan.pesan);
      setSent(true);
    }
  }, [existing, edited]);

  if (!ready || !siswa) return null;

  const locked = sent && !edited;

  async function submit() {
    if (sending || !mood) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/sapaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: siswa!.siswaId, mood, pesan }),
      });
      const r = await res.json();
      if (res.ok) {
        setSent(true);
        setEdited(false);
        mutate();
      } else {
        setError(r.error ?? "Gagal mengirim.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="relative min-h-screen">
      <Ambient variant="warm" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="chip">{siswa.nama}</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="anim-fade-up mx-auto w-fit">
            <span className="chip !text-amber-300 border-amber-400/30 bg-amber-400/10 uppercase tracking-[0.2em] !text-[0.65rem]">
              <Sunrise className="h-3.5 w-3.5" /> Salam Pembuka
            </span>
          </div>

          <h1 className="anim-fade-up anim-fade-up-1 mt-5 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {salamWaktu()},{" "}
            <span className="text-gradient">{siswa.nama.split(" ")[0]}!</span>
          </h1>
          <p className="anim-fade-up anim-fade-up-2 mt-3 text-center text-sm leading-relaxed text-zinc-400 md:text-base">
            Sebelum kita mulai belajar, gurumu ingin tahu:{" "}
            <span className="font-bold text-zinc-200">apa kabarmu hari ini?</span>{" "}
            Jawabanmu langsung tampil di papan kelas.
          </p>

          {/* Mood picker */}
          <div className="anim-fade-up anim-fade-up-3 mt-8 grid grid-cols-5 gap-2 md:gap-3">
            {MOODS.map((m) => {
              const active = mood === m.key;
              return (
                <button
                  key={m.key}
                  disabled={locked}
                  onClick={() => setMood(m.key)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border px-1 py-4 transition-all",
                    active
                      ? cn(m.border, m.bg, "-translate-y-1.5 shadow-[0_16px_40px_-16px_rgba(99,102,241,0.6)]")
                      : "border-white/10 bg-white/3 hover:-translate-y-0.5 hover:bg-white/7",
                    locked && !active && "opacity-40"
                  )}
                >
                  <m.icon className={cn("h-8 w-8 transition-transform md:h-9 md:w-9", active ? cn(m.color, "scale-110") : "text-zinc-400")} />
                  <span className={cn("text-center text-[0.6rem] font-bold leading-tight md:text-[0.68rem]", active ? "text-white" : "text-zinc-500")}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pesan */}
          <div className="anim-fade-up anim-fade-up-4 mt-5">
            <label className="label !normal-case !tracking-normal !text-zinc-400" htmlFor="pesan">
              Ceritakan singkat (opsional) — mis. kabar, semangat, atau hal yang kamu pikirkan hari ini
            </label>
            <textarea
              id="pesan"
              className="input min-h-24 resize-none"
              placeholder="mis. Aku baik! Semalam belajar sampai larut, tapi siap untuk kuis…"
              value={pesan}
              maxLength={200}
              disabled={locked}
              onChange={(e) => setPesan(e.target.value)}
            />
            <div className="mt-1.5 flex justify-end">
              <span className="mono text-xs text-zinc-600 tabular">{pesan.length}/200</span>
            </div>
          </div>

          {error && <p className="mt-2 text-center text-sm text-rose-300">{error}</p>}

          {!locked ? (
            <button onClick={submit} disabled={sending || !mood} className="btn btn-primary mt-3 w-full py-4 text-base">
              {sending ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Hand className="h-5 w-5" />
              )}
              Kirim Kabar ke Papan Kelas
            </button>
          ) : (
            <div className="anim-pop mt-3 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/8 px-4 py-3.5">
                <CircleCheckBig className="h-5 w-5 shrink-0 text-emerald-300" />
                <p className="flex-1 text-sm text-emerald-200">
                  Kabarmu sudah tampil di papan kelas!
                </p>
                <button onClick={() => setEdited(true)} className="btn btn-ghost px-3 py-1.5 text-xs">
                  <PencilLine className="h-3.5 w-3.5" /> Ubah
                </button>
              </div>
              <p className="flex items-center justify-center gap-2 text-center text-xs text-zinc-500">
                <Hourglass className="h-3.5 w-3.5 animate-spin [animation-duration:4s]" />
                Tunggu guru membuka aktivitas berikutnya — layar ini berpindah otomatis.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
