// LKPD siswa, dipisah Bagian A / B / C (+ kunci khusus guru)

export type LkpdBlok =
  | { tipe: "teks"; v: string }
  | { tipe: "eq"; v: string }
  | { tipe: "soal"; label: string; eq?: string; jalan: number }
  | { tipe: "isian-abc" } // a = __, b = __, c = __
  | { tipe: "bentuk-umum" } // __ x² + __ x + __ = 0 (kosong semua)
  | { tipe: "tfaktor"; c: string; b: string; baris: number }
  | { tipe: "faktor-x" } // (x + __)(x + __) = 0 lalu x = __ atau x = __
  | { tipe: "tabel-pola" }
  | { tipe: "catatan"; v: string };

export interface LkpdPanel {
  no: string;
  judul?: string;
  durasi?: string;
  intro?: string;
  eq?: string;
  blok: LkpdBlok[];
}

export interface LkpdBagian {
  key: "a" | "b" | "c";
  tag: string;
  judul: string;
  durasi: string;
  mode: "think" | "pair" | "share";
  panels: LkpdPanel[];
}

export const LKPD: LkpdBagian[] = [
  {
    key: "a", tag: "BAGIAN A", judul: "Konsep Persamaan Kuadrat", durasi: "6 MENIT", mode: "think",
    panels: [
      {
        no: "Soal 1", judul: "Amati dengan teliti",
        intro: "Perhatikan tiga persamaan berikut:",
        eq: "(i) 3x + 5 = 0     (ii) x^2 + 4x + 3 = 0     (iii) 2x = 8",
        blok: [
          { tipe: "soal", label: "a) Manakah yang merupakan persamaan kuadrat?", jalan: 1 },
          { tipe: "soal", label: "b) Mengapa persamaan lainnya bukan persamaan kuadrat?", jalan: 2 },
        ],
      },
      {
        no: "Soal 2",
        blok: [
          { tipe: "teks", v: "a) Tuliskan bentuk umum persamaan kuadrat:" },
          { tipe: "bentuk-umum" },
          { tipe: "teks", v: "b) Dari persamaan x^2 + 4x + 3 = 0, tentukan nilai a, b, dan c:" },
          { tipe: "isian-abc" },
        ],
      },
      {
        no: "Soal 3",
        intro: "Ubah ke bentuk umum ax^2 + bx + c = 0, lalu tentukan a, b, dan c.",
        blok: [
          { tipe: "eq", v: "a)  2x^2 - 5 = -3x" },
          { tipe: "soal", label: "Bentuk umum:", jalan: 1 },
          { tipe: "isian-abc" },
          { tipe: "eq", v: "b)  x^2 = 9" },
          { tipe: "soal", label: "Bentuk umum:", jalan: 1 },
          { tipe: "isian-abc" },
          { tipe: "eq", v: "c)  x^2 + 3x = 0" },
          { tipe: "soal", label: "Bentuk umum:", jalan: 1 },
          { tipe: "isian-abc" },
        ],
      },
    ],
  },
  {
    key: "b", tag: "BAGIAN B", judul: "T-Faktor untuk a = 1", durasi: "14 MENIT", mode: "think",
    panels: [
      {
        no: "INGAT", judul: "Kunci T-Faktor",
        blok: [
          { tipe: "teks", v: "Untuk memfaktorkan x^2 + bx + c = 0, cari dua bilangan p dan q yang memenuhi:" },
          { tipe: "eq", v: "p x q = c      dan      p + q = b" },
          { tipe: "teks", v: "Lalu tuliskan faktornya: (x + p)(x + q) = 0" },
        ],
      },
      {
        no: "Soal 4", intro: "Faktorkan persamaan berikut:", eq: "x^2 + 5x + 6 = 0",
        blok: [
          { tipe: "tfaktor", c: "6", b: "5", baris: 3 },
          { tipe: "faktor-x" },
        ],
      },
      {
        no: "Soal 5", intro: "Faktorkan persamaan berikut:", eq: "x^2 - 7x + 12 = 0",
        blok: [
          { tipe: "tfaktor", c: "12", b: "-7", baris: 4 },
          { tipe: "faktor-x" },
        ],
      },
      {
        no: "Soal 6", intro: "Faktorkan persamaan berikut:", eq: "x^2 + 2x - 15 = 0",
        blok: [
          { tipe: "tfaktor", c: "-15", b: "2", baris: 4 },
          { tipe: "faktor-x" },
        ],
      },
      {
        no: "Soal 7", judul: "Tantangan, baca teliti", intro: "Faktorkan persamaan berikut:", eq: "x^2 + 5x + 3 = 0",
        blok: [
          { tipe: "tfaktor", c: "3", b: "5", baris: 3 },
          { tipe: "soal", label: "Apakah ada pasangan bilangan bulat yang jumlahnya 5? Tuliskan kesimpulanmu:", jalan: 2 },
        ],
      },
      {
        no: "Soal 8", judul: "Pembuktian",
        intro: "Dari Soal 4 kamu mendapat x = -2 dan x = -3. Buktikan keduanya benar dengan substitusi ke x^2 + 5x + 6 = 0.",
        blok: [
          { tipe: "soal", label: "Untuk x = -2 :", jalan: 2 },
          { tipe: "soal", label: "Untuk x = -3 :", jalan: 2 },
          { tipe: "soal", label: "Kesimpulan, apa arti hasil yang sama dengan nol?", jalan: 1 },
        ],
      },
    ],
  },
  {
    key: "c", tag: "BAGIAN C", judul: "Diskusi Berpasangan & Presentasi", durasi: "12 MENIT", mode: "pair",
    panels: [
      {
        no: "Diskusi 1", judul: "Cek silang jawaban", durasi: "3 MENIT",
        intro: "Bandingkan jawaban Bagian A dan Bagian B dengan teman sebangkumu.",
        blok: [
          { tipe: "soal", label: "Soal yang jawaban kami SAMA:", jalan: 2 },
          { tipe: "soal", label: "Soal yang jawaban kami BEDA, di mana letak kesalahannya?", jalan: 2 },
        ],
      },
      {
        no: "Diskusi 2", judul: "Cari pola T-Faktor", durasi: "3 MENIT",
        intro: "Perhatikan Soal 4, 5, dan 6. Lengkapi tabel berikut bersama pasanganmu.",
        blok: [
          { tipe: "tabel-pola" },
          { tipe: "soal", label: "a) Jika b positif dan c positif, maka tanda p dan q adalah:", jalan: 1 },
          { tipe: "soal", label: "b) Jika b negatif dan c positif, maka tanda p dan q adalah:", jalan: 1 },
          { tipe: "soal", label: "c) Jika c negatif, maka tanda p dan q adalah:", jalan: 1 },
        ],
      },
      {
        no: "Diskusi 3", judul: "Yang tidak bisa difaktorkan", durasi: "2 MENIT",
        intro: "Perhatikan kembali Soal 7, yaitu x^2 + 5x + 3 = 0.",
        blok: [
          { tipe: "soal", label: "a) Mengapa soal ini tidak bisa difaktorkan dengan bilangan bulat?", jalan: 2 },
          { tipe: "soal", label: "b) Apakah persamaan ini tetap punya akar? Jelaskan.", jalan: 2 },
          { tipe: "soal", label: "c) Bagaimana cara mencari akarnya kalau tidak bisa difaktorkan?", jalan: 2 },
        ],
      },
      {
        no: "Catatan Presentasi", judul: "Siapkan sebelum maju", durasi: "4 MENIT",
        blok: [
          { tipe: "soal", label: "1) Pola apa yang kalian temukan dari T-Faktor?", jalan: 3 },
          { tipe: "soal", label: "2) Apa temuan kalian tentang soal yang tidak bisa difaktorkan?", jalan: 3 },
          { tipe: "soal", label: "3) Kesulitan apa yang kalian alami dan bagaimana mengatasinya?", jalan: 3 },
          { tipe: "catatan", v: "Tanggapan dari pasangan lain (diisi saat mendengarkan presentasi teman)" },
        ],
      },
    ],
  },
];

