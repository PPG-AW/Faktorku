"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import { getSiswaSession, clearSiswaSession, getGuruKode, type SiswaSession } from "@/lib/session";

export const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j.error ?? `HTTP ${r.status}`);
    }
    return r.json();
  });

/* ------------------------------ SISWA ------------------------------ */

export function useSiswa(): { siswa: SiswaSession | null; ready: boolean } {
  const router = useRouter();
  const [siswa, setSiswa] = useState<SiswaSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSiswaSession();
    if (!s) {
      router.replace("/join");
      return;
    }
    setSiswa(s);
    setReady(true);
  }, [router]);

  return { siswa, ready };
}

/* ------------------------------ STATUS KELAS ------------------------------ */

export interface KelasState {
  kelas: {
    id: string;
    kode: string;
    nama: string;
    guru: string;
    stage: string;
    slideAktif: number;
    slideLocked: boolean;
    slideTotal: number;
    apersepsiSoalAktif?: number;
    apersepsiRevealed?: boolean;
    rina1Revealed?: boolean;
    timerJalan?: boolean;
    timerTotal?: number;
    timerSisa?: number;
    timerUpdatedAt?: string | null;
  };
  siswaOnline: number;
  totalSiswa: number;
  serverNow: string;
  kuis: {
    sessionId: string;
    aktif: boolean;
    soalAktif: number;
    soalMulai: string;
    paket: number;
    totalSoal: number;
    timer: number;
    ended: boolean;
  } | null;
}

export function useKelasState(kode: string | null | undefined, refreshMs = 1800) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, error, mutate } = useSWR<KelasState>(
    kode ? `/api/kelas/${kode}/state` : null,
    fetcher,
    {
      refreshInterval: refreshMs,
      revalidateOnFocus: true,
      onError: (err) => {
        // Jika server merespon 404 (kelas lama sudah terhapus atau tidak ada di database)
        if (err?.message?.includes("404") || err?.status === 404) {
          if (pathname?.startsWith("/siswa")) {
            clearSiswaSession();
            router.replace("/join");
          }
        }
      },
    }
  );
  const offset = useMemo(() => {
    if (!data?.serverNow) return 0;
    return new Date(data.serverNow).getTime() - Date.now();
  }, [data?.serverNow]);
  return { state: data ?? null, error, mutate, offset };
}

/** Redirect otomatis mengikuti stage yang diaktifkan guru */
export function useStageFollow(stage: string | undefined, current: string, enabled = true) {
  const router = useRouter();
  useEffect(() => {
    if (!enabled || !stage) return;
    if (stage !== current && stage !== "lobby") {
      // Aktivitas think/pair/share semua menuju satu halaman wizard
      if (stage.startsWith("aktivitas-")) router.push("/siswa/aktivitas");
      else router.push(`/siswa/${stage}`);
    } else if (stage === "lobby" && current !== "lobby") {
      router.push("/siswa");
    }
  }, [stage, current, router, enabled]);
}

/* ------------------------------ PRESENCE ------------------------------ */

const KNOWN_STAGES = new Set([
  "materi", "apersepsi", "vote-rina", "cobax", "kuis", "refleksi", "doa",
]);

/** Heartbeat presence + lapor halaman yang sedang dibuka (infer dari URL) */
export function usePing(siswaId: string | null | undefined) {
  const pathname = usePathname();
  const stage = useMemo(() => {
    const seg = pathname.replace(/^\/siswa\/?/, "").split("/")[0];
    if (seg === "aktivitas") return "aktivitas-think";
    if (seg === "cobax") return "cobax";
    if (seg === "doa") return "doa";
    return KNOWN_STAGES.has(seg) ? seg : "lobby";
  }, [pathname]);

  useEffect(() => {
    if (!siswaId) return;
    const ping = () =>
      fetch("/api/siswa/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siswaId, stage }),
      }).catch(() => {});
    ping();
    const iv = setInterval(ping, 9000);
    return () => clearInterval(iv);
  }, [siswaId, stage]);
}

/* ------------------------------ GURU ------------------------------ */

export function useGuruKode(): { kode: string | null; ready: boolean } {
  const router = useRouter();
  const [kode, setKode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const k = getGuruKode();
    if (!k) {
      router.replace("/guru");
      return;
    }
    setKode(k);
    setReady(true);
  }, [router]);
  return { kode, ready };
}
