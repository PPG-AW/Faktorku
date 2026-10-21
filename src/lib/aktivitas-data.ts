import { numEq, parseNum } from "@/lib/utils";

/* ================== FASE 2 BEBAS (layar eksplorasi lama) ================== */

export const COBA = {
  a: 1,
  b: -20,
  c: 75,
  eq: "x^2 - 20x + 75",
  akar: [5, 15] as const,
};

export function hitungCoba(x: number): number {
  return COBA.a * x * x + COBA.b * x + COBA.c;
}

/* ================= SLIDE 9: COBAX PILIHAN ENAM ANGKA ======================= */

export const COBAX = {
  a: 1,
  b: -20,
  c: 75,
  eq: "x^2 - 20x + 75",
  opsi: [1, 3, 5, 10, 15, 20] as const,
  akar: [5, 15] as const,
};

export function hitungCobax(x: number): { hasil: number; benar: boolean } {
  const hasil = Math.round((COBAX.a * x * x + COBAX.b * x + COBAX.c) * 1e9) / 1e9;
  return { hasil, benar: Math.abs(hasil) < 1e-6 };
}

/* ========================= KUIS: POIN KECEPATAN =========================== */

export function poinKuis(urutanBenar: number): number {
  if (urutanBenar === 1) return 20;
  if (urutanBenar === 2) return 18;
  if (urutanBenar === 3) return 16;
  if (urutanBenar === 4) return 14;
  if (urutanBenar === 5) return 12;
  if (urutanBenar <= 10) return 10;
  if (urutanBenar <= 20) return 8;
  if (urutanBenar <= 30) return 6;
  return 4;
}

export const POIN_SALAH = 0;

/* ================== FASE 2 BEBAS / WIZARD ACTIVE STAGE ===================== */

export const WIZARD_STAGE: Record<
  string,
  { label: string; durasi: number; cara: string }
> = {
  "aktivitas-think": {
    label: "THINK — Kerja Mandiri",
    durasi: 20 * 60,
    cara: "Kerjakan LKPD Bagian A & B yang sudah diberikan oleh guru. Fokus mandiri.",
  },
  "aktivitas-pair": {
    label: "PAIR — Diskusi Berpasangan",
    durasi: 12 * 60,
    cara: "Diskusikan LKPD Bagian C yang sudah diberikan oleh guru bersama teman sebangku.",
  },
  "aktivitas-share": {
    label: "SHARE — Presentasi Temuan",
    durasi: 8 * 60,
    cara: "Perhatikan presentasi teman di depan kelas dan catat penjelasan penting dari guru.",
  },
};

/* ================== FASE 3: KLASIFIKASI + TABEL POLA ====================== */

export interface SortItem {
  id: string;
  eq: string;
  bucket: "linear" | "kuadrat";
}

export const SORT_ITEMS: SortItem[] = [
  { id: "s1", eq: "2x + 5 = 0", bucket: "linear" },
  { id: "s2", eq: "x^2 - 3x + 2 = 0", bucket: "kuadrat" },
  { id: "s3", eq: "3(x - 2) = 10", bucket: "linear" },
  { id: "s4", eq: "x^2 = 16", bucket: "kuadrat" },
  { id: "s5", eq: "4x - 12 = 0", bucket: "linear" },
  { id: "s6", eq: "x(x + 2) = 15", bucket: "kuadrat" },
];

export interface PolaRow {
  id: string;
  eq: string;
  p: number;
  q: number;
}

export const POLA_ROWS: PolaRow[] = [
  { id: "p1", eq: "x^2 + 7x + 12 = (x + 3)(x + 4)", p: 3, q: 4 },
  { id: "p2", eq: "x^2 - 7x + 12 = (x - 3)(x - 4)", p: -3, q: -4 },
  { id: "p3", eq: "x^2 + 2x - 15 = (x + 5)(x - 3)", p: 5, q: -3 },
];

export const SORT_TOTAL = SORT_ITEMS.length;
export const POLA_TOTAL = POLA_ROWS.length * 2;

export function gradeSort(jawaban: Record<string, string>): number {
  return SORT_ITEMS.filter((it) => jawaban[it.id] === it.bucket).length;
}

export function gradePola(jawaban: Record<string, { sum: string; prod: string }>): number {
  let benar = 0;
  for (const row of POLA_ROWS) {
    const j = jawaban[row.id];
    if (!j) continue;
    const s = parseNum(String(j.sum ?? ""));
    const pr = parseNum(String(j.prod ?? ""));
    if (s !== null && numEq(s, row.p + row.q)) benar++;
    if (pr !== null && numEq(pr, row.p * row.q)) benar++;
  }
  return benar;
}
