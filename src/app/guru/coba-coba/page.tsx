"use client";

import useSWR from "swr";
import { GuruShell } from "@/components/guru-shell";
import { Eq } from "@/components/equation";
import { COBA } from "@/lib/aktivitas-data";
import { fetcher, useGuruKode, useKelasState } from "@/hooks/use-session";
import type { MonitorData } from "@/components/kelas-live";
import { cn } from "@/lib/utils";
import { CheckCircle2, FlaskConical, MousePointerClick, Target } from "lucide-react";

export default function GuruCobaCoba() {
  const { kode } = useGuruKode();
  const { state } = useKelasState(kode, 3000);
  const { data } = useSWR<MonitorData>(
    state ? `/api/guru/${state.kelas.id}/monitor` : null,
    fetcher,
    { refreshInterval: 2000 }
  );

  const cob = data?.agg.cobaCoba;
  const participants = (data?.siswa ?? []).filter((s) => s.progress.cobacoba.attempts > 0);
  const maxAttempts = Math.max(1, ...((data?.siswa ?? []).map((s) => s.progress.cobacoba.attempts)));

  return (
    <GuruShell title="Live Show: Coba-Coba (Fase 2)" icon={<FlaskConical className="h-5 w-5 text-sky-300" />} maxW="max-w-7xl">
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* KIRI: persamaan + penemu akar */}
        <div className="space-y-4">
          <div className="border-gradient rounded-3xl p-6 text-center">
            <p className="label !text-sky-300">Persamaan yang ditebak siswa</p>
            <div className="mono eq-badge mx-auto mt-2 w-fit px-5 py-3 text-xl font-bold text-indigo-100">
              <Eq>{`${COBA.eq} = 0`}</Eq>
            </div>
            <p className="mono mt-4 text-sm text-zinc-400">
              Total tebakan kelas: <span className="text-2xl font-extrabold text-white tabular">{cob?.totalAttempts ?? 0}</span>
            </p>
            <p className="text-xs text-zinc-500">{participants.length} siswa sudah mencoba</p>

            <div className="mt-5 space-y-3">
              {COBA.akar.map((r) => {
                const founders = cob?.founders[String(r)] ?? [];
                return (
                  <div key={r} className={cn("rounded-2xl border p-4 text-left", founders.length > 0 ? "border-emerald-400/30 bg-emerald-400/8" : "border-white/10 bg-white/3")}>
                    <div className="flex items-center justify-between">
                      <span className="mono text-lg font-extrabold text-white"><Eq>x</Eq> = {r}</span>
                      <span className={cn("chip", founders.length > 0 ? "!text-emerald-300 border-emerald-400/25 bg-emerald-400/8" : "")}>
                        {founders.length > 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
                        {founders.length} penemu
                      </span>
                    </div>
                    {founders.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {founders.map((n) => (
                          <span key={n} className="rounded-md bg-emerald-400/12 px-1.5 py-0.5 text-xs font-semibold text-emerald-200">{n.split(" ")[0]}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Gunakan momen ini untuk bertanya ke kelas: <span className="font-bold text-amber-300">“Berapa tebakan yang kalian butuhkan? Apakah cepat dan pasti?”</span>
            </p>
          </div>
        </div>

        {/* KANAN: bar percobaan per siswa */}
        <div className="glass rounded-3xl p-6">
          <p className="label flex items-center gap-2"><MousePointerClick className="h-3.5 w-3.5" /> Tebakan per siswa — live</p>
          <div className="mt-4 space-y-2">
            {(data?.siswa ?? []).map((s) => {
              const { attempts, roots } = s.progress.cobacoba;
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-3.5 py-2.5">
                  <span className="w-28 truncate text-sm font-semibold text-zinc-200">{s.nama.split(" ")[0]}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded-lg bg-white/5">
                    {attempts > 0 && (
                      <div
                        className="bar-grow flex h-full items-center rounded-lg bg-gradient-to-r from-sky-500/70 to-indigo-400/40 px-2"
                        style={{ width: `${Math.max(7, (attempts / maxAttempts) * 100)}%` }}
                      >
                        <span className="mono text-[0.65rem] font-bold text-white tabular">{attempts}×</span>
                      </div>
                    )}
                  </div>
                  <div className="flex w-16 justify-end gap-1">
                    {roots.slice(0, 2).map((r) => (
                      <span key={r} className="rounded-md bg-emerald-400/15 px-1.5 py-0.5 mono text-[0.65rem] font-extrabold text-emerald-300">{r}</span>
                    ))}
                  </div>
                </div>
              );
            })}
            {(data?.siswa ?? []).length === 0 && (
              <p className="py-10 text-center text-sm text-zinc-500">Belum ada siswa di kelas.</p>
            )}
          </div>
        </div>
      </div>
    </GuruShell>
  );
}
