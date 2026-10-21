"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Eq } from "@/components/equation";
import { fetcher } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import type { PanelProps } from "@/components/deck/panels-a";
import { Check, CircleHelp, Play, RotateCcw, Users, X } from "lucide-react";

interface Sebaran { pilihan: number; count: number; nama: string[] }
interface Rekap {
  sesi: { id: string } | null;
  terisi: number;
  total: number;
  sebaran: Sebaran[];
}

const PALET = [
  "#C11920", "#1D3557", "#15803D", "#D97706", "#7C3AED",
  "#0E7490", "#BE123C", "#4D7C0F", "#B45309", "#1E40AF",
];

function PieChart({ data, aktif, onPick }: { data: Sebaran[]; aktif: number | null; onPick: (n: number) => void }) {
  const total = data.reduce((a, b) => a + b.count, 0);
  if (total === 0) {
    return (
      <div className="grid h-72 place-items-center border-2 border-dashed border-[var(--hairline-strong)]">
        <p className="text-sm text-[var(--ink-3)]">Belum ada tebakan masuk</p>
      </div>
    );
  }

  const R = 120, CX = 140, CY = 140, INNER = 62;
  let sudut = -Math.PI / 2;

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <svg width={280} height={280} className="shrink-0">
        {data.map((d, i) => {
          const frac = d.count / total;
          const a0 = sudut;
          const a1 = sudut + frac * Math.PI * 2;
          sudut = a1;
          const large = a1 - a0 > Math.PI ? 1 : 0;
          const x0 = CX + R * Math.cos(a0), y0 = CY + R * Math.sin(a0);
          const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
          const ix1 = CX + INNER * Math.cos(a1), iy1 = CY + INNER * Math.sin(a1);
          const ix0 = CX + INNER * Math.cos(a0), iy0 = CY + INNER * Math.sin(a0);
          const mid = (a0 + a1) / 2;
          const lx = CX + ((R + INNER) / 2) * Math.cos(mid);
          const ly = CY + ((R + INNER) / 2) * Math.sin(mid);
          const isAktif = aktif === d.pilihan;
          return (
            <g key={d.pilihan} onClick={() => onPick(d.pilihan)} className="cursor-pointer">
              <path
                d={`M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${INNER} ${INNER} 0 ${large} 0 ${ix0} ${iy0} Z`}
                fill={PALET[i % PALET.length]}
                stroke="#141414"
                strokeWidth={2}
                opacity={aktif === null || isAktif ? 1 : 0.35}
                style={{ transition: "opacity .25s" }}
              />
              {frac > 0.05 && (
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="15" fontWeight="800" fontFamily="Space Mono, monospace" pointerEvents="none">
                  {d.pilihan}
                </text>
              )}
            </g>
          );
        })}
        <circle cx={CX} cy={CY} r={INNER - 2} fill="var(--card)" stroke="#141414" strokeWidth={2} />
        <text x={CX} y={CY - 8} textAnchor="middle" fontSize="30" fontWeight="800" fill="var(--ink)" fontFamily="Space Mono, monospace">{total}</text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fill="var(--ink-3)" fontWeight="700">TEBAKAN</text>
      </svg>

      <div className="max-h-64 w-56 space-y-1 overflow-y-auto">
        {data.map((d, i) => (
          <button
            key={d.pilihan}
            onClick={() => onPick(d.pilihan)}
            className={cn(
              "flex w-full items-center gap-2 border-2 px-2.5 py-1.5 text-left transition-all",
              aktif === d.pilihan ? "border-[var(--ink)] bg-[var(--paper-2)] shadow-[2px_2px_0_var(--ink)]" : "border-[var(--hairline)] hover:bg-[var(--paper-2)]"
            )}
          >
            <span className="h-4 w-4 shrink-0 border border-[var(--ink)]" style={{ background: PALET[i % PALET.length] }} />
            <span className="mono flex-1 text-sm font-extrabold">x = {d.pilihan}</span>
            <span className="mono text-xs tabular text-[var(--ink-3)]">{d.count} siswa</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DeckCobax({ kelasId, onReveal }: PanelProps & { onReveal: () => Promise<void> }) {
  const { data, mutate } = useSWR<Rekap>(`/api/cobax?kelasId=${kelasId}`, fetcher, { refreshInterval: 1500 });
  const [pick, setPick] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sebaran = data?.sebaran ?? [];
  const sesiAda = Boolean(data?.sesi);

  // animasi substitusi bertahap
  useEffect(() => {
    if (pick === null) return;
    setStep(0);
    timerRef.current = setInterval(() => {
      setStep((s) => {
        if (s >= 3) { if (timerRef.current) clearInterval(timerRef.current); return 3; }
        return s + 1;
      });
    }, 900);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pick]);

  const kuadrat = pick !== null ? pick * pick : 0;
  const linear = pick !== null ? 20 * pick : 0;
  const hasil = kuadrat - linear + 75;
  const benar = hasil === 0;

  async function mulaiSesi() {
    await onReveal();
    mutate();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="text-center">
        <span className="chip uppercase tracking-[0.22em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8 !text-[0.6rem]">
          <CircleHelp className="h-3.5 w-3.5" /> Fase 2 · Tebakan Kelas
        </span>
        <h2 className="mt-3 text-3xl md:text-4xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          Angka mana yang membuatnya <em className="ff-italic text-[var(--red)]">nol</em>?
        </h2>
        <div className="eq-badge mono mx-auto mt-3 w-fit px-6 py-3 text-2xl font-bold md:text-3xl">
          <Eq>x^2 - 20x + 75 = 0</Eq>
        </div>
      </div>

      {!sesiAda ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-sm text-[var(--ink-3)]">Buka sesi agar siswa bisa mengirim tebakan 0–30 dari HP.</p>
          <button onClick={mulaiSesi} className="btn btn-amber px-7 py-3 text-base">
            <Play className="h-4.5 w-4.5" /> Buka Tebakan Kelas
          </button>
        </div>
      ) : (
        <div className="mt-5 grid flex-1 gap-5 lg:grid-cols-[1fr_minmax(320px,420px)]">
          {/* diagram lingkaran */}
          <div className="glass p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="label !mb-0">Sebaran tebakan</p>
              <span className="chip !text-[0.65rem]">
                <Users className="h-3.5 w-3.5" /> {data?.terisi ?? 0}/{data?.total ?? 0}
              </span>
            </div>
            <PieChart data={sebaran} aktif={pick} onPick={setPick} />
            <p className="mt-3 text-center text-xs text-[var(--ink-3)]">
              Klik salah satu potongan untuk memeriksa angkanya bersama-sama
            </p>
          </div>

          {/* panel uji substitusi */}
          <div className="border-gradient flex flex-col p-5">
            <p className="label">Mari kita uji bersama</p>
            {pick === null ? (
              <div className="grid flex-1 place-items-center py-10 text-center">
                <p className="text-sm leading-relaxed text-[var(--ink-3)]">
                  Pilih satu angka dari diagram,
                  <br />lalu kita masukkan ke persamaan.
                </p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col justify-center gap-3">
                <div className="mono space-y-2.5 text-center text-xl font-bold md:text-2xl">
                  <p className="anim-rise"><Eq>x^2 - 20x + 75</Eq></p>
                  {step >= 1 && (
                    <p className="anim-rise text-[var(--red)]">
                      <Eq>{`(${pick})^2 - 20(${pick}) + 75`}</Eq>
                    </p>
                  )}
                  {step >= 2 && (
                    <p className="anim-rise">
                      <Eq>{`${kuadrat} - ${linear} + 75`}</Eq>
                    </p>
                  )}
                  {step >= 3 && (
                    <p className={cn("anim-pop text-4xl md:text-5xl", benar ? "text-emerald-700" : "text-[var(--red)]")}>
                      = {hasil}
                    </p>
                  )}
                </div>

                {step >= 3 && (
                  <div className={cn(
                    "anim-pop mt-2 flex items-center justify-center gap-2 border-2 px-4 py-3 text-base font-extrabold",
                    benar ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-[var(--red)] bg-[var(--red)]/8 text-[var(--red)]"
                  )}>
                    {benar ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    {benar ? `Tepat! x = ${pick} adalah akar.` : `Belum nol, x = ${pick} bukan akar.`}
                  </div>
                )}

                <button onClick={() => setPick(null)} className="btn btn-ghost mt-2 py-2 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" /> Coba angka lain
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
