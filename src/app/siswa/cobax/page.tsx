"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Eq } from "@/components/equation";
import { Logo } from "@/components/topbar";
import { COBAX } from "@/lib/aktivitas-data";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleHelp, MousePointerClick, PartyPopper } from "lucide-react";

interface Rekap { opsi: { pilihan: number; count: number; hasil: number | null; benar: boolean | null }[]; reveal: boolean; terisi: number; total: number; sesi: { id: string } | null }

export default function SiswaCobaxPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 1500);
  useStageFollow(state?.kelas.stage, "cobax", state?.kelas.stage !== "cobax");

  const { data } = useSWR<Rekap>(
    siswa ? `/api/cobax?kelasId=${siswa.kelasId}` : null,
    fetcher,
    { refreshInterval: 1500 }
  );

  const [pilihan, setPilihan] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealState, setRevealState] = useState(false);

  // Reset saat sesi baru
  useEffect(() => {
    if (data?.sesi) {
      setSent(false);
      setPilihan(null);
      setError(null);
    }
    setRevealState(data?.reveal ?? false);
  }, [data?.sesi?.id]);

  // Ikuti reveal dari guru
  useEffect(() => {
    if (data?.reveal) setRevealState(true);
  }, [data?.reveal]);

  if (!ready || !siswa) return null;

  const sesiAktif = Boolean(data?.sesi);

  async function pilih(p: number) {
    if (busy || sent) return;
    setPilihan(p);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cobax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: siswa!.siswaId, pilihan: p }),
      });
      const r = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setPilihan(null);
        setError(r.error ?? "Gagal mengirim.");
      }
    } finally {
      setBusy(false);
    }
  }

  const myWorld = (() => {
    if (!data || pilihan === null || !sent) return null;
    const o = data.opsi.find((x) => x.pilihan === pilihan);
    return o ?? null;
  })();

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="chip">{siswa.nama}</span>
        </div>

        <div className="mt-6 text-center">
          <span className="chip !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8 uppercase tracking-[0.2em]">
            <CircleHelp className="h-3.5 w-3.5" /> Tebak Nilai x
          </span>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            Pilih <em className="ff-italic text-[var(--red)]">angka</em> ini
          </h1>
          <div className="mono eq-badge mx-auto mt-4 w-fit px-6 py-3 text-3xl font-bold md:text-4xl">
            <Eq>{`${COBAX.eq} = 0`}</Eq>
          </div>
          <p className="mt-3 text-sm text-[var(--ink-2)]">
            Manakah yang membuat hasilnya <b>tepat NOL</b>? Tap satu angka — bersiap melihat jawaban semua temanmu.
          </p>
        </div>

        {/* Tombol pilihan besar */}
        <div className="mt-7 grid grid-cols-3 gap-3">
          {COBAX.opsi.map((p) => {
            const isPilih = pilihan === p;
            const revealOn = revealState && data?.reveal;
            const o = data?.opsi.find((x) => x.pilihan === p);
            const status = revealOn ? (o?.benar ? "benar" : "salah") : null;
            return (
              <button
                key={p}
                disabled={!sesiAktif || sent || revealState}
                onClick={() => pilih(p)}
                className={cn(
                  "mono flex h-20 items-center justify-center border-2 text-3xl font-extrabold transition-all md:h-24 md:text-4xl",
                  !sent && !revealState && !isPilih && "bg-[var(--card)] border-[var(--hairline-strong)] text-[var(--ink)] hover:-translate-y-1 hover:border-[var(--red)] hover:text-[var(--red)]",
                  isPilih && "border-[var(--red)] bg-[var(--red)] text-white",
                  sent && pilihan !== p && "opacity-35",
                  status === "benar" && "border-emerald-600 bg-emerald-50 text-emerald-700",
                  status === "salah" && "border-[var(--red)]/40 bg-[var(--red)]/5 text-[var(--red)]/60"
                )}
                style={{ borderRadius: 3 }}
              >
                {status === "benar" ? (
                  <span className="flex flex-col items-center leading-none">
                    <CheckCircle2 className="mb-1 h-5 w-5" />
                    {p}
                  </span>
                ) : p}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-3 text-center text-sm text-[var(--red)]">{error}</p>}

        {/* Diagram hasil */}
        <div className="glass mt-7 flex-1 rounded-none p-5" style={{ borderRadius: 3 }}>
          <div className="flex items-center justify-between">
            <p className="label !mb-0">Tebakan kelas</p>
            <span className="mono text-sm font-bold text-[var(--ink-3)] tabular">
              {data?.terisi ?? 0}/{data?.total ?? 0} menjawab
            </span>
          </div>

          {!sesiAktif ? (
            <p className="py-8 text-center text-sm text-[var(--ink-3)]">
              Guru belum membuka slide tebak-tebakan. Sabar menunggu sinyal…
            </p>
          ) : (
            <div className="mt-4 space-y-2.5">
              {(data?.opsi ?? []).map((o) => {
                const max = Math.max(1, ...((data?.opsi ?? []).map((x) => x.count)));
                const pct = (o.count / max) * 100;
                const revealOn = revealState && data?.reveal;
                const isMe = pilihan === o.pilihan;
                return (
                  <div key={o.pilihan} className="flex items-center gap-3">
                    <span className={cn("mono w-12 text-right text-lg font-extrabold tabular", isMe && "text-[var(--red)]")}>x={o.pilihan}</span>
                    <div className="h-9 flex-1 overflow-hidden border border-[var(--hairline)] bg-[var(--paper-2)]">
                      <div
                        className="bar-grow flex h-full items-center px-2 transition-all"
                        style={{
                          width: `${Math.max(o.count === 0 ? 0 : 6, pct)}%`,
                          background: revealOn
                            ? o.benar
                              ? "linear-gradient(90deg,#15803daa,#34d399)"
                              : "linear-gradient(90deg,#c11920aa,#f87171)"
                            : "linear-gradient(90deg,#141414cc,#4b4b4b)",
                        }}
                      >
                        <span className="mono text-xs font-bold text-white tabular">{o.count}</span>
                      </div>
                    </div>
                    <span className={cn("mono w-20 text-right text-xs font-bold tabular", revealOn ? (o.benar ? "text-emerald-700" : "text-[var(--red)]") : "text-[var(--ink-3)]")}>
                      {revealOn ? (o.hasil === 0 ? "= 0" : String(o.hasil)) : "?"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hasil pribadi */}
        {revealState && myWorld && (
          <div className={cn("anim-pop mt-4 border-2 p-4 text-center", myWorld.benar ? "border-emerald-600 bg-emerald-50" : "border-[var(--red)]/50 bg-[var(--red)]/5")}
            style={{ borderRadius: 3 }}
          >
            <p className="flex items-center justify-center gap-2 text-lg font-extrabold">
              {myWorld.benar ? <><PartyPopper className="h-5 w-5 text-emerald-600" /> Tepat! x = {myWorld.pilihan} membuat hasil NOL.</> : <><span className="text-[var(--red)]">Belum</span> — hasilnya {myWorld.hasil}.</>}
            </p>
            <p className="mt-1 text-sm text-[var(--ink-2)]">
              {myWorld.benar ? "Selamat — ini salah satu akar persamaan kuadrat!" : "Coba perhatikan batang berwarna hijau di atas."}
            </p>
          </div>
        )}

        {!sent && sesiAktif && !revealState && (
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-[var(--ink-3)]">
            <MousePointerClick className="h-3.5 w-3.5" /> Jawaban ini tidak bisa diubah — pilih dengan yakin!
          </p>
        )}
      </div>
    </main>
  );
}
