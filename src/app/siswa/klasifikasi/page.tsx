"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { Eq } from "@/components/equation";
import { POLA_ROWS, SORT_ITEMS, gradePola, gradeSort, type PolaRow } from "@/lib/aktivitas-data";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn, parseNum, numEq } from "@/lib/utils";
import { BadgeCheck, Check, Send, Shapes, Sparkles, Table2 } from "lucide-react";

type SortMap = Record<string, "linear" | "kuadrat">;
type PolaMap = Record<string, { sum: string; prod: string }>;

export default function KlasifikasiPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 2000);
  useStageFollow(state?.kelas.stage, "klasifikasi", state?.kelas.stage !== "klasifikasi");

  const { data: existing, mutate } = useSWR<{ klasifikasi: { sortBenar: number; polaBenar: number; hasil: { sort?: SortMap; pola?: PolaMap } } | null }>(
    siswa ? `/api/aktivitas?siswaId=${siswa.siswaId}&jenis=klasifikasi` : null, fetcher
  );

  const [sortMap, setSortMap] = useState<SortMap>({});
  const [polaMap, setPolaMap] = useState<PolaMap>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (existing?.klasifikasi) {
      setSortMap((existing.klasifikasi.hasil.sort ?? {}) as SortMap);
      setPolaMap((existing.klasifikasi.hasil.pola ?? {}) as PolaMap);
      setSent(true);
    }
  }, [existing]);

  if (!ready || !siswa) return null;

  const sortDone = SORT_ITEMS.every((it) => sortMap[it.id]);
  const polaDone = POLA_ROWS.every((r) => {
    const j = polaMap[r.id];
    return j && j.sum.trim() !== "" && j.prod.trim() !== "" && parseNum(j.sum) !== null && parseNum(j.prod) !== null;
  });
  const sortBenarLocal = gradeSort(sortMap);
  const polaBenarLocal = gradePola(polaMap);

  async function submit() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/aktivitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jenis: "klasifikasi", siswaId: siswa!.siswaId, sort: sortMap, pola: polaMap }),
      });
      setSent(true);
      mutate();
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
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/10">
            <Shapes className="h-4.5 w-4.5 text-violet-300" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white">KLASIFIKASI & PENEMUAN POLA</h1>
            <p className="text-[0.7rem] text-zinc-500">Fase 3 · Data Collection — temukan ciri & polanya sendiri</p>
          </div>
        </div>

        {sent && (
          <div className="anim-rise mt-4 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/8 px-4 py-3">
            <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-300" />
            <p className="flex-1 text-sm text-emerald-200">
              Tersimpan! Klasifikasi: <span className="mono font-bold">{existing?.klasifikasi?.sortBenar ?? sortBenarLocal}/6</span> benar ·
              Tabel pola: <span className="mono font-bold">{existing?.klasifikasi?.polaBenar ?? polaBenarLocal}/6</span> benar
            </p>
            <button onClick={() => setSent(false)} className="btn btn-ghost px-3 py-1.5 text-xs">Ubah</button>
          </div>
        )}

        {/* BAGIAN A — SORTIR */}
        <div className="glass mt-4 rounded-3xl p-5 md:p-6">
          <p className="label !text-violet-300">Bagian A · Kelompokkan berdasarkan cirinya</p>
          <p className="mb-4 text-xs text-zinc-500">
            Manakah <span className="font-bold text-sky-300">persamaan linear</span> dan manakah{" "}
            <span className="font-bold text-indigo-300">persamaan kuadrat</span>? Hati-hati dengan yang perlu disederhanakan dulu!
          </p>
          <div className="space-y-2.5">
            {SORT_ITEMS.map((it) => {
              const pilih = sortMap[it.id];
              const benar = sent && pilih === it.bucket;
              const salah = sent && pilih && pilih !== it.bucket;
              return (
                <div
                  key={it.id}
                  className={cn(
                    "flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                    benar ? "border-emerald-400/30 bg-emerald-400/6" : salah ? "border-rose-400/30 bg-rose-400/6" : "border-white/8 bg-white/3"
                  )}
                >
                  <span className="mono flex-1 text-sm font-semibold text-zinc-100 md:text-base"><Eq>{it.eq}</Eq></span>
                  <div className="flex gap-1.5">
                    {(["linear", "kuadrat"] as const).map((bk) => (
                      <button
                        key={bk}
                        disabled={sent}
                        onClick={() => setSortMap((m) => ({ ...m, [it.id]: bk }))}
                        className={cn(
                          "rounded-xl border px-3.5 py-2 text-xs font-bold transition-all",
                          pilih === bk
                            ? bk === "linear"
                              ? "border-sky-400/60 bg-sky-400/20 text-sky-200"
                              : "border-indigo-400/60 bg-indigo-400/25 text-indigo-100"
                            : "border-white/10 bg-white/4 text-zinc-500 hover:bg-white/8 hover:text-zinc-300"
                        )}
                      >
                        {bk === "kuadrat" ? <span><Eq>x^2</Eq> kuadrat</span> : bk}
                      </button>
                    ))}
                  </div>
                  {sent && pilih && (
                    <span className={benar ? "text-emerald-300" : "text-rose-300"}>
                      {benar ? <Check className="h-4.5 w-4.5" /> : <span className="mono text-xs font-bold">seharusnya {it.bucket}</span>}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BAGIAN B — TABEL PENEMUAN */}
        <div className="glass mt-4 rounded-3xl p-5 md:p-6">
          <p className="label !text-emerald-300 flex items-center gap-2"><Table2 className="h-3.5 w-3.5" /> Bagian B · Tabel penemuan pola</p>
          <p className="mb-4 text-xs text-zinc-500">
            Tiga faktorisasi ini sudah selesai. Hitung <span className="mono font-bold">p + q</span> dan{" "}
            <span className="mono font-bold">p × q</span> — lalu amati polanya terhadap persamaan awal!
          </p>
          <div className="space-y-2.5">
            {POLA_ROWS.map((row) => {
              const j = polaMap[row.id] ?? { sum: "", prod: "" };
              const sumOk = sent ? numEq(parseNum(j.sum) ?? NaN, row.p + row.q) : null;
              const prodOk = sent ? numEq(parseNum(j.prod) ?? NaN, row.p * row.q) : null;
              return (
                <div key={row.id} className="rounded-2xl border border-white/8 bg-white/3 p-3.5">
                  <p className="mono text-sm font-semibold text-zinc-100 md:text-base"><Eq>{row.eq}</Eq></p>
                  <div className="mono mt-1 text-xs text-zinc-500">p = {row.p}, q = {row.q}</div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5">
                      <span className="mono text-xs font-bold text-zinc-400">p + q =</span>
                      <input
                        className={cn("input mono !w-20 !px-2 !py-1.5 text-center font-bold", sumOk === true && "!border-emerald-400/60 !bg-emerald-400/10", sumOk === false && "!border-rose-400/60 !bg-rose-400/10")}
                        value={j.sum}
                        disabled={sent}
                        onChange={(e) => setPolaMap((m) => ({ ...m, [row.id]: { ...j, sum: e.target.value } }))}
                      />
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className="mono text-xs font-bold text-zinc-400">p × q =</span>
                      <input
                        className={cn("input mono !w-20 !px-2 !py-1.5 text-center font-bold", prodOk === true && "!border-emerald-400/60 !bg-emerald-400/10", prodOk === false && "!border-rose-400/60 !bg-rose-400/10")}
                        value={j.prod}
                        disabled={sent}
                        onChange={(e) => setPolaMap((m) => ({ ...m, [row.id]: { ...j, prod: e.target.value } }))}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Penemuan */}
          {(sent || polaDone) && (
            <div className="anim-pop mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/8 p-4">
              <p className="flex items-center gap-2 text-sm font-extrabold text-amber-200">
                <Sparkles className="h-4.5 w-4.5" /> Apa yang kamu temukan?
              </p>
              <p className="mono mt-2 text-sm leading-relaxed text-zinc-200">
                Untuk <Eq>x^2 + bx + c</Eq> ternyata selalu:{" "}
                <span className="font-extrabold text-amber-200"><Eq>p + q = b</Eq></span> dan{" "}
                <span className="font-extrabold text-amber-200"><Eq>p x q = c</Eq></span>.
                Inilah rahasia <span className="font-extrabold">T-Faktor</span>!
              </p>
            </div>
          )}
        </div>

        {!sent && (
          <button onClick={submit} disabled={busy || !sortDone || !polaDone} className="btn btn-primary mt-4 w-full py-4 text-base">
            {busy ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Send className="h-4.5 w-4.5" />}
            Simpan Penemuanku {(!sortDone || !polaDone) && <span className="mono text-xs opacity-70">(lengkapi semua dulu)</span>}
          </button>
        )}
      </div>
    </main>
  );
}
