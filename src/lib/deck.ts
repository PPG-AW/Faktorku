import {
  BarChart3, FlaskConical, Flag, Goal, Home, MonitorPlay, PenLine,
  Sparkles, Speech, Target, Trophy, type LucideIcon,
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
  { key: "apersepsi", label: "Apersepsi", sub: "Bacaan kasus + pertanyaan pemantik", group: "Pendahuluan", fase: "Pendahuluan", stage: "apersepsi", icon: Target },
  { key: "tujuan", label: "Tujuan Pembelajaran", sub: "3 target hari ini", group: "Pendahuluan", fase: "Pendahuluan", stage: "tujuan", icon: Goal },

  { key: "materi", label: "Stimulasi: Kisah Rina", sub: "Kisah kasus titik impas", group: "Kegiatan Inti", fase: "Fase 1", stage: "slide", icon: MonitorPlay },
  { key: "cobax", label: "CobaX: Tebak Nilai x", sub: "Tebakan 6 angka → dua akar", group: "Kegiatan Inti", fase: "Fase 2", stage: "cobax", icon: FlaskConical },
  { key: "lkpd", label: "LKPD (Kertas Siswa)", sub: "Bagian A · B · C + kunci guru", group: "Kegiatan Inti", fase: "Fase 3–4", stage: "aktivitas-share", icon: PenLine },
  { key: "share", label: "SHARE", sub: "Presentasi temuan pola tanda", group: "Kegiatan Inti", fase: "Fase 5", stage: "presentasi", icon: Speech },

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
