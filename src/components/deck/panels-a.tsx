"use client";

import useSWR from "swr";
import { Eq } from "@/components/equation";
import { SlideViewer } from "@/components/slide-viewer";
import { fetcher } from "@/hooks/use-session";
import type { MonitorData } from "@/components/kelas-live";
import type { SlideKonten } from "@/db/schema";
import { KASUS, KASUS_PERSAMAAN } from "@/lib/kasus";
import { MOODS, moodByKey } from "@/lib/moods";
import { cn } from "@/lib/utils";
import {
  ArrowRight, BookOpenText, ChevronLeft, ChevronRight, CircleDot, Hand,
  Lock, LockOpen, Radical, Users, Wifi, WifiOff,
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

/* ============================== 1. COVER ================================= */

export function DeckCover({ kode, kelasNama, guruNama, monitor }: PanelProps) {
  const siswa = monitor?.siswa ?? [];
  const online = siswa.filter((s) => s.online);

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* Judul materi */}
        <div>
          <span className="anim-fade-up chip !text-indigo-300 border-indigo-400/30 bg-indigo-400/10 uppercase tracking-[0.22em] !text-[0.65rem]">
            <Radical className="h-3.5 w-3.5" /> Matematika · Kelas X · Pertemuan 1
          </span>
          <h1 className="anim-fade-up anim-fade-up-1 mt-5 text-5xl font-extrabold leading-[0.95] tracking-tight xl:text-7xl">
            <span className="text-white">Memfaktorkan</span>
            <br />
            <span className="text-gradient text-glow">Persamaan Kuadrat</span>
          </h1>
          <p className="anim-fade-up anim-fade-up-2 mt-5 max-w-xl text-base text-zinc-400 xl:text-lg">
            Menemukan sendiri <span className="font-bold text-zinc-200">T-Faktor</span> (a = 1) dan{" "}
            <span className="font-bold text-zinc-200">Metode AC</span> (a &gt; 1) lewat kisah usaha
            keripik pisang Rina.
          </p>

          <div className="anim-fade-up anim-fade-up-3 mono eq-badge mt-7 w-fit px-6 py-4 text-2xl font-bold text-indigo-100 xl:text-4xl">
            <Eq>ax^2 + bx + c = 0</Eq>
          </div>

          <div className="anim-fade-up anim-fade-up-4 mt-7 flex flex-wrap items-center gap-3 text-sm">
            <span className="chip !text-sm">{kelasNama}</span>
            <span className="chip !text-sm">Guru: {guruNama}</span>
            <span className="chip !text-sm !text-emerald-300 border-emerald-400/25 bg-emerald-400/8">
              Mindful · Meaningful · Joyful
            </span>
          </div>
        </div>

        {/* Kartu join + presensi */}
        <div className="anim-fade-up anim-fade-up-2 space-y-4">
          <div className="border-gradient rounded-3xl p-7 text-center">
            <p className="label !mb-1">Gabung sekarang di HP kalian</p>
            <p className="text-sm text-zinc-400">Buka situs lalu masukkan kode:</p>
            <p className="mono text-glow mt-3 text-6xl font-extrabold tracking-[0.2em] text-white xl:text-7xl">
              {kode}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="chip !text-emerald-300 border-emerald-400/25 bg-emerald-400/8 !text-sm">
                <Users className="h-4 w-4" />
                <span className="mono font-extrabold tabular">{online.length}</span> online
              </span>
              <span className="chip !text-sm">
                <CircleDot className="h-3.5 w-3.5" /> {siswa.length} terdaftar
              </span>
            </div>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="label flex items-center gap-2">
              <Wifi className="h-3.5 w-3.5" /> Siswa yang sudah masuk
            </p>
            <div className="flex max-h-52 flex-wrap gap-1.5 overflow-y-auto">
              {siswa.map((s) => (
                <span
                  key={s.id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-colors",
                    s.online
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : "border-white/8 bg-white/3 text-zinc-600"
                  )}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-[0.55rem]">
                    {inisial(s.nama)}
                  </span>
                  {s.nama.split(" ")[0]}
                </span>
              ))}
              {siswa.length === 0 && (
                <p className="w-full py-6 text-center text-xs text-zinc-500">
                  Menunggu siswa bergabung… nama mereka muncul otomatis di sini.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== 2. SAPAAN ================================ */

interface SapaanRekap {
  totalSiswa: number;
  terisi: number;
  moodCount: Record<string, number>;
  messages: { nama: string; mood: string; pesan: string; waktu: string }[];
}

export function DeckSapaan({ kelasId }: PanelProps) {
  const { data } = useSWR<SapaanRekap>(`/api/sapaan/rekap/${kelasId}`, fetcher, { refreshInterval: 2000 });
  const maxMood = Math.max(1, ...MOODS.map((m) => data?.moodCount[m.key] ?? 0));

  return (
    <div className="flex h-full flex-col">
      <div className="text-center">
        <span className="chip !text-amber-300 border-amber-400/30 bg-amber-400/10 uppercase tracking-[0.2em] !text-[0.65rem]">
          <Hand className="h-3.5 w-3.5" /> Pendahuluan
        </span>
        <h1 className="anim-fade-up mt-4 text-4xl font-extrabold tracking-tight text-white xl:text-6xl">
          Bagaimana <span className="text-gradient">kabar kalian</span> hari ini?
        </h1>
        <p className="anim-fade-up anim-fade-up-1 mt-3 text-sm text-zinc-400 xl:text-base">
          Pilih di HP kalian masing-masing — hasilnya muncul langsung di layar ini.
          <span className="mono ml-2 font-bold text-emerald-300 tabular">
            {data?.terisi ?? 0}/{data?.totalSiswa ?? 0} merespons
          </span>
        </p>
      </div>

      <div className="mt-7 grid flex-1 gap-4 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Bar mood besar */}
        <div className="glass rounded-3xl p-6">
          <div className="space-y-4">
            {MOODS.map((m) => {
              const n = data?.moodCount[m.key] ?? 0;
              const terisi = Math.max(data?.terisi ?? 0, 1);
              const pct = Math.round((n / terisi) * 100);
              return (
                <div key={m.key} className="flex items-center gap-4">
                  <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border", m.bg, m.border)}>
                    <m.icon className={cn("h-6 w-6", m.color)} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold text-zinc-200 xl:text-base">{m.label}</span>
                      <span className="mono text-sm font-extrabold text-white tabular">
                        {n} <span className="text-zinc-500">· {pct}%</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/8">
                      <div
                        className={cn("bar-grow h-full rounded-full bg-gradient-to-r transition-all duration-500", m.bar)}
                        style={{ width: `${(n / maxMood) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pesan masuk */}
        <div className="glass rounded-3xl p-6">
          <p className="label">Cerita yang masuk · live</p>
          <div className="grid max-h-[46vh] content-start gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {(data?.messages ?? []).map((msg, i) => {
              const m = moodByKey(msg.mood);
              return (
                <div
                  key={`${msg.nama}-${msg.waktu}`}
                  className={cn("anim-rise rounded-2xl border bg-white/3 p-3.5", i === 0 ? cn(m.border, m.bg) : "border-white/8")}
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
                >
                  <div className="flex items-center gap-2">
                    <m.icon className={cn("h-4 w-4 shrink-0", m.color)} />
                    <p className="truncate text-xs font-bold text-white">{msg.nama}</p>
                  </div>
                  {msg.pesan && <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">“{msg.pesan}”</p>}
                </div>
              );
            })}
            {(data?.messages ?? []).length === 0 && (
              <p className="col-span-2 py-10 text-center text-sm text-zinc-500">
                Menunggu kabar pertama dari siswa…
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================= 3. APERSEPSI ============================== */

interface PerSoalPG {
  soalId: string; nomor: number; pertanyaan: string; tipe: string;
  opsi: { A: string; B: string; C: string; D: string } | null;
  kunci: string; terjawab: number; benar: number; opsiCount: Record<string, number>;
}
interface PerSoalTerbuka { soalId: string; nomor: number; tipe: string; terjawab: number; texts: string[] }

export function DeckApersepsi({ kelasId }: PanelProps) {
  const { data } = useSWR<{ soal: (PerSoalPG | PerSoalTerbuka)[]; totalSiswa: number; siswaMenjawab: number }>(
    `/api/apersepsi/hasil/${kelasId}`, fetcher, { refreshInterval: 2500 }
  );
  const pg = (data?.soal ?? []).filter((s) => s.tipe !== "terbuka") as PerSoalPG[];

  return (
    <div className="grid h-full gap-5 lg:grid-cols-[1.08fr_0.92fr]">
      {/* BACAAN KASUS */}
      <div className="glass overflow-y-auto rounded-3xl p-6 xl:p-8">
        <span className="chip !text-rose-300 border-rose-400/30 bg-rose-400/10 uppercase tracking-[0.2em] !text-[0.6rem]">
          <BookOpenText className="h-3.5 w-3.5" /> Bacaan Kasus
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white xl:text-4xl">{KASUS.judul}</h1>
        <p className="mt-1.5 text-xs italic text-zinc-500">{KASUS.pembuka}</p>

        <div className="mt-4 space-y-3">
          {KASUS.paragraf.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-zinc-300 xl:text-[0.95rem]">
              <span className="mono mr-2 text-xs font-bold text-indigo-400">{i + 1}</span>
              <Eq>{p}</Eq>
            </p>
          ))}
        </div>

        {/* Tabel rincian */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-xs xl:text-sm">
            <thead>
              <tr className="bg-indigo-500/15 text-indigo-200">
                <th className="px-3 py-2 text-left font-bold">Komponen</th>
                <th className="px-3 py-2 text-left font-bold">Rincian</th>
                <th className="px-3 py-2 text-right font-bold">Rumus</th>
              </tr>
            </thead>
            <tbody>
              {KASUS.tabel.map((r) => (
                <tr key={r.komponen} className="border-t border-white/6">
                  <td className="px-3 py-2 font-semibold text-zinc-200">
                    <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", r.nada === "masuk" ? "bg-emerald-400" : "bg-rose-400")} />
                    {r.komponen}
                  </td>
                  <td className="px-3 py-2 text-zinc-400">{r.rincian}</td>
                  <td className="mono px-3 py-2 text-right font-bold text-indigo-200"><Eq>{r.rumus}</Eq></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Menuju persamaan */}
        <div className="mt-4 rounded-2xl border border-violet-400/25 bg-violet-400/8 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-300">Pertanyaan Besar Rina</p>
          <div className="mono mt-2 space-y-1 text-sm text-zinc-200">
            {KASUS_PERSAMAAN.langkah.map((l, i) => (
              <p key={i} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="h-3 w-3 text-zinc-600" />}
                <Eq>{l}</Eq>
              </p>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="label !mb-2">Pertanyaan pemantik</p>
          <ul className="space-y-1.5">
            {KASUS.pertanyaanPemantik.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                {q}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs italic text-zinc-500">{KASUS.catatan}</p>
        </div>
      </div>

      {/* HASIL LIVE */}
      <div className="glass overflow-y-auto rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <p className="label !mb-0">Jawaban siswa · real-time</p>
          <span className="chip !text-rose-300 border-rose-400/25 bg-rose-400/8">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-rose-400" />
            {data?.siswaMenjawab ?? 0}/{data?.totalSiswa ?? 0}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {pg.map((s) => {
            const max = Math.max(1, ...Object.values(s.opsiCount).map((v) => v ?? 0));
            return (
              <div key={s.soalId} className="rounded-2xl border border-white/8 bg-white/3 p-3.5">
                <p className="text-xs font-bold text-zinc-200 xl:text-sm">
                  <span className="mono mr-1.5 text-indigo-300">#{s.nomor}</span>
                  <Eq>{s.pertanyaan}</Eq>
                </p>
                <div className="mt-2 space-y-1">
                  {(Object.entries(s.opsi ?? {}) as [string, string][]).map(([key, val]) => {
                    const n = s.opsiCount[key] ?? 0;
                    const isKey = key === s.kunci;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className={cn("mono flex h-5 w-5 shrink-0 items-center justify-center rounded text-[0.6rem] font-extrabold", isKey ? "bg-emerald-400/25 text-emerald-300" : "bg-white/8 text-zinc-500")}>
                          {key}
                        </span>
                        <div className="h-5 flex-1 overflow-hidden rounded bg-white/5">
                          <div
                            className={cn("bar-grow flex h-full items-center rounded px-1.5", isKey ? "bg-gradient-to-r from-emerald-500/70 to-emerald-400/35" : "bg-gradient-to-r from-indigo-500/45 to-indigo-400/20")}
                            style={{ width: `${Math.max(n === 0 ? 0 : 10, (n / max) * 100)}%` }}
                          >
                            <span className="mono text-[0.6rem] font-bold text-white tabular">{n}</span>
                          </div>
                        </div>
                        <span className="mono w-24 truncate text-right text-[0.65rem] text-zinc-500"><Eq>{val}</Eq></span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {pg.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Memuat hasil…</p>}
        </div>
      </div>
    </div>
  );
}

/* ===================== 4. SLIDE INFO (tujuan/presentasi/penutup) ========= */

export function DeckInfo({ konten }: { konten: SlideKonten }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col justify-center">
      <SlideViewer konten={konten} nomor={1} total={1} />
    </div>
  );
}

/* ============================== 5. MATERI ================================ */

interface SlideRow { nomor: number; judul: string; konten: SlideKonten }

export function DeckMateri({
  monitor,
  slideAktif,
  locked,
  onNav,
  onLock,
}: PanelProps & {
  slideAktif: number;
  locked: boolean;
  onNav: (action: "slideNext" | "slidePrev" | "slideSet", value?: number) => void;
  onLock: (v: boolean) => void;
}) {
  const { data } = useSWR<{ slide: SlideRow[] }>("/api/slide", fetcher);
  const slides = data?.slide ?? [];
  const current = slides.find((s) => s.nomor === slideAktif);
  const ikut = (monitor?.siswa ?? []).filter((s) => s.online && s.currentStage === "slide").length;
  const online = (monitor?.siswa ?? []).filter((s) => s.online).length;

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[1fr_260px]">
      {/* Panggung slide */}
      <div className="glass relative flex flex-col overflow-hidden rounded-3xl p-6 xl:p-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
        <div className="flex flex-1 items-center">
          {current ? (
            <SlideViewer konten={current.konten} nomor={current.nomor} total={slides.length} />
          ) : (
            <p className="mx-auto text-zinc-500">Memuat slide…</p>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-4">
          <button onClick={() => onNav("slidePrev")} disabled={slideAktif <= 1} className="btn btn-ghost px-5 py-2.5">
            <ChevronLeft className="h-4.5 w-4.5" /> Slide Sebelumnya
          </button>
          <div className="flex items-center gap-1">
            {slides.map((s) => (
              <button
                key={s.nomor}
                onClick={() => onNav("slideSet", s.nomor)}
                className={cn("h-1.5 rounded-full transition-all", s.nomor === slideAktif ? "w-7 bg-indigo-400" : "w-1.5 bg-white/15 hover:bg-white/30")}
              />
            ))}
          </div>
          <button onClick={() => onNav("slideNext")} disabled={slideAktif >= slides.length} className="btn btn-primary px-5 py-2.5">
            Slide Berikutnya <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Panel kanan */}
      <div className="space-y-3 overflow-y-auto">
        <div className="glass rounded-2xl p-4 text-center">
          <p className="mono text-3xl font-extrabold text-white tabular">
            {slideAktif}<span className="text-zinc-600">/{slides.length}</span>
          </p>
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">Slide aktif</p>
          <button onClick={() => onLock(!locked)} className={cn("btn mt-3 w-full py-2.5 text-xs", locked ? "btn-amber" : "btn-ghost")}>
            {locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
            {locked ? "Siswa terkunci" : "Siswa bebas"}
          </button>
          <p className={cn("mt-2 flex items-center justify-center gap-1.5 text-[0.65rem] font-bold", ikut === online ? "text-emerald-300" : "text-amber-300")}>
            {ikut === online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {ikut}/{online} siswa menyimak
          </p>
        </div>

        <div className="glass rounded-2xl p-3">
          <p className="label !mb-1.5">Daftar slide</p>
          <div className="space-y-0.5">
            {slides.map((s) => (
              <button
                key={s.nomor}
                onClick={() => onNav("slideSet", s.nomor)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                  s.nomor === slideAktif ? "bg-indigo-500/20 text-white" : s.nomor < slideAktif ? "text-emerald-300/70 hover:bg-white/5" : "text-zinc-500 hover:bg-white/5"
                )}
              >
                <span className="mono w-5 shrink-0 tabular">{s.nomor}</span>
                <span className="truncate font-semibold">{s.judul}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
