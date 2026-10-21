"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Eq } from "@/components/equation";
import { Logo } from "@/components/topbar";
import { fetcher, useKelasState, usePing, useSiswa, useStageFollow } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { Check, CircleHelp, Hourglass, Send } from "lucide-react";

interface Rekap { sesi: { id: string } | null; terisi: number; total: number }

export default function SiswaCobaxPage() {
  const { siswa, ready } = useSiswa();
  usePing(siswa?.siswaId);
  const { state } = useKelasState(siswa?.kelasKode, 1500);
  useStageFollow(state?.kelas.stage, "cobax", state?.kelas.stage !== "cobax");

  const { data, mutate } = useSWR<Rekap>(
    siswa ? `/api/cobax?kelasId=${siswa.kelasId}` : null, fetcher, { refreshInterval: 2000 }
  );

  const [nilai, setNilai] = useState<number | null>(null);
  const [terkirim, setTerkirim] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!data?.sesi) { setTerkirim(null); } }, [data?.sesi]);

  if (!ready || !siswa) return null;
  const sesiAda = Boolean(data?.sesi);

  async function kirim() {
    if (nilai === null || busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/cobax", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId: siswa!.siswaId, pilihan: nilai }),
      });
      const r = await res.json();
      if (res.ok) { setTerkirim(nilai); mutate(); }
      else setError(r.error ?? "Gagal mengirim.");
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

        <div className="mt-7 text-center">
          <span className="chip uppercase tracking-[0.2em] !text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/8">
            <CircleHelp className="h-3.5 w-3.5" /> Tebak Nilai x
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl" style={{ fontFamily: '"Playfair Display", serif' }}>
            Pilih <em className="ff-italic text-[var(--red)]">angka berapa pun</em>
          </h1>
          <div className="eq-badge mono mx-auto mt-4 w-fit px-5 py-3 text-2xl font-bold">
            <Eq>x^2 - 20x + 75 = 0</Eq>
          </div>
          <p className="mt-3 text-sm text-[var(--ink-2)]">
            Menurutmu, berapa nilai <b>x</b> yang membuat hasilnya nol? Pilih antara 0 sampai 30.
          </p>
        </div>

        {!sesiAda ? (
          <div className="glass mt-8 flex flex-1 flex-col items-center justify-center p-10 text-center">
            <Hourglass className="h-10 w-10 animate-spin [animation-duration:4s] text-[var(--ink-3)]" />
            <p className="mt-4 text-sm text-[var(--ink-3)]">Menunggu guru membuka tebakan…</p>
          </div>
        ) : terkirim !== null ? (
          <div className="anim-pop glass mt-8 flex flex-1 flex-col items-center justify-center p-10 text-center">
            <span className="grid h-20 w-20 place-items-center border-2 border-emerald-700 bg-emerald-50">
              <Check className="h-10 w-10 text-emerald-700" />
            </span>
            <p className="mono mt-4 text-5xl font-extrabold">x = {terkirim}</p>
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              Tebakanmu terkirim! Lihat layar depan, tebakan seluruh kelas sedang dikumpulkan.
            </p>
            <button onClick={() => setTerkirim(null)} className="btn btn-ghost mt-5 px-5 py-2.5 text-xs">
              Ubah tebakan
            </button>
          </div>
        ) : (
          <>
            <div className="mt-7 grid grid-cols-6 gap-2">
              {Array.from({ length: 31 }).map((_, n) => (
                <button
                  key={n}
                  onClick={() => setNilai(n)}
                  className={cn(
                    "mono grid h-14 place-items-center border-2 text-xl font-extrabold transition-all",
                    nilai === n
                      ? "border-[var(--red)] bg-[var(--red)] text-white"
                      : "border-[var(--hairline-strong)] bg-[var(--card)] hover:-translate-y-0.5 hover:border-[var(--red)]"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>

            {error && <p className="mt-3 text-center text-sm text-[var(--red)]">{error}</p>}

            <button onClick={kirim} disabled={nilai === null || busy} className="btn btn-primary mt-5 w-full py-4 text-base">
              <Send className="h-4.5 w-4.5" />
              {nilai === null ? "Pilih satu angka dulu" : `Kirim tebakan x = ${nilai}`}
            </button>
            <p className="mono mt-3 text-center text-xs tabular text-[var(--ink-3)]">
              {data?.terisi ?? 0}/{data?.total ?? 0} teman sudah menebak
            </p>
          </>
        )}
      </div>
    </main>
  );
}
