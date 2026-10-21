"use client";

import useSWR from "swr";
import { fetcher } from "@/hooks/use-session";
import { stageMeta } from "@/lib/stages";
import { cn } from "@/lib/utils";
import { CircleAlert, Eye, Radio, UserCheck, UserX } from "lucide-react";

export interface MonitorSiswa {
  id: string;
  nama: string;
  online: boolean;
  currentStage: string;
  progress: {
    sapaan: boolean;
    apersepsi: number;
    cobacoba: { attempts: number; roots: number[] };
    klasifikasi: { sortBenar: number; polaBenar: number } | null;
    worksheet: number;
    kuis: { answered: number; skor: number; benar: number };
    refleksi: boolean;
  };
}

export interface MonitorData {
  siswa: MonitorSiswa[];
  totals: { apersepsi: number; worksheet: number; klasifikasiSort: number; klasifikasiPola: number };
  agg: {
    online: number;
    total: number;
    viewing: Record<string, number>;
    sapaan: number;
    refleksi: number;
    cobaCoba: { totalAttempts: number; founders: Record<string, string[]> };
    klasifikasi: { submitted: number; sortBenarTotal: number; polaBenarTotal: number };
  };
}

function inisial(nama: string) {
  return nama.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/** Ringkasan progres singkat sesuai halaman yang sedang dibuka siswa */
function progresLabel(s: MonitorSiswa): string | null {
  const p = s.progress;
  switch (s.currentStage) {
    case "lobby":
      return "di lobi";
    case "materi":
      return "menyimak slide";
    case "apersepsi":
      return `${p.apersepsi}/8 soal`;
    case "vote-rina":
      return "untung/rugi";
    case "cobax":
    case "coba-coba":
      return `${p.cobacoba.attempts}× coba`;
    case "aktivitas-think":
      return "LKPD Think";
    case "aktivitas-pair":
      return "LKPD Pair";
    case "aktivitas-share":
      return "LKPD Share";
    case "kuis":
      return `${p.kuis.answered}/5 soal · ${p.kuis.skor} pt`;
    case "refleksi":
      return p.refleksi ? "refleksi terkirim" : "sedang mengisi";
    case "doa":
      return "doa penutup";
    default:
      return null;
  }
}

export function KelasLive({ kelasId, aktifStage }: { kelasId: string; aktifStage: string }) {
  const { data } = useSWR<MonitorData>(`/api/guru/${kelasId}/monitor`, fetcher, {
    refreshInterval: 2500,
  });

  const meta = stageMeta(aktifStage);
  const siswa = data?.siswa ?? [];
  const onlineList = siswa.filter((s) => s.online);
  const diHalamanIni = onlineList.filter((s) => s.currentStage === aktifStage);
  const belumOnline = onlineList.filter((s) => s.currentStage !== aktifStage);
  const offline = siswa.filter((s) => !s.online);
  const pct = onlineList.length > 0 ? Math.round((diHalamanIni.length / onlineList.length) * 100) : 0;

  return (
    <div className="glass anim-fade-up anim-fade-up-1 rounded-3xl p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/12">
            <Radio className="h-5 w-5 text-emerald-300" />
            <span className="pulse-dot absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400" />
          </span>
          <div>
            <p className="font-extrabold text-white">KELAS LIVE</p>
            <p className="text-xs text-zinc-500">Pemantauan real-time, proyeksikan panel ini</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip !text-emerald-300 border-emerald-400/25 bg-emerald-400/8">
            <UserCheck className="h-3.5 w-3.5" /> {data?.agg.online ?? 0}/{data?.agg.total ?? 0} online
          </span>
          <span className={cn("chip", pct === 100 ? "!text-emerald-300 border-emerald-400/25 bg-emerald-400/8" : "!text-amber-300 border-amber-400/25 bg-amber-400/8")}>
            <Eye className="h-3.5 w-3.5" /> {diHalamanIni.length}/{onlineList.length} di halaman “{meta.label}”
          </span>
        </div>
      </div>

      {/* Strip kehadiran halaman aktif */}
      <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-300">
            Kesiapan stage “{meta.label}” <span className="mono text-zinc-500">({meta.fase})</span>
          </span>
          <span className="mono font-extrabold text-white tabular">{pct}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
          <div
            className={cn("bar-grow h-full rounded-full transition-all", pct === 100 ? "bg-gradient-to-r from-emerald-500 to-emerald-300" : "bg-gradient-to-r from-indigo-500 to-cyan-400")}
            style={{ width: `${pct}%` }}
          />
        </div>
        {belumOnline.length > 0 && (
          <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-amber-200/90">
            <CircleAlert className="h-3.5 w-3.5 shrink-0" />
            Belum di halaman ini:
            {belumOnline.slice(0, 8).map((s) => (
              <span key={s.id} className="rounded-md bg-amber-400/12 px-1.5 py-0.5 font-semibold">{s.nama.split(" ")[0]}</span>
            ))}
            {belumOnline.length > 8 && <span className="font-semibold">+{belumOnline.length - 8} lainnya</span>}
          </p>
        )}
        {offline.length > 0 && (
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
            <UserX className="h-3.5 w-3.5 shrink-0" />
            Offline:
            {offline.slice(0, 8).map((s) => (
              <span key={s.id} className="rounded-md bg-white/6 px-1.5 py-0.5">{s.nama.split(" ")[0]}</span>
            ))}
            {offline.length > 8 && <span>+{offline.length - 8}</span>}
          </p>
        )}
      </div>

      {/* Grid siswa */}
      <div className="mt-4 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
        {siswa.map((s) => {
          const sm = stageMeta(s.currentStage);
          const diTempat = s.online && s.currentStage === aktifStage;
          const prog = progresLabel(s);
          return (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition-all",
                !s.online && "border-white/6 bg-white/2 opacity-45",
                s.online && diTempat && "border-emerald-400/30 bg-emerald-400/7",
                s.online && !diTempat && "border-amber-400/25 bg-amber-400/5"
              )}
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/70 to-violet-600/70 text-[0.7rem] font-extrabold text-white">
                {inisial(s.nama)}
                <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-900", s.online ? "bg-emerald-400" : "bg-zinc-600")} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-zinc-100">{s.nama}</p>
                <p className={cn("flex items-center gap-1 truncate text-[0.62rem] font-semibold", diTempat ? "text-emerald-300" : s.online ? "text-amber-300/90" : "text-zinc-600")}>
                  <sm.icon className="h-3 w-3 shrink-0" />
                  {sm.label}
                  {prog && <span className="text-zinc-500">· {prog}</span>}
                </p>
              </div>
            </div>
          );
        })}
        {siswa.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-white/12 px-4 py-8 text-center text-xs text-zinc-500">
            Belum ada siswa, bagikan kode kelas agar mereka masuk.
          </p>
        )}
      </div>

      {/* Agregat per langkah */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/6 pt-4">
        {([
          { key: "apersepsi", n: siswa.filter((s) => s.progress.apersepsi >= 4).length, total: data?.agg.total ?? 0 },
          { key: "cobax", n: data?.agg.cobaCoba?.totalAttempts ? 1 : 0, total: 1 },
          { key: "aktivitas-think", n: siswa.filter((s) => s.currentStage.startsWith("aktivitas-")).length, total: data?.agg.total ?? 0 },
          { key: "kuis", n: siswa.filter((s) => s.progress.kuis.answered > 0).length, total: data?.agg.total ?? 0 },
          { key: "refleksi", n: data?.agg.refleksi ?? 0, total: data?.agg.total ?? 0 },
        ] as const).map(({ key, n, total }) => {
          const m = stageMeta(key);
          const done = total > 0 && n >= total;
          return (
            <span key={key} className={cn("chip !text-[0.67rem]", done ? "!text-emerald-300 border-emerald-400/25 bg-emerald-400/8" : "text-zinc-400")}>
              <m.icon className="h-3 w-3" />
              {m.label} <span className="mono font-extrabold tabular">{n}/{total}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
