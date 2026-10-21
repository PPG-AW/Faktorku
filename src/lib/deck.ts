import {
  BarChart3, BookOpen, FlaskConical, Flag, Goal, Hand, Handshake, Home,
  MonitorPlay, PenLine, Shapes, Sparkles, Speech, Target, Trophy,
  type LucideIcon,
} from "lucide-react";

export interface DeckSlide {
  key: string;
  label: string;
  sub: string;
  group: "Pendahuluan" | "Kegiatan Inti" | "Penutup" | "Khusus Guru";
  fase: string;
  /** Stage siswa yang disinkronkan saat slide ini dibuka (null = tidak mengubah) */
  stage: string | null;
  icon: LucideIcon;
}

export const DECK: DeckSlide[] = [
  { key: "cover", label: "Cover Materi", sub: "Pembuka & daftar hadir", group: "Pendahuluan", fase: "—", stage: "lobby", icon: Home },
  { key: "sapaan", label: "Apa Kabar?", sub: "Sapaan & kesiapan belajar", group: "Pendahuluan", fase: "Pendahuluan", stage: "sapaan", icon: Hand },
  { key: "apersepsi", label: "Apersepsi", sub: "Bacaan kasus + pertanyaan pemantik", group: "Pendahuluan", fase: "Pendahuluan", stage: "apersepsi", icon: Target },
  { key: "tujuan", label: "Tujuan Pembelajaran", sub: "3 target hari ini", group: "Pendahuluan", fase: "Pendahuluan", stage: "tujuan", icon: Goal },

  { key: "materi", label: "Stimulasi: Kisah Rina", sub: "18 slide materi terkontrol", group: "Kegiatan Inti", fase: "Fase 1", stage: "slide", icon: MonitorPlay },
  { key: "cobax", label: "CobaX: Tebak Nilai x", sub: "Tebakan 6 angka → dua akar", group: "Kegiatan Inti", fase: "Fase 2", stage: "cobax", icon: FlaskConical },
  { key: "think", label: "THINK (20')", sub: "Kerja mandiri LKPD bagian A & B", group: "Kegiatan Inti", fase: "Fase 3.1", stage: "aktivitas-think", icon: BookOpen },
  { key: "pair", label: "PAIR (10')", sub: "Diskusi berpasangan bagian C", group: "Kegiatan Inti", fase: "Fase 3.2", stage: "aktivitas-pair", icon: Handshake },
  { key: "share", label: "SHARE (8')", sub: "Presentasi temuan pola", group: "Kegiatan Inti", fase: "Fase 5", stage: "aktivitas-share", icon: Speech },
  { key: "klasifikasi", label: "Klasifikasi & Pola", sub: "Menemukan rahasia T-Faktor", group: "Kegiatan Inti", fase: "Fase 3", stage: "klasifikasi", icon: Shapes },
  { key: "worksheet", label: "Worksheet (T-Faktor)", sub: "T-Faktor & Metode AC", group: "Kegiatan Inti", fase: "Fase 3–4", stage: "worksheet", icon: PenLine },

  { key: "kuis", label: "Kuis & Leaderboard", sub: "Mengukur ketercapaian", group: "Penutup", fase: "Fase 6", stage: "kuis", icon: Trophy },
  { key: "refleksi", label: "Refleksi Kelas", sub: "Ceklis, rating, word cloud", group: "Penutup", fase: "Fase 6", stage: "refleksi", icon: Sparkles },
  { key: "penutup", label: "Kesimpulan & PR", sub: "Rangkuman, tugas, doa", group: "Penutup", fase: "Penutup", stage: "penutup", icon: Flag },

  { key: "hasil", label: "Rekap Nilai & PDF", sub: "Hanya untuk guru", group: "Khusus Guru", fase: "—", stage: null, icon: BarChart3 },
];

export const DECK_GROUPS = ["Pendahuluan", "Kegiatan Inti", "Penutup", "Khusus Guru"] as const;

export function deckIndexByKey(key: string): number {
  const i = DECK.findIndex((d) => d.key === key);
  return i < 0 ? 0 : i;
}

/** Cari slide deck yang cocok dengan stage kelas saat ini */
export function deckIndexByStage(stage: string): number {
  const i = DECK.findIndex((d) => d.stage === stage);
  return i < 0 ? 0 : i;
}
