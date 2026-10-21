"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ambient } from "@/components/ambient";
import { Eq } from "@/components/equation";
import { Logo } from "@/components/topbar";
import { clearSiswaSession } from "@/lib/session";
import { useKelasState, usePing, useSiswa } from "@/hooks/use-session";
import { Check, LogOut, MoonStar } from "lucide-react";

export default function SiswaDoaPage() {
  const { siswa, ready } = useSiswa();
  const router = useRouter();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 2000);
  const [out, setOut] = useState(false);
  const [countdown, setCountdown] = useState(4);

  // Saat guru memindahkan stage dari "doa" = sesi berakhir → logout
  useEffect(() => {
    if (state && state.kelas.stage !== "doa" && !out) {
      handleKeluar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.kelas.stage]);

  useEffect(() => {
    if (!out) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 800);
    return () => clearInterval(t);
  }, [out]);

  useEffect(() => {
    if (out && countdown <= 0) {
      clearSiswaSession();
      router.replace("/");
    }
  }, [out, countdown, router]);

  function handleKeluar() {
    if (out) return;
    setOut(true);
  }

  if (!ready || !siswa) return null;

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="chip">{siswa.nama}</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="chip uppercase tracking-[0.24em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8">
            <MoonStar className="h-3.5 w-3.5" /> Penutup
          </span>

          <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            Sampai jumpa
            <br />
            <em className="ff-italic text-[var(--red)]">pekan depan.</em>
          </h1>

          <div className="glass mt-8 w-full p-6" style={{ borderRadius: 3 }}>
            <p className="font-serif text-lg italic leading-relaxed text-[var(--ink-2)]">
              Pembelajaran hari ini telah selesai. Semoga ilmu yang kita pelajari
              menjadi bekal yang bermanfaat bagi diri sendiri maupun orang lain.
            </p>
            <p className="mt-3 text-base font-bold text-[var(--ink-2)]">Mari kita tutup dengan berdoa menurut keyakinan masing-masing.</p>
          </div>

          <div className="mono mt-6 space-y-1.5 text-sm text-[var(--ink-2)]">
            <p><Eq>PR · x^2 + 11x + 24 = 0</Eq></p>
            <p><Eq>PR · x^2 - 13x + 36 = 0</Eq></p>
            <p className="text-[var(--red)]"><Eq>Tantangan · x^2 + 3x + 1 = 0</Eq></p>
          </div>

          {!out ? (
            <button onClick={handleKeluar} className="btn btn-primary mt-8 px-10 py-4 text-base">
              <LogOut className="h-5 w-5" /> Keluar dari Kelas
            </button>
          ) : (
            <p className="anim-pop mt-8 flex items-center gap-2 text-base font-extrabold text-emerald-700">
              <Check className="h-5 w-5" /> Keluar otomatis dalam {Math.max(1, countdown)} detik…
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
