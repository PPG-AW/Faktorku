"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { CircleCheckBig, PencilLine, Send, Sparkles, Star } from "lucide-react";

function StarRating({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-125 disabled:opacity-60"
        >
          <Star className={cn("h-8 w-8 transition-colors", (hover || value) >= n ? "fill-[var(--red)] text-[var(--red)]" : "text-[var(--ink-3)]")} />
        </button>
      ))}
      <span className="mono ml-2 self-center text-sm font-bold text-[var(--red)] tabular">{value}/5</span>
    </div>
  );
}

const ITEM_TUJUAN = [
  { key: "t1", label: "Bentuk umum ax² + bx + c = 0", desc: "Konsep persamaan kuadrat" },
  { key: "t2", label: "T-Faktor: cari dua bilangan", desc: "p × q = c dan p + q = b" },
  { key: "t3", label: "Substitusi akar", desc: "Buktikan jawaban benar" },
  { key: "t4", label: "Pola tanda faktor", desc: "b dan c menentukan tanda kurung" },
];

export default function RefleksiPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 2500);
  useStageFollow(state?.kelas.stage, "refleksi", state?.kelas.stage !== "refleksi");

  const { data: existing, mutate } = useSWR<{ refleksi: any }>(siswa ? `/api/refleksi?siswaId=${siswa.siswaId}` : null, fetcher);

  const [rating, setRating] = useState(0);
  const [t1, setT1] = useState(false);
  const [t2, setT2] = useState(false);
  const [t3, setT3] = useState(false);
  const [t4, setT4] = useState(false);
  const [mudah, setMudah] = useState("");
  const [sulit, setSulit] = useState("");
  const [satuKata, setSatuKata] = useState("");
  const [exitTicket, setExitTicket] = useState("");
  const [edited, setEdited] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const r = existing?.refleksi;
    if (r && !edited) {
      setRating(r.rating ?? 0);
      setT1(r.tujuan1); setT2(r.tujuan2); setT3(r.tujuan3); setT4(r.tujuan3 ?? false);
      setMudah(r.tugasRumah ?? "");
      setSulit(r.kesulitan ?? "");
      setSatuKata(r.satuKata ?? "");
      setExitTicket(r.exitTicket ?? "");
      setSent(true);
    }
  }, [existing, edited]);

  if (!ready || !siswa) return null;
  const locked = sent && !edited;

  async function submit() {
    if (sending) return;
    setSending(true);
    try {
      await fetch("/api/refleksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siswaId: siswa!.siswaId,
          tujuan1: t1, tujuan2: t2, tujuan3: t3 || t4,
          rating,
          ratingTF: t2 ? rating : 0, ratingAC: t4 ? rating : 0,
          kesulitan: sulit, tugasRumah: mudah,
          satuKata, exitTicket,
        }),
      });
      setSent(true); setEdited(false); mutate();
    } finally { setSending(false); }
  }

  const TUJUAN_STATE: Record<string, [boolean, (b: boolean) => void, string, string]> = {
    t1: [t1, setT1, ITEM_TUJUAN[0].label, ITEM_TUJUAN[0].desc],
    t2: [t2, setT2, ITEM_TUJUAN[1].label, ITEM_TUJUAN[1].desc],
    t3: [t3, setT3, ITEM_TUJUAN[2].label, ITEM_TUJUAN[2].desc],
    t4: [t4, setT4, ITEM_TUJUAN[3].label, ITEM_TUJUAN[3].desc],
  };

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="chip">{siswa.nama}</span>
        </div>

        <div className="mt-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center border border-[var(--red)]/30 bg-[var(--red)]/8">
            <Sparkles className="h-4.5 w-4.5 text-[var(--red)]" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold">REFLEKSI & EXIT TICKET</h1>
            <p className="text-[0.7rem] text-[var(--ink-3)]">Jawabanmu membentuk word cloud kelas real-time</p>
          </div>
        </div>

        {sent && !edited && (
          <div className="anim-rise mt-5 flex items-center gap-3 border border-emerald-600/30 bg-emerald-50 px-4 py-3" style={{ borderRadius: 3 }}>
            <CircleCheckBig className="h-5 w-5 shrink-0 text-emerald-700" />
            <p className="flex-1 text-sm text-emerald-700">Refleksimu sudah terkirim — lihat word cloud di papan!</p>
            <button onClick={() => setEdited(true)} className="btn btn-ghost px-3 py-1.5 text-xs"><PencilLine className="h-3.5 w-3.5" /> Ubah</button>
          </div>
        )}

        <div className="mt-5 space-y-4 pb-10">
          {/* Rating */}
          <div className="glass p-6" style={{ borderRadius: 3 }}>
            <p className="label">Berapa seru pelajaran hari ini?</p>
            <StarRating value={rating} onChange={setRating} disabled={locked} />
          </div>

          {/* Tujuan */}
          <div className="glass p-6" style={{ borderRadius: 3 }}>
            <p className="label !mb-3">Aku sudah paham:</p>
            <div className="space-y-2">
              {(Object.keys(TUJUAN_STATE) as (keyof typeof TUJUAN_STATE)[]).map((k) => {
                const [v, setV, label, desc] = TUJUAN_STATE[k];
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={locked}
                    onClick={() => setV(!v)}
                    className={cn("flex w-full items-center gap-3 border px-4 py-3.5 text-left transition-all", v ? "border-emerald-600/40 bg-emerald-50" : "border-[var(--hairline)] bg-[var(--card)] hover:bg-[var(--paper-2)]")}
                    style={{ borderWidth: 1, borderRadius: 3 }}
                  >
                    <span className={cn("mono flex h-6 w-6 items-center justify-center border-2", v ? "border-emerald-600 bg-emerald-600 text-white font-extrabold" : "border-[var(--ink-3)] text-transparent")}>
                      ✓
                    </span>
                    <span>
                      <span className={cn("block text-sm font-extrabold", v ? "text-[var(--ink)]" : "text-[var(--ink-2)]")}>{label}</span>
                      <span className="block text-xs text-[var(--ink-3)]">{desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 word box + 1 kata + exit ticket */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass p-5" style={{ borderRadius: 3 }}>
              <p className="label">Paling mudah hari ini:</p>
              <textarea className="input min-h-24 resize-none" placeholder="mis. Menebak nilai x…" value={mudah} maxLength={120} disabled={locked} onChange={(e) => setMudah(e.target.value)} />
            </div>
            <div className="glass p-5" style={{ borderRadius: 3 }}>
              <p className="label">Paling sulit hari ini:</p>
              <textarea className="input min-h-24 resize-none" placeholder="mis. Pola tanda faktor…" value={sulit} maxLength={120} disabled={locked} onChange={(e) => setSulit(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass p-5" style={{ borderRadius: 3 }}>
              <p className="label">Satu kata untuk pelajaran ini:</p>
              <input className="input mono" placeholder="hanya 1 kata" value={satuKata} maxLength={24} disabled={locked} onChange={(e) => setSatuKata(e.target.value)} />
              <p className="mt-1.5 text-[0.62rem] text-[var(--ink-3)]">Kata ini akan membesar di word cloud kelas.</p>
            </div>
            <div className="border-gradient p-5" style={{ background: "var(--card)" }}>
              <p className="label !text-[var(--red)]">Exit Ticket</p>
              <p className="mono text-sm text-[var(--ink)]">Faktorkan x^2 + 9x + 14 = 0</p>
              <input className="input mono mt-2" placeholder="tulis hasil faktornya…" value={exitTicket} maxLength={80} disabled={locked} onChange={(e) => setExitTicket(e.target.value)} />
            </div>
          </div>

          {!locked && (
            <button
              onClick={submit}
              disabled={sending || rating === 0 || satuKata.trim().length < 2 || exitTicket.trim().length < 2}
              className="btn btn-primary w-full py-4 text-base"
            >
              {sending ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Send className="h-4.5 w-4.5" />}
              Kirim Refleksi & Exit Ticket
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
