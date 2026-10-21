"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { KelasLive, type MonitorData } from "@/components/kelas-live";
import {
  DeckApersepsi, DeckCover, DeckInfo, DeckMateri, DeckSapaan, type PanelProps,
} from "@/components/deck/panels-a";
import {
  DeckHasil, DeckKlasifikasi, DeckKuis, DeckRefleksi, DeckWorksheet,
} from "@/components/deck/panels-b";
import { DeckCobax } from "@/components/deck/panels-c";
import { DeckAktivitas, DeckDoa } from "@/components/deck/panels-d";
import { DECK, DECK_GROUPS } from "@/lib/deck";
import { INFO_KONTEN } from "@/lib/stages";
import { fetcher, useKelasState } from "@/hooks/use-session";
import { getGuruKode, getGuruNama, setGuruKode } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, Keyboard, LayoutGrid, Link2, Link2Off,
  PanelLeftClose, PanelLeftOpen, Plus, Radio, RotateCw, Users,
} from "lucide-react";

interface KelasRow { id: string; kode: string; nama: string; guru: string }

export default function GuruDeck() {
  const [kode, setKode] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const [index, setIndex] = useState(0);
  const [sidebar, setSidebar] = useState(true);
  const [sync, setSync] = useState(true);
  const [showLive, setShowLive] = useState(false);
  const lastPushed = useRef<string | null>(null);

  const { data: kelasList, mutate: mutateList } = useSWR<{ kelas: KelasRow[] }>("/api/kelas", fetcher);
  const { state, mutate: mutateState, offset } = useKelasState(kode, 2000);
  const { data: monitor } = useSWR<MonitorData>(
    state ? `/api/guru/${state.kelas.id}/monitor` : null,
    fetcher,
    { refreshInterval: 2500 }
  );

  useEffect(() => {
    const k = getGuruKode();
    if (k) setKode(k);
    setBooted(true);
  }, []);

  const slide = DECK[index];

  const kontrol = useCallback(
    async (action: string, value?: unknown) => {
      if (!state) return;
      await fetch("/api/guru/kontrol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kelasId: state.kelas.id, action, value }),
      });
      await mutateState();
    },
    [state, mutateState]
  );

  // Sinkronkan stage siswa dengan slide deck yang dibuka guru
  useEffect(() => {
    if (!sync || !state || !slide.stage) return;
    if (state.kelas.stage === slide.stage || lastPushed.current === slide.stage) return;
    lastPushed.current = slide.stage;
    kontrol("setStage", slide.stage);
  }, [sync, slide, state, kontrol]);

  const go = useCallback((d: number) => {
    setIndex((i) => Math.max(0, Math.min(DECK.length - 1, i + d)));
  }, []);

  // Keyboard: panah = navigasi deck (kecuali di slide materi), PageUp/Down selalu deck
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "PageDown") { e.preventDefault(); go(1); }
      else if (e.key === "PageUp") { e.preventDefault(); go(-1); }
      else if (e.key === "ArrowRight" && slide.key !== "materi") go(1);
      else if (e.key === "ArrowLeft" && slide.key !== "materi") go(-1);
      else if (e.key === "ArrowRight") kontrol("slideNext");
      else if (e.key === "ArrowLeft") kontrol("slidePrev");
      else if (e.key.toLowerCase() === "s") setSidebar((v) => !v);
      else if (e.key.toLowerCase() === "m") setShowLive((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, slide.key, kontrol]);

  /* ----------------------------- SETUP ----------------------------- */
  if (booted && !kode) {
    return <SetupKelas list={kelasList?.kelas ?? []} onPick={(k) => { setKode(k); setGuruKode(k); }} onCreated={() => mutateList()} />;
  }
  if (!state) {
    return (
      <main className="relative flex min-h-screen items-center justify-center">
        <Ambient />
        <p className="relative z-10 text-zinc-400">Menyiapkan ruang kelas…</p>
      </main>
    );
  }

  const panelProps: PanelProps = {
    kelasId: state.kelas.id,
    kode: state.kelas.kode,
    kelasNama: state.kelas.nama,
    guruNama: state.kelas.guru,
    monitor: monitor ?? null,
  };

  const online = monitor?.agg.online ?? state.siswaOnline;
  const diSini = slide.stage
    ? (monitor?.siswa ?? []).filter((s) => s.online && s.currentStage === slide.stage).length
    : 0;

  return (
    <main className="relative flex h-screen overflow-hidden">
      <Ambient />

      {/* ============================ SIDE MENU ============================ */}
      <aside
        className={cn(
          "relative z-20 flex shrink-0 flex-col border-r border-white/8 bg-ink-900/80 backdrop-blur-xl transition-all duration-300",
          sidebar ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Logo compact />
          <button onClick={() => setSidebar(false)} className="btn btn-ghost h-8 w-8 !rounded-lg">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-3 rounded-2xl border border-white/8 bg-white/3 px-3 py-2.5">
          <p className="truncate text-xs font-bold text-white">{state.kelas.nama}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="mono text-sm font-extrabold tracking-[0.15em] text-indigo-300">{state.kelas.kode}</span>
            <span className="flex items-center gap-1 text-[0.65rem] font-bold text-emerald-300">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {online}/{monitor?.agg.total ?? state.totalSiswa}
            </span>
          </div>
        </div>

        <nav className="mt-3 flex-1 space-y-3 overflow-y-auto px-3 pb-3">
          {DECK_GROUPS.map((g) => {
            const items = DECK.filter((d) => d.group === g);
            if (items.length === 0) return null;
            return (
              <div key={g}>
                <p className="px-2 pb-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-zinc-600">{g}</p>
                <div className="space-y-0.5">
                  {items.map((d) => {
                    const i = DECK.indexOf(d);
                    const active = i === index;
                    const lewat = i < index;
                    return (
                      <button
                        key={d.key}
                        onClick={() => setIndex(i)}
                        className={cn(
                          "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all",
                          active ? "bg-gradient-to-r from-indigo-500/30 to-violet-500/10 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.35)]" : "hover:bg-white/5"
                        )}
                      >
                        <d.icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-200" : lewat ? "text-emerald-400/70" : "text-zinc-500")} />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block truncate text-xs font-bold", active ? "text-white" : lewat ? "text-zinc-300" : "text-zinc-400")}>
                            {d.label}
                          </span>
                          <span className="block truncate text-[0.6rem] text-zinc-600">{d.fase}</span>
                        </span>
                        {active && <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-indigo-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="space-y-1.5 border-t border-white/8 p-3">
          <button
            onClick={() => setSync((v) => !v)}
            className={cn("btn w-full py-2 text-[0.7rem]", sync ? "btn-primary" : "btn-ghost")}
          >
            {sync ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
            {sync ? "HP siswa ikut slide" : "Siswa tidak diikutkan"}
          </button>
          <button onClick={() => setShowLive((v) => !v)} className={cn("btn w-full py-2 text-[0.7rem]", showLive ? "btn-amber" : "btn-ghost")}>
            <Radio className="h-3.5 w-3.5" /> {showLive ? "Tutup pantauan" : "Pantau kelas"}
          </button>
          <button onClick={() => { setKode(null); setGuruKode(""); }} className="btn btn-ghost w-full py-2 text-[0.7rem]">
            <LayoutGrid className="h-3.5 w-3.5" /> Ganti kelas
          </button>
          <p className="mono flex items-center justify-center gap-1 pt-1 text-[0.58rem] text-zinc-600">
            <Keyboard className="h-3 w-3" /> ←/→ geser · S menu · M pantau
          </p>
        </div>
      </aside>

      {/* ============================== PANGGUNG ============================== */}
      <section className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex shrink-0 items-center gap-3 border-b border-white/6 px-5 py-3">
          {!sidebar && (
            <button onClick={() => setSidebar(true)} className="btn btn-ghost h-9 w-9 !rounded-xl">
              <PanelLeftOpen className="h-4.5 w-4.5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-white">{slide.label}</p>
            <p className="truncate text-[0.68rem] text-zinc-500">{slide.sub} · {slide.fase}</p>
          </div>
          {slide.stage && (
            <span className={cn("chip !text-[0.68rem]", diSini === online && online > 0 ? "!text-emerald-300 border-emerald-400/25 bg-emerald-400/8" : "!text-amber-300 border-amber-400/25 bg-amber-400/8")}>
              <Users className="h-3.5 w-3.5" /> {diSini}/{online} siswa di halaman ini
            </span>
          )}
          <span className="mono chip !text-[0.68rem] tabular">{index + 1}/{DECK.length}</span>
        </header>

        {/* Panel aktif */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 xl:px-8">
          <div key={slide.key} className="anim-slide h-full">
            {slide.key === "cover" && <DeckCover {...panelProps} />}
            {slide.key === "sapaan" && <DeckSapaan {...panelProps} />}
            {slide.key === "apersepsi" && <DeckApersepsi {...panelProps} />}
            {slide.key === "tujuan" && <DeckInfo konten={INFO_KONTEN.tujuan} />}
            {slide.key === "materi" && (
              <DeckMateri
                {...panelProps}
                slideAktif={state.kelas.slideAktif}
                locked={state.kelas.slideLocked}
                onNav={(a, v) => kontrol(a, v)}
                onLock={(v) => kontrol("slideLock", v)}
              />
            )}
            {slide.key === "cobax" && <DeckCobax {...panelProps} onReveal={() => kontrol("sesiStart")} />}
            {slide.key === "think" && <DeckAktivitas {...panelProps} stageKey="aktivitas-think" onKontrol={kontrol} />}
            {slide.key === "pair" && <DeckAktivitas {...panelProps} stageKey="aktivitas-pair" onKontrol={kontrol} />}
            {slide.key === "share" && <DeckAktivitas {...panelProps} stageKey="aktivitas-share" onKontrol={kontrol} />}
            {slide.key === "klasifikasi" && <DeckKlasifikasi {...panelProps} />}
            {slide.key === "worksheet" && <DeckWorksheet {...panelProps} />}
            {slide.key === "presentasi" && <DeckInfo konten={INFO_KONTEN.presentasi} />}
            {slide.key === "kuis" && <DeckKuis {...panelProps} offset={offset} onKontrol={(a) => kontrol(a)} />}
            {slide.key === "refleksi" && <DeckRefleksi {...panelProps} />}
            {slide.key === "penutup" && <DeckDoa {...panelProps} onKontrol={kontrol} />}
            {slide.key === "hasil" && <DeckHasil {...panelProps} />}
          </div>

          {showLive && (
            <div className="mt-4">
              <KelasLive kelasId={state.kelas.id} aktifStage={slide.stage ?? state.kelas.stage} />
            </div>
          )}
        </div>

        {/* Footer navigasi */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/6 px-5 py-3">
          <button onClick={() => go(-1)} disabled={index === 0} className="btn btn-ghost px-4 py-2 text-sm">
            <ChevronLeft className="h-4 w-4" /> Sebelumnya
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
            {DECK.map((d, i) => (
              <button
                key={d.key}
                onClick={() => setIndex(i)}
                title={d.label}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-8 bg-indigo-400" : i < index ? "w-1.5 bg-emerald-400/50" : "w-1.5 bg-white/15 hover:bg-white/30")}
              />
            ))}
          </div>
          <button onClick={() => go(1)} disabled={index === DECK.length - 1} className="btn btn-primary px-4 py-2 text-sm">
            Berikutnya <ChevronRight className="h-4 w-4" />
          </button>
        </footer>
      </section>
    </main>
  );
}

/* ========================= LAYAR PEMILIHAN KELAS ========================= */

function SetupKelas({
  list, onPick, onCreated,
}: { list: KelasRow[]; onPick: (kode: string) => void; onCreated: () => void }) {
  const [nama, setNama] = useState("");
  const [guru, setGuru] = useState(() => getGuruNama());
  const [busy, setBusy] = useState(false);

  async function buat(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/kelas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: nama.trim(), guru: guru.trim() }),
      });
      const d = await res.json();
      if (res.ok) { onCreated(); onPick(d.kelas.kode); }
    } finally { setBusy(false); }
  }

  return (
    <main className="relative min-h-screen">
      <Ambient />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-10">
        <Logo />
        <h1 className="anim-fade-up mt-8 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          Mulai <span className="text-gradient">sesi mengajar</span>
        </h1>
        <p className="anim-fade-up anim-fade-up-1 mt-3 text-sm text-zinc-400">
          Dashboard akan tampil sebagai presentasi layar penuh — siap diproyeksikan.
          Pilih kelas yang sudah ada atau buat kelas baru.
        </p>

        <form onSubmit={buat} className="anim-fade-up anim-fade-up-2 border-gradient mt-7 grid gap-3 rounded-3xl p-5 sm:grid-cols-[1fr_1fr_auto]">
          <input className="input" placeholder="Nama kelas (mis. X AKL 1)" value={nama} onChange={(e) => setNama(e.target.value)} />
          <input className="input" placeholder="Nama guru (mis. Bu Sari)" value={guru} onChange={(e) => setGuru(e.target.value)} />
          <button type="submit" disabled={busy || !nama.trim() || !guru.trim()} className="btn btn-primary px-6 py-3">
            {busy ? <RotateCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4.5 w-4.5" />} Buat
          </button>
        </form>

        {list.length > 0 && (
          <div className="anim-fade-up anim-fade-up-3 mt-6">
            <p className="label">Kelas tersimpan</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {list.map((k) => (
                <button
                  key={k.id}
                  onClick={() => onPick(k.kode)}
                  className="glass flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-all hover:-translate-y-0.5"
                >
                  <span>
                    <span className="block text-sm font-bold text-white">{k.nama}</span>
                    <span className="block text-xs text-zinc-500">{k.guru}</span>
                  </span>
                  <span className="mono rounded-lg bg-white/8 px-2.5 py-1 text-sm font-extrabold tracking-widest text-indigo-200">{k.kode}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


