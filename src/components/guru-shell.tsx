"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { useGuruKode, useKelasState } from "@/hooks/use-session";
import { ArrowLeft, Users } from "lucide-react";

export function GuruShell({
  title,
  icon,
  headerRight,
  children,
  maxW = "max-w-6xl",
}: {
  title: string;
  icon: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  maxW?: string;
}) {
  const { kode, ready } = useGuruKode();
  const { state } = useKelasState(kode, 3000);
  const router = useRouter();

  if (!ready) return null;
  if (!state) {
    return (
      <main className="relative min-h-screen">
        <Ambient />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-zinc-400">Menghubungkan ke kelas…</p>
          <button onClick={() => router.push("/guru")} className="btn btn-ghost px-5 py-2.5">
            <ArrowLeft className="h-4 w-4" /> Kembali ke dasbor
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className={`relative z-10 mx-auto ${maxW} px-5 py-5 md:px-8`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/guru" className="btn btn-ghost h-10 w-10 !rounded-xl">
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <span className="glass flex h-10 w-10 items-center justify-center rounded-xl">{icon}</span>
            <div>
              <h1 className="text-lg font-extrabold leading-tight text-white md:text-xl">{title}</h1>
              <p className="text-xs text-zinc-500">
                {state.kelas.nama} · <span className="mono font-bold text-indigo-300">{state.kelas.kode}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip !text-emerald-300 border-emerald-400/25 bg-emerald-400/8">
              <Users className="h-3.5 w-3.5" />
              {state.siswaOnline}/{state.totalSiswa} online
            </span>
            {headerRight}
          </div>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
