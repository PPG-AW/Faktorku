"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setGuruNama, setSiswaSession, getGuruNama } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, Check, KeyRound, LogIn, MonitorPlay,
  TriangleAlert, UserRound,
} from "lucide-react";

type Role = "siswa" | "guru";

export function LoginPanel() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("siswa");
  const [step, setStep] = useState<1 | 2>(1);
  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [guru, setGuru] = useState(() => getGuruNama());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function gantiRole(r: Role) {
    setRole(r);
    setStep(1);
    setError(null);
  }

  function lanjutSiswa(e: React.FormEvent) {
    e.preventDefault();
    if (nama.trim().length < 2) {
      setError("Tulis nama kamu dulu ya (minimal 2 huruf).");
      return;
    }
    setError(null);
    setStep(2);
  }

  async function masukKelas(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (kode.trim().length < 4) {
      setError("Kode kelas terdiri dari 5 karakter — minta pada gurumu.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/kelas/${kode.trim().toUpperCase()}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: nama.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Tidak dapat masuk ke kelas.");
        setLoading(false);
        return;
      }
      setSiswaSession({
        siswaId: data.siswa.id,
        nama: data.siswa.nama,
        kelasId: data.kelas.id,
        kelasKode: data.kelas.kode,
        kelasNama: data.kelas.nama,
      });
      router.push("/siswa");
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
      setLoading(false);
    }
  }

  function masukGuru(e: React.FormEvent) {
    e.preventDefault();
    if (guru.trim().length < 2) {
      setError("Tulis nama Anda dulu (minimal 2 huruf).");
      return;
    }
    setGuruNama(guru.trim());
    router.push("/guru");
  }

  return (
    <div className="border-gradient p-6 md:p-7">
      <p className="mono text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--red)]">
        Masuk ke Kelas
      </p>
      <h2 className="mt-2 text-2xl leading-tight md:text-3xl">Halaman Login</h2>

      {/* ---------- PEMILIH PERAN: KIRI & KANAN ---------- */}
      <div
        className="mt-5 grid grid-cols-2 gap-px bg-[var(--hairline-strong)]"
        style={{ border: "1px solid var(--hairline-strong)" }}
      >
        {([
          { key: "siswa" as const, icon: KeyRound, label: "Siswa", desc: "Ikut pembelajaran" },
          { key: "guru" as const, icon: MonitorPlay, label: "Guru", desc: "Pandu presentasi" },
        ]).map((r) => {
          const aktif = role === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => gantiRole(r.key)}
              className={cn(
                "flex flex-col items-center gap-1.5 px-3 py-4 transition-colors",
                aktif ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--paper-2)]"
              )}
            >
              <r.icon className={cn("h-5 w-5", aktif ? "text-[var(--paper)]" : "text-[var(--red)]")} />
              <span className="text-sm font-extrabold">{r.label}</span>
              <span className={cn("text-[0.65rem]", aktif ? "text-[var(--paper)]/70" : "text-[var(--ink-3)]")}>
                {r.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---------- FORM SISWA ---------- */}
      {role === "siswa" && (
        <div className="mt-5">
          {/* Indikator langkah */}
          <div className="mb-4 flex items-center gap-2">
            {[1, 2].map((n) => (
              <div key={n} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "mono flex h-6 w-6 shrink-0 items-center justify-center text-[0.65rem] font-bold",
                    step >= n ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper-2)] text-[var(--ink-3)]"
                  )}
                >
                  {step > n ? <Check className="h-3.5 w-3.5" /> : n}
                </span>
                <span className={cn("text-[0.68rem] font-bold uppercase tracking-wider", step >= n ? "text-[var(--ink)]" : "text-[var(--ink-3)]")}>
                  {n === 1 ? "Username" : "Kode kelas"}
                </span>
                {n === 1 && <span className="h-px flex-1 bg-[var(--hairline)]" />}
              </div>
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={lanjutSiswa} className="anim-rise">
              <label className="label" htmlFor="username">Username / nama lengkap</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-3)]" />
                <input
                  id="username"
                  className="input !pl-10"
                  placeholder="mis. Andi Pratama"
                  value={nama}
                  maxLength={40}
                  autoComplete="username"
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>
              <p className="mt-2 text-[0.7rem] text-[var(--ink-3)]">
                Tanpa kata sandi. Kode kelas diminta pada langkah berikutnya.
              </p>
              {error && <PesanError teks={error} />}
              <button type="submit" className="btn btn-primary mt-4 w-full py-3 text-sm">
                Lanjut ke Kode Kelas <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={masukKelas} className="anim-rise">
              <div className="mb-3 flex items-center gap-2.5 border border-[var(--hairline)] bg-[var(--paper-2)] px-3.5 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center bg-[var(--ink)] text-[var(--paper)]">
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.62rem] uppercase tracking-wider text-[var(--ink-3)]">Masuk sebagai</span>
                  <span className="block truncate text-sm font-extrabold text-[var(--ink)]">{nama}</span>
                </span>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); }}
                  className="btn btn-ghost px-2.5 py-1.5 text-[0.68rem]"
                >
                  <ArrowLeft className="h-3 w-3" /> Ubah
                </button>
              </div>

              <label className="label" htmlFor="kodekelas">Kode kelas dari guru</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-3)]" />
                <input
                  id="kodekelas"
                  className="input mono !pl-10 text-lg font-bold uppercase tracking-[0.3em]"
                  placeholder="RINA5"
                  value={kode}
                  maxLength={6}
                  autoComplete="off"
                  autoFocus
                  onChange={(e) => setKode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                />
              </div>
              <p className="mt-2 text-[0.7rem] text-[var(--ink-3)]">
                Kode ditampilkan guru di layar depan kelas.
              </p>
              {error && <PesanError teks={error} />}
              <button type="submit" disabled={loading} className="btn btn-primary mt-4 w-full py-3 text-sm">
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--paper)]/40 border-t-[var(--paper)]" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {loading ? "Memeriksa kode…" : "Masuk Kelas"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ---------- FORM GURU ---------- */}
      {role === "guru" && (
        <form onSubmit={masukGuru} className="anim-rise mt-5">
          <label className="label" htmlFor="guru">Username / nama guru</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-3)]" />
            <input
              id="guru"
              className="input !pl-10"
              placeholder="mis. Bu Sari Wulandari"
              value={guru}
              maxLength={40}
              autoComplete="username"
              onChange={(e) => setGuru(e.target.value)}
            />
          </div>
          <p className="mt-2 text-[0.7rem] text-[var(--ink-3)]">
            Setelah masuk, Anda dapat memilih kelas yang tersimpan atau membuat kelas
            baru — kode kelas dibuat otomatis untuk dibagikan ke siswa.
          </p>
          {error && <PesanError teks={error} />}
          <button type="submit" className="btn btn-primary mt-4 w-full py-3 text-sm">
            <MonitorPlay className="h-4 w-4" /> Masuk Dasbor Guru
          </button>
        </form>
      )}
    </div>
  );
}

function PesanError({ teks }: { teks: string }) {
  return (
    <div className="anim-rise mt-3 flex items-start gap-2 border border-[var(--red)]/40 bg-[var(--red)]/8 px-3 py-2.5 text-xs text-[var(--red-dark)]">
      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {teks}
    </div>
  );
}
