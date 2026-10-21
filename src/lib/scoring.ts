import type { WorksheetData } from "@/db/schema";
import { normalizeAnswer, numEq, parseNum, setNumEq } from "@/lib/utils";

/* ------------------------------- APERSEPSI ------------------------------- */

export function gradeDiagnostik(
  tipe: string,
  kunci: string,
  jawaban: string
): boolean {
  if (tipe === "terbuka") return false;
  if (tipe === "isian") {
    const k = parseNum(kunci);
    const j = parseNum(jawaban);
    if (k !== null && j !== null) return numEq(k, j);
    return normalizeAnswer(kunci) === normalizeAnswer(jawaban);
  }
  return jawaban.trim().toUpperCase() === kunci.trim().toUpperCase();
}

/* ------------------------------- WORKSHEET ------------------------------- */

export interface WsJawabanInput {
  p?: number | null;
  q?: number | null;
  fb1?: number | null;
  fb2?: number | null;
  x1?: number | null;
  x2?: number | null;
}

export interface WsGradeResult {
  pqBenar: boolean;
  faktorBenar: boolean;
  akarBenar: boolean;
  benar: boolean;
  skor: number;
}

/**
 * Menilai jawaban worksheet.
 * Faktor dinilai lewat ekspansi aljabar: dengan koefisien layar tetap
 * (fa1 x + fb1)(fa2 x + fb2) = fa1.fa2 x^2 + (fa1.fb2 + fa2.fb1) x + fb1.fb2
 */
export function gradeWorksheet(
  data: WorksheetData,
  j: WsJawabanInput,
  hintDipakai: number
): WsGradeResult {
  const pqBenar =
    j.p != null && j.q != null && setNumEq([j.p, j.q], [data.p, data.q]);

  const faktorBenar =
    j.fb1 != null &&
    j.fb2 != null &&
    numEq(j.fb1 * j.fb2, data.c) &&
    numEq(data.fa1 * j.fb2 + data.fa2 * j.fb1, data.b);

  const akarBenar =
    j.x1 != null && j.x2 != null && setNumEq([j.x1, j.x2], [...data.akar]);

  const benar = pqBenar && faktorBenar && akarBenar;

  // Skor parsial: pq 30, faktor 40, akar 30 — tiap hint dipakai mengurangi 8
  let skor = 0;
  if (pqBenar) skor += 30;
  if (faktorBenar) skor += 40;
  if (akarBenar) skor += 30;
  skor = Math.max(0, skor - 8 * Math.min(hintDipakai, 3));

  return { pqBenar, faktorBenar, akarBenar, benar, skor };
}

/* --------------------------------- KUIS ---------------------------------- */

export function gradeKuis(
  tipe: string,
  kunci: string,
  jawaban: string
): boolean {
  if (tipe === "isian") {
    const k = parseNum(kunci);
    const j = parseNum(jawaban);
    if (k !== null && j !== null) return numEq(k, j);
    return normalizeAnswer(kunci) === normalizeAnswer(jawaban);
  }
  return jawaban.trim().toUpperCase() === kunci.trim().toUpperCase();
}
