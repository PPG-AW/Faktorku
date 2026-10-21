"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { SlideViewer } from "@/components/slide-viewer";
import { DrawCanvas } from "@/components/draw-canvas";
import { KelasLive, type MonitorData } from "@/components/kelas-live";
import { DeckPresensi, DeckApersepsi, DeckVoteRina } from "@/components/deck/panels-a";
import { DeckKuis, DeckLeaderboard, DeckRefleksi, DeckDoa } from "@/components/deck/panels-b";
import { DeckCobax } from "@/components/deck/panels-c";

import { DeckLkpd, FloatingTimer } from "@/components/lkpd-view";
import { DECK, DECK_GRUP, DECK_TOTAL, type DeckItem } from "@/lib/deck-slides";
import { fetcher, useKelasState } from "@/hooks/use-session";
import { getGuruKode, getGuruNama, setGuruKode } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, Keyboard, LayoutGrid, Link2, Link2Off,
  PanelLeftClose, PanelLeftOpen, PencilLine, Plus, Radio, RotateCw, Users,
} from "lucide-react";

interface KelasRow { id: string; kode: string; nama: string; guru: string }

export default function GuruDeck() {
  const [kode, setKode] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const [index, setIndex] = useState(0);
  const [sidebar, setSidebar] = useState(true);
  const [sync, setSync] = useState(true);
  const [showLive, setShowLive] = useState(false);
  const [draw, setDraw] = useState(false);
  const [tahap, setTahap] = useState(1);
  const lastPushed = useRef<string | null>(null);

  const { data: kelasList, mutate: mutateList } = useSWR<{ kelas: KelasRow[] }>("/api/kelas", fetcher);
  const { state, mutate: mutateState, offset } = useKelasState(kode, 2000);
  const { data: monitor } = useSWR<MonitorData>(
    state ? `/api/guru/${state.kelas.id}/monitor` : null, fetcher, { refreshInterval: 2500 }
  );

  useEffect(() => {
    const k = getGuruKode();
    if (k) setKode(k);
    setBooted(true);
  }, []);

  const slide: DeckItem = DECK[index];

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

  // Sinkron: stage + nomor slide aktif → HP siswa mengikuti persis
  useEffect(() => {
    if (!sync || !state || !slide.stage) return;
    const sig = `${slide.stage}#${slide.nomor}`;
    if (lastPushed.current === sig) return;
    if (state.kelas.stage === slide.stage && state.kelas.slideAktif === slide.nomor) return;
    lastPushed.current = sig;
    kontrol("deckGoto", { nomor: slide.nomor, stage: slide.stage });
  }, [sync, slide, state, kontrol]);

  const go = useCallback((d: number) => {
    setIndex((i) => {
      const n = Math.max(0, Math.min(DECK.length - 1, i + d));
      if (n !== i) setTahap(1);
      return n;
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown") { e.preventDefault(); setTahap((t) => t + 1); }
      else if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      else if (e.key.toLowerCase() === "s") setSidebar((v) => !v);
      else if (e.key.toLowerCase() === "m") setShowLive((v) => !v);
      else if (e.key.toLowerCase() === "d") setDraw((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (booted && !kode) {
    return <SetupKelas list={kelasList?.kelas ?? []} onPick={(k) => { setKode(k); setGuruKode(k); }} onCreated={() => mutateList()} />;
  }
  if (!state) {
    return (
      <main className="relative flex min-h-screen items-center justify-center">
        <Ambient />
        <p className="relative z-10 text-[var(--ink-2)]">Menyiapkan ruang kelas…</p>
      </main>
    );
  }

  const panelProps = {
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

  const punyaKonten = slide.konten !== null;

  return (
    <main className="relative flex h-screen overflow-hidden">
      <Ambient />

      {/* ============================ SIDE MENU ============================ */}
      <aside className={cn(
        "relative z-20 flex shrink-0 flex-col border-r-2 border-[var(--ink)] bg-[var(--paper-2)] transition-all duration-300",
        sidebar ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-3.5">
          <Logo compact />
          <button onClick={() => setSidebar(false)} className="btn btn-ghost h-8 w-8 !p-0">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-3 mt-3 border-2 border-[var(--ink)] bg-[var(--card)] px-3 py-2.5 shadow-[3px_3px_0_var(--ink)]">
          <p className="truncate text-xs font-extrabold">{state.kelas.nama}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="mono text-base font-extrabold tracking-[0.15em] text-[var(--red)]">{state.kelas.kode}</span>
            <span className="flex items-center gap-1 text-[0.65rem] font-bold text-emerald-700">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-600" />
              {online}/{monitor?.agg.total ?? state.totalSiswa}
            </span>
          </div>
        </div>

        <nav className="mt-3 flex-1 space-y-3 overflow-y-auto px-3 pb-3">
          {DECK_GRUP.map((g) => {
            const items = DECK.filter((d) => d.grup === g);
            if (items.length === 0) return null;
            return (
              <div key={g}>
                <p className="border-b border-[var(--hairline)] px-1 pb-1 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-[var(--ink-3)]">{g}</p>
                <div className="mt-1 space-y-0.5">
                  {items.map((d) => {
                    const i = DECK.indexOf(d);
                    const active = i === index;
                    const lewat = i < index;
                    return (
                      <button
                        key={d.key}
                        onClick={() => setIndex(i)}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-all",
                          active ? "border-l-4 border-[var(--red)] bg-[var(--card)] shadow-[2px_2px_0_var(--ink)]" : "border-l-4 border-transparent hover:bg-[var(--card)]"
                        )}
                      >
                        <span className={cn("mono w-5 shrink-0 text-center text-[0.65rem] font-bold tabular", active ? "text-[var(--red)]" : lewat ? "text-emerald-700" : "text-[var(--ink-3)]")}>
                          {d.nomor}
                        </span>
                        <d.icon className={cn("h-4 w-4 shrink-0", active ? "text-[var(--red)]" : lewat ? "text-emerald-700" : "text-[var(--ink-3)]")} />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block truncate text-xs font-extrabold", active ? "text-[var(--ink)]" : "text-[var(--ink-2)]")}>{d.label}</span>
                          <span className="block truncate text-[0.58rem] text-[var(--ink-3)]">{d.fase}</span>
                        </span>
                        {d.interaktif && (
                          <span className="shrink-0 border border-[var(--red)] bg-[var(--red)]/10 px-1 text-[0.5rem] font-extrabold uppercase text-[var(--red)]">live</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="space-y-1.5 border-t-2 border-[var(--ink)] p-3">
          <button onClick={() => setSync((v) => !v)} className={cn("btn w-full py-2 text-[0.7rem]", sync ? "btn-primary" : "btn-ghost")}>
            {sync ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
            {sync ? "HP siswa ikut slide" : "Siswa tidak diikutkan"}
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={() => setDraw((v) => !v)} className={cn("btn py-2 text-[0.7rem]", draw ? "btn-amber" : "btn-ghost")}>
              <PencilLine className="h-3.5 w-3.5" /> Coret
            </button>
            <button onClick={() => setShowLive((v) => !v)} className={cn("btn py-2 text-[0.7rem]", showLive ? "btn-amber" : "btn-ghost")}>
              <Radio className="h-3.5 w-3.5" /> Pantau
            </button>
          </div>
          <button onClick={() => { setKode(null); setGuruKode(""); }} className="btn btn-ghost w-full py-2 text-[0.7rem]">
            <LayoutGrid className="h-3.5 w-3.5" /> Ganti kelas
          </button>
          <p className="mono flex items-center justify-center gap-1 pt-1 text-[0.56rem] text-[var(--ink-3)]">
            <Keyboard className="h-3 w-3" /> ←/→ slide · D coret · S menu · M pantau
          </p>
        </div>
      </aside>

      {/* ============================== PANGGUNG ============================== */}
      <section className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b-2 border-[var(--ink)] bg-[var(--card)] px-5 py-2.5">
          {!sidebar && (
            <button onClick={() => setSidebar(true)} className="btn btn-ghost h-9 w-9 !p-0">
              <PanelLeftOpen className="h-4.5 w-4.5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">{slide.label}</p>
            <p className="mono truncate text-[0.62rem] uppercase tracking-widest text-[var(--ink-3)]">{slide.fase}</p>
          </div>
          {draw && <span className="chip !text-[var(--red)] border-[var(--red)]/40 bg-[var(--red)]/8 !text-[0.62rem]"><PencilLine className="h-3 w-3" /> Mode coret aktif</span>}
          {slide.stage && (
            <span className={cn("chip !text-[0.62rem]", diSini === online && online > 0 ? "!text-emerald-700 border-emerald-600/30" : "!text-[var(--red)] border-[var(--red)]/30")}>
              <Users className="h-3.5 w-3.5" /> {diSini}/{online} siswa
            </span>
          )}
          <span className="mono chip !text-[0.62rem] tabular">{slide.nomor}/{DECK_TOTAL}</span>
        </header>

        {/* Panel aktif + canvas coret */}
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <div key={slide.key} className="anim-slide relative min-h-full px-4 py-5 md:px-6 xl:px-8">
            {/* 1. Konten slide statis */}
            {punyaKonten && (
              <div className={cn("mx-auto w-full", slide.interaktif ? "max-w-6xl" : "flex min-h-[calc(100vh-200px)] max-w-[88rem] items-center")}>
                <div className="w-full">
                  <SlideViewer
                    konten={slide.konten!}
                    nomor={slide.nomor}
                    total={DECK_TOTAL}
                    tampil={slide.bertahap ? tahap : undefined}
                  />
                  {slide.bertahap && tahap < slide.konten!.blocks.length && (
                    <div className="mt-6 flex justify-center">
                      <button onClick={() => setTahap((t) => t + 1)} className="btn btn-primary px-7 py-3 text-sm">
                        Lanjut <ChevronRight className="h-4 w-4" />
                        <span className="mono ml-1 text-xs opacity-70">{tahap}/{slide.konten!.blocks.length}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Panel interaktif menempel pada slide-nya */}
            {slide.interaktif && (
              <div className={cn(punyaKonten && "mt-6 border-t-2 border-dashed border-[var(--hairline-strong)] pt-6")}>
                {slide.interaktif === "presensi" && <DeckPresensi {...panelProps} />}
                {slide.interaktif === "apersepsi" && <DeckApersepsi {...panelProps} />}
                {slide.interaktif === "vote-rina" && <DeckVoteRina {...panelProps} />}
                {slide.interaktif === "cobax" && <DeckCobax {...panelProps} onReveal={() => kontrol("sesiStart")} />}
                {slide.interaktif === "lkpd" && <DeckLkpd />}
                {slide.interaktif === "lkpd-pair" && <DeckLkpd defaultBagian="c" />}
                {slide.interaktif === "share" && <DeckLkpd modeShare />}
                {slide.interaktif === "kuis" && <DeckKuis {...panelProps} offset={offset} onKontrol={(a, v) => kontrol(a, v)} />}
                {slide.interaktif === "leaderboard" && <DeckLeaderboard {...panelProps} />}
                {slide.interaktif === "refleksi" && <DeckRefleksi {...panelProps} />}
                {slide.interaktif === "logout" && <DeckDoa {...panelProps} onKontrol={kontrol} />}
              </div>
            )}

            {showLive && (
              <div className="mt-5">
                <KelasLive kelasId={state.kelas.id} aktifStage={slide.stage || state.kelas.stage} />
              </div>
            )}
          </div>

          {/* Timer melayang pada LKPD, Pair, & Share */}
          {slide.timer && (
            <FloatingTimer
              stageKey={`aktivitas-${slide.timer}` as "aktivitas-think" | "aktivitas-pair" | "aktivitas-share"}
              kelasId={state.kelas.id}
            />
          )}

          {/* Canvas coret bebas, menutupi seluruh panggung */}
          <DrawCanvas slideKey={slide.key} active={draw} onClose={() => setDraw(false)} />
        </div>

        <footer className="flex shrink-0 items-center gap-3 border-t-2 border-[var(--ink)] bg-[var(--card)] px-5 py-2.5">
          <button onClick={() => go(-1)} disabled={index === 0} className="btn btn-ghost px-4 py-2 text-sm">
            <ChevronLeft className="h-4 w-4" /> Sebelumnya
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
            {DECK.map((d, i) => (
              <button
                key={d.key}
                onClick={() => setIndex(i)}
                title={d.label}
                className={cn("h-2 transition-all", i === index ? "w-7 bg-[var(--red)]" : i < index ? "w-2 bg-emerald-600/50" : "w-2 bg-[var(--hairline-strong)]")}
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

function SetupKelas({ list, onPick, onCreated }: { list: KelasRow[]; onPick: (kode: string) => void; onCreated: () => void }) {
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
        <h1 className="anim-fade-up mt-8 text-4xl md:text-5xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          Mulai <em className="ff-italic text-[var(--red)]">sesi mengajar</em>
        </h1>
        <p className="anim-fade-up anim-fade-up-1 mt-3 text-sm text-[var(--ink-2)]">
          Dashboard tampil sebagai presentasi layar penuh, siap diproyeksikan.
        </p>

        <form onSubmit={buat} className="anim-fade-up anim-fade-up-2 border-gradient mt-7 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]">
          <input className="input" placeholder="Nama kelas (mis. X AKL 1)" value={nama} onChange={(e) => setNama(e.target.value)} />
          <input className="input" placeholder="Nama guru" value={guru} onChange={(e) => setGuru(e.target.value)} />
          <button type="submit" disabled={busy || !nama.trim() || !guru.trim()} className="btn btn-primary px-6 py-3">
            {busy ? <RotateCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4.5 w-4.5" />} Buat
          </button>
        </form>

        {list.length > 0 && (
          <div className="anim-fade-up anim-fade-up-3 mt-6">
            <p className="label">Kelas tersimpan</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {list.map((k) => (
                <button key={k.id} onClick={() => onPick(k.kode)} className="glass flex items-center justify-between p-4 text-left transition-all hover:-translate-y-0.5">
                  <span>
                    <span className="block text-sm font-extrabold">{k.nama}</span>
                    <span className="block text-xs text-[var(--ink-3)]">{k.guru}</span>
                  </span>
                  <span className="mono border border-[var(--hairline-strong)] bg-[var(--paper-2)] px-2.5 py-1 text-sm font-extrabold tracking-widest text-[var(--red)]">{k.kode}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
