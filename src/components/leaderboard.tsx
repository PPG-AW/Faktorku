"use client";

import { Crown, Medal, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LeaderboardEntry {
  siswaId: string;
  nama: string;
  skor: number;
  benar: number;
  kosong: number;
  avgWaktu: number;
  sudahJawab: number;
}

function inisial(nama: string) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR = [
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-sky-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-fuchsia-500 to-purple-600",
  "from-rose-500 to-pink-600",
];

export function Leaderboard({
  entries,
  maxSkor,
  highlightId,
  compact = false,
}: {
  entries: LeaderboardEntry[];
  maxSkor: number;
  highlightId?: string;
  compact?: boolean;
}) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div>
      {/* PODIUM */}
      {!compact && top3.length > 0 && (
        <div className="mb-6 flex items-end justify-center gap-3 md:gap-5">
          {top3[1] && (
            <PodiumCard e={top3[1]} rank={2} maxSkor={maxSkor} highlightId={highlightId} />
          )}
          {top3[0] && (
            <PodiumCard e={top3[0]} rank={1} maxSkor={maxSkor} highlightId={highlightId} />
          )}
          {top3[2] && (
            <PodiumCard e={top3[2]} rank={3} maxSkor={maxSkor} highlightId={highlightId} />
          )}
        </div>
      )}

      {/* DAFTAR */}
      <div className="space-y-1.5">
        {(compact ? entries : rest).map((e, idx) => {
          const rank = compact ? idx + 1 : idx + 4;
          const cepat = e.avgWaktu > 0 && e.avgWaktu <= 25;
          const isMe = e.siswaId === highlightId;
          return (
            <div
              key={e.siswaId}
              className={cn(
                "anim-rise flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
                isMe ? "border-indigo-400/50 bg-indigo-500/15" : "border-white/6 bg-white/3 hover:bg-white/6"
              )}
              style={{ animationDelay: `${Math.min(idx * 0.04, 0.5)}s` }}
            >
              <span className="mono w-7 text-center text-sm font-bold text-zinc-500 tabular">{rank}</span>
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-extrabold text-white", AVATAR[rank % AVATAR.length])}>
                {inisial(e.nama)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-200">
                {e.nama}
                {isMe && <span className="ml-2 text-[0.65rem] font-bold uppercase tracking-widest text-indigo-300">Kamu</span>}
              </span>
              {cepat && (
            <span title="Jawab cepat">
              <Zap className="h-4 w-4 text-amber-300" />
            </span>
          )}
              <span className="chip !py-0.5 !text-[0.68rem]">{e.benar} benar</span>
              <span className="mono w-16 text-right text-sm font-bold text-white tabular">
                {e.skor}
                <span className="text-zinc-500">/{maxSkor}</span>
              </span>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">Belum ada jawaban masuk. Leaderboard akan hidup saat siswa mulai menjawab.</p>
      )}
    </div>
  );
}

function PodiumCard({
  e,
  rank,
  maxSkor,
  highlightId,
}: {
  e: LeaderboardEntry;
  rank: number;
  maxSkor: number;
  highlightId?: string;
}) {
  const isFirst = rank === 1;
  const medalColor = rank === 1 ? "text-amber-300" : rank === 2 ? "text-zinc-300" : "text-orange-400";
  return (
    <div
      className={cn(
        "anim-pop relative flex w-28 flex-col items-center rounded-2xl border px-3 pb-4 pt-5 md:w-36",
        isFirst
          ? "border-amber-300/40 bg-gradient-to-b from-amber-400/15 to-amber-500/5 md:-translate-y-4 shadow-[0_20px_60px_-20px_rgba(245,158,11,0.5)]"
          : "border-white/10 bg-white/4",
        e.siswaId === highlightId && "ring-2 ring-indigo-400"
      )}
    >
      {isFirst && <Crown className="crown-bob absolute -top-5 h-8 w-8 text-amber-300 drop-shadow-[0_4px_12px_rgba(245,158,11,0.8)]" />}
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br font-extrabold text-white shadow-lg",
          isFirst ? "h-16 w-16 text-xl" : "h-12 w-12 text-base",
          AVATAR[rank % AVATAR.length]
        )}
      >
        {inisial(e.nama)}
      </span>
      <Medal className={cn("mt-2 h-4 w-4", medalColor)} />
      <p className="mt-1 w-full truncate text-center text-sm font-bold text-white">{e.nama}</p>
      <p className="mono mt-0.5 text-xs font-bold text-zinc-300 tabular">
        {e.skor}<span className="text-zinc-500">/{maxSkor}</span>
      </p>
      <div className="mt-1.5 flex gap-1">
        {e.avgWaktu > 0 && e.avgWaktu <= 25 && <Zap className="h-3.5 w-3.5 text-amber-300" />}
        {e.avgWaktu > 0 && e.avgWaktu <= 12 && <Zap className="h-3.5 w-3.5 text-amber-300" />}
      </div>
    </div>
  );
}
