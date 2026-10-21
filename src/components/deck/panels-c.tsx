"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Eq } from "@/components/equation";
import { fetcher } from "@/hooks/use-session";
import { COBAX } from "@/lib/aktivitas-data";
import { cn, formatWaktu } from "@/lib/utils";
import type { PanelProps } from "@/components/deck/panels-a";
import { CheckCircle2, CircleHelp, MousePointerClick, TimerReset } from "lucide-react";

interface Rekap {
  opsi: { pilihan: number; count: number; hasil: number | null; benar: boolean | null }[];
  reveal: boolean; terisi: number; total: number;
  sesi: { id: string; startedAt: string } | null;
}

export function DeckCobax({ kelasId, onReveal }: PanelProps & { onReveal: () => Promise<void> }) {
  const [reveal, setReveal] = useState(false);
  const { data, mutate } = useSWR<Rekap>(`/api/cobax?kelasId=${kelasId}${reveal ? "&reveal=true" : ""}`, fetcher, { refreshInterval: 1500 });
  const max = Math.max(1, ...((data?.opsi ?? []).map((o) => o.count)));
  const cukup = (data?.terisi ?? 0) >= Math.max(1, Math.min(3, data?.total ?? 1));

  useEffect(() => { if (data?.reveal) setReveal(true); }, [data?.reveal]);

  async function doReveal() {
    setReveal(true);
    await onReveal();
    mutate();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="text-center">
        <span className="chip uppercase tracking-[0.22em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8 !text-[0.6rem]">
          <CircleHelp className="h-3.5 w-3.5" /> Fase 2 · Tebak Nilai x
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          Manakah yang membuatnya <em className="ff-italic text-[var(--red)]">NOL</em>?
        </h1>
        <div className="mono eq-badge mx-auto mt-4 w-fit px-7 py-3.5 text-3xl font-bold md:text-4xl">
          <Eq>{`${COBAX.eq} = 0`}</Eq>
        </div>
      </div>

      <div className="mt-7 grid flex-1 gap-4 lg:grid-cols-[1fr_340px]">
        <div className="glass flex flex-col justify-center p-6" style={{ borderRadius: 3 }}>
          <div className="mb-5 flex items-center justify-between">
            <p className="label !mb-0">Diagram tebakan kelas</p>
            <span className="mono text-xl font-extrabold tabular">
              {data?.terisi ?? 0}<span className="text-[var(--ink-3)]">/{data?.total ?? 0}</span>
            </span>
          </div>
          <div className="space-y-3">
            {(data?.opsi ?? []).map((o) => {
              const revealOn = reveal && data?.reveal;
              const pct = (o.count / max) * 100;
              return (
                <div key={o.pilihan} className="flex items-center gap-3">
                  <span className="mono w-20 text-right text-2xl font-extrabold tabular">x = {o.pilihan}</span>
                  <div className="h-14 flex-1 overflow-hidden border border-[var(--hairline)] bg-[var(--paper-2)]">
                    <div
                      className="bar-grow flex h-full items-center px-3"
                      style={{
                        width: `${Math.max(o.count === 0 ? 0 : 5, pct)}%`,
                        background: revealOn
                          ? o.benar ? "linear-gradient(90deg,#15803dcc,#34d399)" : "linear-gradient(90deg,#c11920cc,#f87171)"
                          : "linear-gradient(90deg,#141414,#3d3d3d)",
                      }}
                    >
                      <span className="mono text-lg font-bold text-white tabular">{o.count}</span>
                    </div>
                  </div>
                  <span className={cn("mono w-28 text-right text-lg font-extrabold tabular", revealOn ? (o.benar ? "text-emerald-700" : "text-[var(--red)]") : "text-[var(--ink-3)]")}>
                    {revealOn ? (o.hasil === 0 ? "= 0" : String(o.hasil)) : "…"}
                  </span>
                </div>
              );
            })}
          </div>
          {reveal && (
            <p className="anim-pop mt-6 flex items-center justify-center gap-2 text-xl font-extrabold text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
              Dua akar ditemukan: x = 5 dan x = 15. Persamaan kuadrat punya dua akar!
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="glass p-5 text-center" style={{ borderRadius: 3 }}>
            <p className="label">Kendali</p>
            <p className="mono mt-1 text-4xl font-extrabold tabular">{data?.terisi ?? 0}<span className="text-[var(--ink-3)]">/{data?.total ?? 0}</span></p>
            <p className="mt-1 text-xs text-[var(--ink-3)]">siswa sudah menjawab</p>
            {!reveal ? (
              <button
                onClick={doReveal}
                disabled={!cukup}
                className="btn btn-amber mt-4 w-full py-3 text-base"
              >
                <MousePointerClick className="h-4.5 w-4.5" />
                {cukup ? "Tampilkan Jawaban" : `Tunggu ${Math.max(1, Math.min(3, data?.total ?? 1))} siswa`}
              </button>
            ) : (
              <p className="anim-pop mt-4 flex items-center justify-center gap-2 text-sm font-extrabold text-emerald-700">
                <CheckCircle2 className="h-4.5 w-4.5" /> Jawaban sudah dibuka
              </p>
            )}
          </div>
          <div className="glass p-4" style={{ borderRadius: 3 }}>
            <p className="label flex items-center gap-1.5"><TimerReset className="h-3.5 w-3.5" /> Data kunci (guna saat diskusi)</p>
            <div className="mono space-y-1.5 text-sm">
              {COBAX.opsi.map((o) => {
                const r = hitungCobaxRoute(o);
                return (
                  <p key={o} className={cn("flex justify-between", r.benar ? "text-emerald-700" : "text-[var(--ink-3)]")}>
                    <span>x = {o}</span>
                    <span className="tabular">{r.hasil}</span>
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function hitungCobaxRoute(x: number) {
  const hasil = Number((1 * x * x + -20 * x + 75).toFixed(4));
  return { hasil, benar: hasil === 0 };
}
