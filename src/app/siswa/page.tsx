"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { useKelasState, usePing, useSiswa } from "@/hooks/use-session";
import { Hourglass, LogOut } from "lucide-react";
import { clearSiswaSession } from "@/lib/session";


export default function SiswaHub() {
  const { siswa, ready } = useSiswa();
  const router = useRouter();
  const { state } = useKelasState(siswa?.kelasKode, 1500);
  usePing(siswa?.siswaId);

  useEffect(() => {
    if (!state) return;
    const stage = state.kelas.stage;
    if (stage !== "lobby") {
      if (stage.startsWith("aktivitas-")) {
        router.push("/siswa/aktivitas");
      } else {
        router.push(`/siswa/${stage}`);
      }
    }
  }, [state, router]);

  if (!ready || !siswa) return null;

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={() => { clearSiswaSession(); router.replace("/join"); }}
            className="btn btn-ghost px-3 py-2 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="anim-fade-up chip !text-emerald-300 border-emerald-400/25 bg-emerald-400/8">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Terhubung · {state?.siswaOnline ?? 1} siswa online
          </div>

          <h1 className="anim-fade-up anim-fade-up-1 mt-5 text-4xl font-extrabold tracking-tight text-white">
            Halo, <span className="text-gradient">{siswa.nama.split(" ")[0]}!</span>
          </h1>
          <p className="anim-fade-up anim-fade-up-2 mt-2 text-sm text-zinc-400">
            Kelas <span className="font-bold text-zinc-200">{siswa.kelasNama}</span> · Kode{" "}
            <span className="mono font-bold text-indigo-300">{siswa.kelasKode}</span>
          </p>

          <div className="anim-fade-up anim-fade-up-3 glass mt-10 w-full rounded-3xl p-8">
            <Hourglass className="mx-auto h-10 w-10 animate-[spin_6s_linear_infinite] text-indigo-300" />
            <p className="mt-4 text-lg font-bold text-white">Menunggu guru memulai…</p>
            <p className="mt-1.5 text-sm text-zinc-400">
              Begitu guru membuka aktivitas, layar ini otomatis berpindah. Duduk manis dulu.
            </p>

          </div>
        </div>
      </div>
    </main>
  );
}
