"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eq } from "@/components/equation";
import { TimerRing } from "@/components/timer";
import { parseNum, numEq, cn } from "@/lib/utils";
import { Check, X, Lightbulb, Send, RotateCw, Target } from "lucide-react";

export interface WsSoalClient {
  id: string;
  nomor: number;
  pertanyaan: string;
  tipe: "t-faktor" | "metode-ac";
  timer: number;
  data: { a: number; b: number; c: number; hint: string[] };
}

export interface WsResultServer {
  benar: boolean;
  skor: number;
  pqBenar: boolean;
  faktorBenar: boolean;
  akarBenar: boolean;
  solusi: {
    p: number; q: number;
    faktor: string;
    akar: string;
  };
}

function NumField({
  value,
  onChange,
  placeholder,
  width = "w-20",
  disabled,
  accent,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  width?: string;
  disabled?: boolean;
  accent?: string;
}) {
  return (
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "?"}
      inputMode="text"
      className={cn(
        "mono inline-block rounded-lg border bg-white/6 px-2 py-1.5 text-center text-base font-bold text-white outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-400/70 focus:bg-indigo-500/10 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)] disabled:opacity-50",
        width,
        accent ?? "border-white/15"
      )}
    />
  );
}

function LiveChip({ ok, label }: { ok: boolean | null; label: React.ReactNode }) {
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
        ok === null && "border-white/10 bg-white/4 text-zinc-400",
        ok === true && "border-emerald-400/35 bg-emerald-400/12 text-emerald-300",
        ok === false && "border-rose-400/35 bg-rose-400/12 text-rose-300"
      )}
    >
      {ok === null ? <Target className="h-3.5 w-3.5" /> : ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

export function TFaktorInput({
  soal,
  result,
  submitting,
  onSubmit,
}: {
  soal: WsSoalClient;
  result: WsResultServer | null;
  submitting: boolean;
  onSubmit: (jawaban: { p: number | null; q: number | null; fb1: number | null; fb2: number | null; x1: number | null; x2: number | null }, hintDipakai: number, waktu: number) => void;
}) {
  const { a, b, c, hint } = soal.data;
  const isAC = soal.tipe === "metode-ac";

  const [p, setP] = useState("");
  const [q, setQ] = useState("");
  const [fb1, setFb1] = useState("");
  const [fb2, setFb2] = useState("");
  const [x1, setX1] = useState("");
  const [x2, setX2] = useState("");
  const [hintShown, setHintShown] = useState(0);
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(iv);
  }, []);

  const pN = useMemo(() => parseNum(p), [p]);
  const qN = useMemo(() => parseNum(q), [q]);

  const targetKali = isAC ? a * c : c;
  const targetPlus = b;

  const kaliOk = pN === null || qN === null ? null : numEq(pN * qN, targetKali);
  const plusOk = pN === null || qN === null ? null : numEq(pN + qN, targetPlus);
  const pqOk = kaliOk === true && plusOk === true;

  const sisa = Math.max(0, soal.timer - elapsed);
  const done = result !== null;

  const eqStr = `${a === 1 ? "" : a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}x ${c < 0 ? "-" : "+"} ${Math.abs(c)} = 0`;
  const faktorku = isAC ? a : 1;

  const canSubmit = !done && !submitting;
  const waktuPakai = Math.min(elapsed, 5999);

  return (
    <div className="glass rounded-3xl p-5 md:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label !mb-1">Soal {soal.nomor} · {isAC ? "Metode AC" : "T-Faktor"}</p>
          <div className="mono eq-badge px-4 py-2 text-lg font-bold text-indigo-100 md:text-2xl">
            <Eq>{eqStr}</Eq>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TimerRing sisa={sisa} total={soal.timer} size={76} stroke={6} />
          {sisa === 0 && <span className="text-[0.65rem] font-bold uppercase tracking-widest text-rose-400">Waktu habis</span>}
        </div>
      </div>

      {/* LANGKAH 1 — p dan q */}
      <div className="mt-6 rounded-2xl border border-white/8 bg-white/3 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
          Langkah 1 · Temukan p dan q
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          {isAC ? (
            <>Karena <Eq>{`a = ${a}`}</Eq>, pakai aturan AC: <Eq>{`p x q = a x c = ${targetKali}`}</Eq> dan <Eq>{`p + q = b = ${targetPlus}`}</Eq></>
          ) : (
            <><Eq>{`p x q = c = ${targetKali}`}</Eq> dan <Eq>{`p + q = b = ${targetPlus}`}</Eq></>
          )}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="mono text-sm font-bold text-zinc-300">p =</span>
            <NumField value={p} onChange={setP} disabled={done} />
          </label>
          <label className="flex items-center gap-2">
            <span className="mono text-sm font-bold text-zinc-300">q =</span>
            <NumField value={q} onChange={setQ} disabled={done} />
          </label>
          <div className="flex flex-col gap-1.5">
            <LiveChip ok={kaliOk} label={pN !== null && qN !== null ? `${(p ?? "?") || "?"} × ${(q ?? "?") || "?"} = ${pN * qN} · target ${targetKali}` : `p × q harus = ${targetKali}`} />
            <LiveChip ok={plusOk} label={pN !== null && qN !== null ? `${pN} + ${qN} = ${pN + qN} · target ${targetPlus}` : `p + q harus = ${targetPlus}`} />
          </div>
        </div>
      </div>

      {/* LANGKAH 2 (AC) — pecah suku tengah */}
      {isAC && (
        <div className={cn("mt-4 rounded-2xl border p-4 transition-all", pqOk ? "border-violet-400/25 bg-violet-400/6" : "border-white/6 bg-white/2 opacity-55")}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
            Langkah 2 · Pecah suku tengah
          </p>
          {pqOk && pN !== null && qN !== null ? (
            <div className="mono mt-2 text-base text-zinc-200 md:text-lg">
              <Eq>{`${a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}x ${c < 0 ? "-" : "+"} ${Math.abs(c)}`}</Eq>
              <span className="mx-2 text-indigo-300">=</span>
              <Eq>{`${a}x^2 + ${pN}x + ${qN}x + ${c}`}</Eq>
              <p className="mt-2 text-sm text-zinc-400">
                Kelompokkan: <Eq>{`${a === 1 ? "" : a}x(x + ${fmtNum(pN / a)}) + ${qN}(x + ${fmtNum(c / qN)})`}</Eq>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">Selesaikan Langkah 1 untuk membuka langkah ini.</p>
          )}
        </div>
      )}

      {/* LANGKAH akhir — faktor */}
      <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
          {isAC ? "Langkah 3" : "Langkah 2"} · Tulis faktornya
        </p>
        <div className="mono mt-3 flex flex-wrap items-center gap-1.5 text-lg text-zinc-100 md:text-xl">
          <span>(</span>
          <Eq>{faktorku === 1 ? "x" : `${faktorku}x`}</Eq>
          <span>+</span>
          <NumField value={fb1} onChange={setFb1} disabled={done} accent="border-emerald-400/30" />
          <span>)(</span>
          <Eq>x</Eq>
          <span>+</span>
          <NumField value={fb2} onChange={setFb2} disabled={done} accent="border-emerald-400/30" />
          <span>) = 0</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">Boleh negatif — tulis tandanya, mis. -3</p>
      </div>

      {/* AKAR */}
      <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
          {isAC ? "Langkah 4" : "Langkah 3"} · Akar-akar (sifat nol)
        </p>
        <div className="mono mt-3 flex flex-wrap items-center gap-3 text-lg text-zinc-100">
          <span className="flex items-center gap-1.5"><Eq>x</Eq> = <NumField value={x1} onChange={setX1} disabled={done} accent="border-amber-400/30" /></span>
          <span className="text-zinc-500">atau</span>
          <span className="flex items-center gap-1.5"><Eq>x</Eq> = <NumField value={x2} onChange={setX2} disabled={done} accent="border-amber-400/30" /></span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">Pecahan boleh ditulis “-1/2”</p>
      </div>

      {/* HINT + SUBMIT */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          {!done && hintShown < hint.length && (
            <button
              onClick={() => setHintShown((h) => h + 1)}
              className="btn btn-ghost px-4 py-2.5 text-sm"
            >
              <Lightbulb className="h-4 w-4 text-amber-300" />
              Buka Hint {hintShown + 1} <span className="mono text-zinc-500">(−8 poin)</span>
            </button>
          )}
          <div className="mt-2 space-y-1.5">
            {hint.slice(0, hintShown).map((h, i) => (
              <p key={i} className="anim-rise flex max-w-md items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/8 px-3 py-2 text-xs text-amber-200/90">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <Eq>{h}</Eq>
              </p>
            ))}
          </div>
        </div>

        {!done ? (
          <button
            disabled={!canSubmit || pN === null || qN === null || parseNum(fb1) === null || parseNum(fb2) === null || parseNum(x1) === null || parseNum(x2) === null}
            onClick={() =>
              onSubmit(
                { p: pN, q: qN, fb1: parseNum(fb1), fb2: parseNum(fb2), x1: parseNum(x1), x2: parseNum(x2) },
                hintShown,
                waktuPakai
              )
            }
            className="btn btn-primary px-6 py-3 text-base"
          >
            {submitting ? <RotateCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Jawaban
          </button>
        ) : null}
      </div>

      {/* HASIL */}
      {done && result && (
        <div className={cn("anim-pop mt-6 rounded-2xl border p-4 md:p-5", result.benar ? "border-emerald-400/30 bg-emerald-400/8" : "border-amber-400/25 bg-amber-400/6")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={cn("text-lg font-extrabold", result.benar ? "text-emerald-300" : "text-amber-300")}>
              {result.benar ? "Sempurna! Semua langkah benar." : "Terekam — sebagian langkah sudah benar."}
            </p>
            <span className="mono rounded-xl bg-white/8 px-3 py-1.5 text-sm font-bold text-white">
              Skor: {result.skor}/100
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <LiveChip ok={result.pqBenar} label="Langkah p & q (+30)" />
            <LiveChip ok={result.faktorBenar} label="Faktor (+40)" />
            <LiveChip ok={result.akarBenar} label="Akar-akar (+30)" />
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-ink-900/60 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">Kunci Pembahasan</p>
            <div className="mono mt-2 space-y-1.5 text-sm text-zinc-200 md:text-base">
              <p><Eq>{`p = ${result.solusi.p}, q = ${result.solusi.q}`}</Eq></p>
              <p><Eq>{result.solusi.faktor}</Eq></p>
              <p className="text-emerald-300"><Eq>{result.solusi.akar}</Eq></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function fmtNum(v: number): string {
  const rounded = Math.round(v * 1000) / 1000;
  return String(rounded);
}
