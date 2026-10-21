"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Eq, EqText } from "@/components/equation";
import { fetcher } from "@/hooks/use-session";
import type { MonitorData } from "@/components/kelas-live";
import { cn } from "@/lib/utils";
import {
  Check, ChevronLeft, ChevronRight, CircleDot, Eye, Users, Vote, Wifi, X,
} from "lucide-react";

export interface PanelProps {
  kelasId: string;
  kode: string;
  kelasNama: string;
  guruNama: string;
  monitor: MonitorData | null;
}

function inisial(n: string) {
  return n.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/* ======================= 1. PRESENSI (slide cover) ======================= */

export function DeckPresensi({ kode, monitor }: PanelProps) {
  const siswa = monitor?.siswa ?? [];
  const online = siswa.filter((s) => s.online);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="border-gradient p-6 text-center">
        <p className="label !mb-1">Gabung di HP kalian</p>
        <p className="mono text-6xl font-extrabold tracking-[0.18em] text-[var(--red)]">{kode}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="chip !text-emerald-700 border-emerald-600/30">
            <Users className="h-4 w-4" />
            <span className="mono font-extrabold tabular">{online.length}</span> online
          </span>
          <span className="chip"><CircleDot className="h-3.5 w-3.5" /> {siswa.length} terdaftar</span>
        </div>
      </div>

      <div className="glass p-5">
        <p className="label flex items-center gap-2"><Wifi className="h-3.5 w-3.5" /> Daftar hadir, otomatis saat siswa login</p>
        <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto">
          {siswa.map((s) => (
            <span key={s.id} className={cn(
              "flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-bold",
              s.online ? "border-emerald-600/40 bg-emerald-50 text-emerald-800" : "border-[var(--hairline)] bg-[var(--paper-2)] text-[var(--ink-3)]"
            )}>
              <span className="grid h-5 w-5 place-items-center bg-[var(--ink)] text-[0.55rem] text-[var(--paper)]">{inisial(s.nama)}</span>
              {s.nama}
            </span>
          ))}
          {siswa.length === 0 && (
            <p className="w-full py-8 text-center text-xs text-[var(--ink-3)]">
              Menunggu siswa bergabung, nama muncul otomatis di sini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ 2. APERSEPSI, satu soal per layar, jawaban disembunyikan === */

interface SoalHasil {
  soalId: string; nomor: number; pertanyaan: string; tipe: string;
  opsi: { A: string; B: string; C: string; D: string } | null;
  kunci: string; terjawab: number; benar: number; opsiCount: Record<string, number>;
}

export function DeckApersepsi({ kelasId }: PanelProps) {
  const { data } = useSWR<{ soal: SoalHasil[]; totalSiswa: number; siswaMenjawab: number }>(
    `/api/apersepsi/hasil/${kelasId}`, fetcher, { refreshInterval: 1800 }
  );
  const soal = (data?.soal ?? []).filter((s) => s.tipe !== "terbuka");
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState(false);

  useEffect(() => { setReveal(false); }, [idx]);

  useEffect(() => {
    if (!s) return;
    fetch("/api/guru/kontrol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kelasId, action: "setApersepsiSoal", value: s.nomor }),
    }).catch(() => {});
  }, [s?.nomor, kelasId]);

  const s = soal[idx];
  const total = soal.length;
  const maxCount = s ? Math.max(1, ...Object.values(s.opsiCount)) : 1;

  if (!s) {
    return <p className="py-16 text-center text-sm text-[var(--ink-3)]">Memuat soal apersepsi…</p>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* progres soal */}
      <div className="mb-4 flex items-center justify-between">
        <span className="chip uppercase tracking-[0.2em] !text-[0.62rem]">
          Soal {idx + 1} dari {total}
        </span>
        <div className="flex gap-1">
          {soal.map((_, i) => (
            <span key={i} className={cn("h-1.5 w-8 transition-colors", i === idx ? "bg-[var(--red)]" : i < idx ? "bg-emerald-600/50" : "bg-[var(--hairline-strong)]")} />
          ))}
        </div>
        <span className="mono text-sm font-bold tabular text-[var(--ink-3)]">
          {s.terjawab}/{data?.totalSiswa ?? 0} menjawab
        </span>
      </div>

      {/* pertanyaan: pengantar + rumus */}
      <div key={s.soalId} className="anim-slide border-2 border-[var(--ink)] bg-[var(--card)] p-7 shadow-[5px_5px_0_var(--ink)]">
        {(() => {
          const [pengantar, rumus] = s.pertanyaan.split("||");
          return (
            <>
              <p className="mx-auto max-w-3xl text-center text-xl leading-relaxed text-[var(--ink-2)] md:text-2xl">
                <EqText>{pengantar.trim()}</EqText>
              </p>
              {rumus && (
                <p className="mono eq-badge mx-auto mt-4 block w-fit max-w-full px-6 py-3 text-center text-[clamp(1.3rem,3.4vw,2.3rem)] font-extrabold">
                  <Eq>{rumus.trim()}</Eq>
                </p>
              )}
            </>
          );
        })()}

        {/* opsi + bar jawaban siswa */}
        <div className="mt-6 space-y-2.5">
          {(Object.entries(s.opsi ?? {}) as [string, string][]).map(([key, val], i) => {
            const n = s.opsiCount[key] ?? 0;
            const benar = reveal && key === s.kunci;
            const salah = reveal && key !== s.kunci;
            return (
              <div
                key={key}
                className={cn(
                  "anim-rise flex items-center gap-3 border-2 px-3 py-2.5 transition-all",
                  benar && "border-emerald-700 bg-emerald-50",
                  salah && "border-[var(--hairline)] opacity-50",
                  !reveal && "border-[var(--hairline-strong)] bg-[var(--card)]"
                )}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <span className={cn(
                  "mono grid h-9 w-9 shrink-0 place-items-center border-2 border-[var(--ink)] text-base font-extrabold",
                  benar ? "bg-emerald-700 text-white" : "bg-[var(--paper-2)]"
                )}>
                  {reveal ? (benar ? <Check className="h-5 w-5" /> : <X className="h-4 w-4" />) : key}
                </span>
                <span className="mono min-w-0 flex-1 overflow-x-auto text-lg font-semibold"><Eq>{val}</Eq></span>
                {reveal && (
                  <div className="h-7 w-32 shrink-0 overflow-hidden border border-[var(--hairline)] bg-[var(--paper-2)] sm:w-40">
                    <div
                      className="bar-grow flex h-full items-center px-2"
                      style={{
                        width: `${Math.max(n === 0 ? 0 : 12, (n / maxCount) * 100)}%`,
                        background: benar ? "linear-gradient(90deg,#15803d,#34d399)" : "linear-gradient(90deg,#141414,#4b4b4b)",
                      }}
                    >
                      <span className="mono text-xs font-bold tabular text-white">{n}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {reveal && (
          <p className="anim-pop mt-5 text-center text-base font-extrabold text-emerald-700">
            Jawaban benar: {s.kunci} · {s.benar} dari {s.terjawab} siswa menjawab tepat
          </p>
        )}
      </div>

      {/* kontrol guru */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} className="btn btn-ghost px-4 py-2.5 text-sm">
          <ChevronLeft className="h-4 w-4" /> Soal sebelumnya
        </button>
        {!reveal ? (
          <button onClick={() => setReveal(true)} className="btn btn-amber px-6 py-2.5 text-sm">
            <Eye className="h-4 w-4" /> Tampilkan Jawaban
          </button>
        ) : (
          <span className="chip !text-emerald-700 border-emerald-600/30"><Check className="h-3.5 w-3.5" /> Jawaban dibuka</span>
        )}
        <button onClick={() => setIdx((i) => Math.min(total - 1, i + 1))} disabled={idx >= total - 1} className="btn btn-primary px-4 py-2.5 text-sm">
          Soal berikutnya <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============ 3. VOTING, bisa tidak menentukan untung/rugi? ============== */

const OPSI_VOTE = [
  { key: "untung", label: "Rina untung" },
  { key: "rugi", label: "Rina rugi" },
  { key: "impas", label: "Pas, tidak untung tidak rugi" },
];

export function DeckVoteRina({ kelasId }: PanelProps) {
  const { data } = useSWR<{ total: number; terisi: number; hitung: Record<string, number> }>(
    `/api/voting?kelasId=${kelasId}&topik=untung-rugi`, fetcher, { refreshInterval: 1800 }
  );
  const [reveal, setReveal] = useState(false);
  const hitung = data?.hitung ?? {};
  const maxN = Math.max(1, ...OPSI_VOTE.map((o) => hitung[o.key] ?? 0));

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="text-center">
        <span className="chip uppercase tracking-[0.22em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8 !text-[0.62rem]">
          <Vote className="h-3.5 w-3.5" /> Jawab di HP kalian
        </span>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl leading-tight md:text-4xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          Pada pesanan 30 kaos ini, apakah Rina
          <br />
          <em className="ff-italic text-[var(--red)]">untung atau rugi</em>?
        </h2>
        <p className="mono mt-2 text-sm tabular text-[var(--ink-3)]">
          {data?.terisi ?? 0}/{data?.total ?? 0} siswa sudah memilih
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {OPSI_VOTE.map((o, i) => {
          const n = hitung[o.key] ?? 0;
          const jawabanBenar = reveal && o.key === "rugi";
          return (
            <div
              key={o.key}
              className={cn(
                "anim-rise flex items-center gap-4 border-2 px-4 py-3.5",
                jawabanBenar ? "border-emerald-700 bg-emerald-50" : reveal ? "border-[var(--hairline)] opacity-55" : "border-[var(--hairline-strong)] bg-[var(--card)]"
              )}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="min-w-0 flex-1 text-lg font-bold leading-snug">{o.label}</span>
              {reveal && (
                <div className="h-9 w-40 shrink-0 overflow-hidden border border-[var(--hairline)] bg-[var(--paper-2)] sm:w-56">
                  <div
                    className="bar-grow flex h-full items-center px-2.5"
                    style={{
                      width: `${Math.max(n === 0 ? 0 : 10, (n / maxN) * 100)}%`,
                      background: jawabanBenar ? "linear-gradient(90deg,#15803d,#34d399)" : "linear-gradient(90deg,#141414,#4b4b4b)",
                    }}
                  >
                    <span className="mono text-sm font-bold tabular text-white">{n}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-center">
        {!reveal ? (
          <button onClick={() => setReveal(true)} className="btn btn-amber px-7 py-3 text-base">
            <Eye className="h-4.5 w-4.5" /> Bahas Jawaban Bersama
          </button>
        ) : (
          <div className="anim-pop w-full border-2 border-emerald-700 bg-emerald-50 p-5 text-center">
            <p className="text-lg font-extrabold text-emerald-800">Ternyata Rina rugi pada minggu ini.</p>
            <div className="mx-auto mt-3 max-w-2xl space-y-2 text-base leading-relaxed text-[var(--ink-2)]">
              <p>Uang masuk Rina adalah <b>1,5 juta rupiah</b>.</p>
              <p>
                Sedangkan total biayanya:{" "}
                <span className="mono eq-badge inline-block whitespace-nowrap px-2 py-0.5 font-bold">
                  900 + 900 + 75 = 1.875
                </span>{" "}
                ribu rupiah, atau <b>1,875 juta rupiah</b>.
              </p>
              <p>
                Biaya lebih besar daripada pemasukan, jadi Rina rugi 375 ribu. Supaya tahu
                batas amannya, kita harus mencari lebih dulu jumlah kaos yang membuat uang
                masuk sama dengan uang keluar, yaitu <b className="text-[var(--red)]">titik impas</b>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
