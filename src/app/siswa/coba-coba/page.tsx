"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { Eq } from "@/components/equation";
import { COBA } from "@/lib/aktivitas-data";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn, parseNum } from "@/lib/utils";
import { Check, FlaskConical, Lightbulb, MousePointerClick, X } from "lucide-react";

interface Attempt { x: number; hasil: number; akar: boolean; waktu: string }

export default function CobaCobaPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 2000);
  useStageFollow(state?.kelas.stage, "coba-coba", state?.kelas.stage !== "coba-coba");

  const { data, mutate } = useSWR<{ attempts: Attempt[] }>(
    siswa ? `/api/aktivitas?siswaId=${siswa.siswaId}&jenis=coba-coba` : null,
    fetcher
  );

  const [input, setInput] = useState("");
  const [hasilBaru, setHasilBaru] = useState<{ x: number; hasil: number; akar: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const attempts = data?.attempts ?? [];
  const roots = [...new Set(attempts.filter((a) => a.akar).map((a) => Math.round(a.x * 1e6) / 1e6))];
  const ketemuSemua = COBA.akar.every((r) => roots.some((x) => Math.abs(x - r) < 1e-6));

  useEffect(() => {
    if (hasilBaru) {
      const t = setTimeout(() => setHasilBaru(null), 4000);
      return () => clearTimeout(t);
    }
  }, [hasilBaru]);

  if (!ready || !siswa) return null;

  async function coba(e?: React.FormEvent) {
    e?.preventDefault();
    const x = parseNum(input);
    if (x === null || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/aktivitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jenis: "coba-coba", siswaId: siswa!.siswaId, x: String(x) }),
      });
      const r = await res.json();
      if (res.ok) {
        setHasilBaru({ x: r.x, hasil: r.hasil, akar: r.akar });
        setInput("");
        mutate();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="chip">{siswa.nama}</span>
        </div>

        <div className="mt-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-400/10">
            <FlaskConical className="h-4.5 w-4.5 text-sky-300" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white">COBA-COBA</h1>
            <p className="text-[0.7rem] text-zinc-500">Fase 2 · Problem Statement — temukan nilai x dengan menebak</p>
          </div>
        </div>

        {/* Persamaan */}
        <div className="glass mt-5 rounded-3xl p-6 text-center">
          <p className="label !text-zinc-500">Persamaan Rina</p>
          <div className="mono eq-badge mx-auto mt-1 w-fit px-5 py-3 text-2xl font-bold text-indigo-100">
            <Eq>{`${COBA.eq} = 0`}</Eq>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Masukkan sembarang nilai x — website menghitung hasilnya. Kalau hasilnya{" "}
            <span className="font-bold text-emerald-300">tepat 0</span>, kamu menemukan akar!
          </p>

          <form onSubmit={coba} className="mt-5 flex items-center justify-center gap-3">
            <span className="mono text-xl font-bold text-zinc-300"><Eq>x</Eq> =</span>
            <input
              className="input mono !w-36 text-center text-2xl font-extrabold"
              placeholder="…"
              value={input}
              inputMode="decimal"
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <button type="submit" disabled={busy || parseNum(input) === null} className="btn btn-primary px-5 py-3.5">
              <MousePointerClick className="h-5 w-5" /> Coba!
            </button>
          </form>

          {/* Hasil terbaru */}
          {hasilBaru && (
            <div className={cn(
              "anim-pop mx-auto mt-5 w-fit rounded-2xl border px-5 py-3.5",
              hasilBaru.akar ? "border-emerald-400/40 bg-emerald-400/12" : "border-white/12 bg-white/5"
            )}>
              <p className="mono text-lg font-bold text-zinc-100 tabular">
                ({hasilBaru.x})² − 20({hasilBaru.x}) + 75 ={" "}
                <span className={hasilBaru.akar ? "text-emerald-300" : "text-rose-300"}>{hasilBaru.hasil}</span>
              </p>
              <p className={cn("mt-1 text-sm font-extrabold", hasilBaru.akar ? "text-emerald-300" : "text-zinc-400")}>
                {hasilBaru.akar ? "AKAR DITEMUKAN! Tepat nol!" : hasilBaru.hasil > 0 ? "Masih positif — belum nol" : "Negatif — belum nol"}
              </p>
            </div>
          )}

          {/* Akar tracker */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {COBA.akar.map((r) => {
              const found = roots.some((x) => Math.abs(x - r) < 1e-6);
              return (
                <span key={r} className={cn("chip !text-sm", found ? "!text-emerald-300 border-emerald-400/35 bg-emerald-400/10" : "opacity-60")}>
                  {found ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  Akar {found ? `x = ${r}` : "?"}
                </span>
              );
            })}
          </div>
        </div>

        {/* Riwayat percobaan */}
        <div className="glass mt-4 rounded-3xl p-5">
          <p className="label">Riwayat tebakanmu ({attempts.length}×)</p>
          {attempts.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-500">Belum ada tebakan. Coba nilai pertama!</p>
          ) : (
            <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
              {attempts.map((a, i) => (
                <span
                  key={i}
                  className={cn(
                    "mono rounded-lg border px-2.5 py-1.5 text-xs font-bold tabular",
                    a.akar ? "border-emerald-400/40 bg-emerald-400/12 text-emerald-300" : "border-white/10 bg-white/4 text-zinc-400"
                  )}
                >
                  x={a.x} → {a.hasil}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Refleksi Fase 2 */}
        <div className={cn("anim-rise mt-4 rounded-3xl border p-5", attempts.length >= 4 ? "border-amber-400/30 bg-amber-400/8" : "border-white/10 bg-white/3")}>
          <p className="flex items-center gap-2 text-sm font-bold text-amber-200">
            <Lightbulb className="h-4.5 w-4.5" /> Pikirkan ini…
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            {ketemuSemua
              ? "Hebat, kamu menemukan keduanya! Tapi sadarkah berapa tebakan yang kamu butuhkan? Bagaimana kalau akarnya pecahan, mis. -0,5? Apakah menebak tetap efisien?"
              : "Sudah berapa kali kamu menebak? Apakah cara ini CEPAT dan PASTI? Rumuskan pertanyaannya: “Bagaimana cara menemukan nilai x dengan cepat dan pasti?”"}
          </p>
        </div>
      </div>
    </main>
  );
}
