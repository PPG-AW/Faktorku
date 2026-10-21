import {
  BookOpen, Flag, FlaskConical, Goal, Handshake, MonitorPlay,
  PenLine, Sparkles, Speech, Target, Trophy, Vote, type LucideIcon,
} from "lucide-react";
import type { SlideKonten } from "@/db/schema";

export interface StageMeta {
  key: string;
  label: string;
  fase: string;
  icon: LucideIcon;
}

/** Urutan lengkap tahapan pembelajaran */
export const STAGE_ORDER: StageMeta[] = [
  { key: "lobby", label: "Lobi Kelas", fase: "Pembuka", icon: MonitorPlay },
  { key: "apersepsi", label: "Apersepsi", fase: "Pendahuluan", icon: Target },
  { key: "tujuan", label: "Tujuan", fase: "Pendahuluan", icon: Goal },
  { key: "materi", label: "Materi & Stimulasi", fase: "Fase 1", icon: MonitorPlay },
  { key: "vote-rina", label: "Untung atau Rugi", fase: "Fase 1", icon: Vote },
  { key: "cobax", label: "CobaX", fase: "Fase 2", icon: FlaskConical },
  { key: "aktivitas-think", label: "LKPD: Think", fase: "Fase 3", icon: PenLine },
  { key: "aktivitas-pair", label: "LKPD: Pair", fase: "Fase 4", icon: Handshake },
  { key: "aktivitas-share", label: "SHARE: Presentasi", fase: "Fase 5", icon: Speech },
  { key: "kuis", label: "Kuis", fase: "Fase 6", icon: Trophy },
  { key: "refleksi", label: "Refleksi", fase: "Fase 6", icon: Sparkles },
  { key: "doa", label: "Penutup & Doa", fase: "Penutup", icon: Flag },
];

export function stageMeta(key: string): StageMeta {
  const found = STAGE_ORDER.find((s) => s.key === key);
  if (found) return found;
  if (key?.startsWith("aktivitas-")) {
    if (key.includes("pair")) return { key, label: "LKPD: Pair", fase: "Fase 4", icon: Handshake };
    if (key.includes("share")) return { key, label: "LKPD: Share", fase: "Fase 5", icon: Speech };
    return { key, label: "LKPD: Think", fase: "Fase 3", icon: PenLine };
  }
  return { key, label: key || "Materi", fase: "-", icon: MonitorPlay };
}

/** Konten bawaan (jika kelas ingin ditampilkan langsung di deck) */
export const INFO_KONTEN: Record<string, SlideKonten> = {
  tujuan: {
    layout: "content",
    kicker: "Pendahuluan · Tujuan Pembelajaran",
    title: "Tujuan Hari Ini",
    sub: "Memahami dan menguasai T-Faktor untuk persamaan kuadrat a = 1",
    blocks: [
      { t: "steps", items: [
        "1. Menyebutkan bentuk umum ax^2 + bx + c = 0 serta mengidentifikasi a, b, c.",
        "2. Membedakan persamaan linear dan persamaan kuadrat.",
        "3. Mencari dua bilangan dengan hasil kali = c dan jumlah = b.",
        "4. Menuliskan bentuk faktor (x + p)(x + q) = 0 dan menentukan x.",
        "5. Membuktikan akar lewat substitusi ke persamaan awal.",
      ] },
      { t: "box", title: "Target", v: "Benar minimal 3 dari 4 soal LKPD Bagian B + minimal 3 dari 5 soal Kuis.", tone: "warn" },
      { t: "box", title: "Cara Belajar", v: "Discovery Learning: Think sendiri, Pair berdiskusi, Share mempresentasikan. Bukan guru yang menjelaskan, kamu yang menemukan pola!", tone: "info" },
    ],
  },
  presentasi: {
    layout: "content",
    kicker: "Fase 5 · Verification (Share)",
    title: "Waktunya Presentasi!",
    sub: "Pasangan terpilih menjelaskan temuan polanya di depan kelas",
    blocks: [
      { t: "steps", items: [
        "Jelaskan pola tanda b dan c terhadap tanda p dan q yang kalian temukan.",
        "Ceritakan mengapa x^2 + 5x + 3 = 0 tidak bisa difaktorkan.",
        "Bagikan kesulitan yang kalian hadapi dan cara mengatasinya.",
      ] },
      { t: "box", title: "Etika", v: "Dengarkan dengan mindful. Tanggapi dengan hormat, berbeda cara = belajar baru.", tone: "warn" },
    ],
  },
  penutup: {
    layout: "content",
    kicker: "Penutup · Kesimpulan & Tugas",
    title: "Apa yang Kita Pelajari Hari Ini?",
    sub: "T-Faktor a = 1: kunci sederhana dari dua bilangan",
    blocks: [
      { t: "steps", items: [
        "Pemfaktoran adalah kebalikan perkalian aljabar.",
        "T-Faktor hanya berhasil bila ada dua bilangan bulat dengan kali = c dan jumlah = b.",
        "Persamaan kuadrat punya dua akar, satu akar, atau tidak bisa difaktorkan dengan bilangan bulat.",
        "Selalu buktikan akar lewat substitusi.",
      ] },
      { t: "box", title: "Pertemuan Berikutnya", v: "Rumus ABC & Melengkapkan Kuadrat Sempurna, untuk persamaan yang tidak bisa difaktorkan.", tone: "info" },
      { t: "steps", items: ["PR 1 · x^2 + 11x + 24 = 0", "PR 2 · x^2 - 13x + 36 = 0", "PR 3 · 2x^2 + 11x + 5 = 0", "Tantangan: x^2 + 3x + 1 = 0 (bisa atau tidak?)"] },
    ],
  },
};
