import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(): string {
  return crypto.randomUUID();
}

export function generateKodeKelas(len = 5): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/** Normalisasi jawaban teks untuk perbandingan longgar */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;!]+$/, "")
    .trim();
}

/** Parse angka: mendukung desimal, koma, negatif, dan pecahan "a/b" */
export function parseNum(input: string): number | null {
  const t = input.trim().replace(",", ".").replace(/\s/g, "");
  if (t === "") return null;
  if (/^-?\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  const frac = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (frac) {
    const den = parseFloat(frac[2]);
    if (den !== 0) return parseFloat(frac[1]) / den;
  }
  return null;
}

export function numEq(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) < eps;
}

/** Kebenaran dua himpunan angka (abaikan urutan) */
export function setNumEq(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const used = new Array(b.length).fill(false);
  for (const x of a) {
    let found = false;
    for (let i = 0; i < b.length; i++) {
      if (!used[i] && numEq(x, b[i])) {
        used[i] = true;
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

/** Shuffle deterministik (FNV-1a + mulberry32) — opsi kuis diacak per siswa */
export function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  const rand = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function formatWaktu(detik: number): string {
  const m = Math.floor(detik / 60);
  const s = Math.max(0, Math.floor(detik % 60));
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Tokenizer sederhana untuk word cloud (Bahasa Indonesia) */
const STOPWORDS = new Set([
  "yang","dan","di","ke","dari","untuk","dengan","pada","itu","ini","aku","saya",
  "adalah","karena","saat","ketika","jadi","agar","supaya","atau","tapi","tetapi",
  "sudah","belum","masih","tidak","bukan","bisa","dapat","akan","juga","saja","hanya",
  "nya","ku","mu","kami","kita","dia","ia","mereka","dalam","ada","buat","lalu","kemudian",
  "the","a","an","of","to","in","is","it","saya","yg","dg","dgn","tsb","sdh","blm",
  "kalau","jika","mencari","cara","bagian","paling","sulit","susah","menurut","nggak","ga","gak","enggak",
]);

export function tokenizeForCloud(texts: string[]): { word: string; count: number }[] {
  const freq = new Map<string, number>();
  for (const text of texts) {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9×x²\s-]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
    for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}
