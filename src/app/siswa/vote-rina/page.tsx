"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { Check, Vote } from "lucide-react";

const OPSI = [
  { key: "untung", label: "Rina untung" },
  { key: "rugi", label: "Rina rugi" },
  { key: "impas", label: "Pas, tidak untung tidak rugi" },
];

export default function SiswaVotePage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 2000);
  useStageFollow(state?.kelas.stage, "vote-rina", state?.kelas.stage !== "vote-rina");

  const { data, mutate } = useSWR<{ sayaPilih: string | null; terisi: number; total: number }>(
    siswa ? `/api/voting?kelasId=${siswa.kelasId}&topik=untung-rugi&siswaId=${siswa.siswaId}` : null,
    fetcher, { refreshInterval: 2500 }
  );

  const [pilih, setPilih] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data?.sayaPilih) setPilih(data.sayaPilih); }, [data?.sayaPilih]);

  if (!ready || !siswa) return null;

  async function kirim(key: string) {
    if (busy) return;
    setBusy(true); setPilih(key);
    try {
      await fetch("/api/voting", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: siswa!.siswaId, topik: "untung-rugi", pilihan: key }),
      });
      mutate();
    } finally { setBusy(false); }
  }

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="chip">{siswa.nama}</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          <span className="chip mx-auto uppercase tracking-[0.2em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8">
            <Vote className="h-3.5 w-3.5" /> Pendapatmu
          </span>
          <h1 className="mt-5 text-center text-2xl sm:text-3xl leading-tight break-words md:text-4xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            Rina menerima pesanan 30 kaos. Menurutmu dia{" "}
            <em className="ff-italic text-[var(--red)]">untung atau rugi</em>?
          </h1>

          <div className="mt-8 space-y-3">
            {OPSI.map((o) => {
              const aktif = pilih === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => kirim(o.key)}
                  className={cn(
                    "flex w-full items-center gap-3 border-2 px-4 py-4 text-left text-base font-bold transition-all",
                    aktif ? "border-[var(--red)] bg-[var(--red)] text-white" : "border-[var(--hairline-strong)] bg-[var(--card)] hover:-translate-y-0.5"
                  )}
                >
                  <span className={cn("grid h-7 w-7 shrink-0 place-items-center border-2", aktif ? "border-white bg-white text-[var(--red)]" : "border-[var(--ink-3)]")}>
                    {aktif && <Check className="h-4 w-4" strokeWidth={3} />}
                  </span>
                  {o.label}
                </button>
              );
            })}
          </div>

          {pilih && (
            <p className="anim-rise mt-5 text-center text-sm text-emerald-700">
              Pilihanmu tercatat, lihat layar depan untuk hasil seluruh kelas.
            </p>
          )}
          <p className="mono mt-3 text-center text-xs tabular text-[var(--ink-3)]">
            {data?.terisi ?? 0}/{data?.total ?? 0} teman sudah memilih
          </p>
        </div>
      </div>
    </main>
  );
}