/** Baris tabel pola, hanya baris pertama berisi contoh jawaban */
export const TABEL_POLA = {
  head: ["Persamaan", "b", "c", "Tanda p dan q", "Bentuk Faktor"],
  rows: [
    { eq: "x^2 + 5x + 6 = 0", b: "+5", c: "+6", tanda: "+ , +", faktor: "(x + 2)(x + 3) = 0", contoh: true },
    { eq: "x^2 - 7x + 12 = 0", b: "", c: "", tanda: "", faktor: "", contoh: false },
    { eq: "x^2 + 2x - 15 = 0", b: "", c: "", tanda: "", faktor: "", contoh: false },
  ],
};

export const LKPD_KUNCI: Record<"a" | "b" | "c", [string, string][]> = {
  a: [
    ["1a", "(ii) x^2 + 4x + 3 = 0"],
    ["1b", "(i) dan (iii) pangkat tertinggi x adalah 1, bukan 2"],
    ["2a", "ax^2 + bx + c = 0"],
    ["2b", "a = 1, b = 4, c = 3"],
    ["3a", "2x^2 + 3x - 5 = 0 → a = 2, b = 3, c = -5"],
    ["3b", "x^2 + 0x - 9 = 0 → a = 1, b = 0, c = -9"],
    ["3c", "x^2 + 3x + 0 = 0 → a = 1, b = 3, c = 0"],
  ],
  b: [
    ["4", "p = 2, q = 3 → (x + 2)(x + 3) = 0 → x = -2 atau x = -3"],
    ["5", "p = -3, q = -4 → (x - 3)(x - 4) = 0 → x = 3 atau x = 4"],
    ["6", "p = 5, q = -3 → (x + 5)(x - 3) = 0 → x = -5 atau x = 3"],
    ["7", "Tidak bisa, tidak ada bilangan bulat dengan kali 3 dan jumlah 5"],
    ["8", "x = -2 : 4 - 10 + 6 = 0 · x = -3 : 9 - 15 + 6 = 0 → keduanya akar"],
  ],
  c: [
    ["D2 baris 2", "b = -7, c = +12, tanda ( - , - ), faktor (x - 3)(x - 4) = 0"],
    ["D2 baris 3", "b = +2, c = -15, tanda ( + , - ), faktor (x + 5)(x - 3) = 0"],
    ["D2a", "b positif dan c positif → p dan q keduanya positif"],
    ["D2b", "b negatif dan c positif → p dan q keduanya negatif"],
    ["D2c", "c negatif → p dan q berbeda tanda"],
    ["D3a", "Tidak ada dua bilangan bulat dengan kali 3 dan jumlah 5"],
    ["D3b", "Tetap punya akar, tetapi bukan bilangan bulat"],
    ["D3c", "Pakai melengkapkan kuadrat sempurna atau rumus abc"],
  ],
};
