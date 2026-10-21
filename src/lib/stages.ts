import {
  FlaskConical, Flag, Goal, Hand, MonitorPlay, PenLine, Presentation,
  Shapes, Sparkles, Speech, Target, Trophy, Users, type LucideIcon,
} from "lucide-react";
import type { SlideKonten } from "@/db/schema";

export interface StageMeta {
  key: string;
  label: string;
  fase: string;
  icon: LucideIcon;
}

/** Urutan lengkap sesuai RPP (Discovery Learning) */
export const STAGE_ORDER: StageMeta[] = [
  { key: "sapaan", label: "Sapaan", fase: "Pendahuluan", icon: Hand },
  { key: "apersepsi", label: "Apersepsi", fase: "Pendahuluan", icon: Target },
  { key: "tujuan", label: "Tujuan", fase: "Pendahuluan", icon: Goal },
  { key: "slide", label: "Stimulasi", fase: "F1", icon: MonitorPlay },
  { key: "coba-coba", label: "Coba-coba", fase: "F2", icon: FlaskConical },
  { key: "klasifikasi", label: "Klasifikasi", fase: "F3", icon: Shapes },
  { key: "worksheet", label: "Worksheet", fase: "F3–F4", icon: PenLine },
  { key: "presentasi", label: "Presentasi", fase: "F5", icon: Speech },
  { key: "kuis", label: "Kuis", fase: "F6", icon: Trophy },
  { key: "refleksi", label: "Refleksi", fase: "F6", icon: Sparkles },
  { key: "penutup", label: "Penutup", fase: "Penutup", icon: Flag },
  { key: "lobby", label: "Lobi", fase: "—", icon: Users },
];

export function stageMeta(key: string): StageMeta {
  return STAGE_ORDER.find((s) => s.key === key) ?? STAGE_ORDER[STAGE_ORDER.length - 1];
}

/** Stage konten (hadir di halaman siswa & proyektor guru) */
export const INFO_STAGES = ["tujuan", "presentasi", "penutup"] as const;

export const INFO_KONTEN: Record<string, SlideKonten> = {
  tujuan: {
    layout: "content",
    kicker: "Pendahuluan · Tujuan Pembelajaran",
    title: "Hari Ini Kita Akan…",
    sub: "Sampaikan pertanyaanmu jika ada yang belum jelas",
    blocks: [
      { t: "steps", items: [
        "Memahami pengertian persamaan kuadrat dari masalah nyata (pendapatan = biaya)",
        "Memfaktorkan persamaan kuadrat bentuk a = 1 dengan metode T-Faktor",
        "Memfaktorkan persamaan kuadrat bentuk a > 1 dengan Metode AC",
      ] },
      { t: "box", title: "Cara Kita Belajar", v: "Discovery Learning: kalian menemukan polanya sendiri, berdiskusi berpasangan, lalu mempresentasikan hasilnya. Semangat Mindful · Meaningful · Joyful!", tone: "violet" },
      { t: "text", v: "Silakan angkat tangan dan tanyakan hal yang belum jelas sebelum kita mulai." },
    ],
  },
  presentasi: {
    layout: "content",
    kicker: "Fase 5 · Verification (Share)",
    title: "Waktunya Berbagi!",
    sub: "Presentasikan hasil penemuan pasanganmu di depan kelas",
    blocks: [
      { t: "steps", items: [
        "Perwakilan pasangan maju — jelaskan langkah T-Faktor / Metode AC yang kalian pakai",
        "Ceritakan kesulitan yang kalian hadapi dan bagaimana mengatasinya",
        "Pasangan lain menanggapi: bandingkan, adakah cara penyelesaian yang berbeda?",
      ] },
      { t: "box", title: "Etika Presentasi", v: "Dengarkan dengan mindful, tanggapi dengan hormat. Setiap cara yang berbeda adalah kesempatan belajar baru.", tone: "warn" },
      { t: "box", title: "Tugas Pendengar", v: "Catat satu hal baru dari setiap presentasi — bisa jadi itu cara yang lebih cepat!", tone: "info" },
    ],
  },
  penutup: {
    layout: "content",
    kicker: "Penutup · Kesimpulan & Tugas",
    title: "Apa yang Kita Pelajari Hari Ini?",
    sub: "Persamaan kuadrat: variabel berpangkat dua (x^2) — dua senjata faktorisasi",
    blocks: [
      { t: "table", head: ["Aspek", "T-Faktor (a = 1)", "Metode AC (a > 1)"], rows: [
        ["Kunci", "p + q = b, p.q = c", "p x q = a.c, p + q = b"],
        ["Ciri khas", "Langsung dua kurung", "Pecah suku tengah, kelompokkan"],
      ] },
      { t: "box", title: "Kesamaan Keduanya", v: "Sama-sama mencari dua bilangan dari hubungan perkalian dan penjumlahan koefisien.", tone: "info" },
      { t: "box", title: "Penting!", v: "Tidak semua persamaan kuadrat bisa difaktorkan — coba x^2 + 5x + 3 = 0 di LKPD tadi. Pertemuan berikutnya kita pelajari Rumus ABC yang menyelesaikan SEMUA jenis persamaan kuadrat!", tone: "warn" },
      { t: "steps", items: [
        "PR 1:  x^2 + 11x + 24 = 0",
        "PR 2:  x^2 - 13x + 36 = 0",
        "PR 3:  2x^2 + 11x + 5 = 0",
        "TANTANGAN:  x^2 + 3x + 1 = 0",
      ] },
      { t: "box", title: "Apresiasi & Doa", v: "Terima kasih atas kerja keras, keberanian mencoba, dan kejujuran kalian hari ini — termasuk saat ada soal yang belum berhasil. Mari tutup pembelajaran dengan doa bersama.", tone: "success" },
    ],
  },
};
