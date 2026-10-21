import { db } from "@/db";
import {
  slide,
  soalDiagnostik,
  soalKuis,
  soalWorksheet,
  type SlideKonten,
  type WorksheetData,
} from "@/db/schema";
import { uid } from "@/lib/utils";

/* ================================ SLIDES ================================= */

const SLIDES: { nomor: number; judul: string; konten: SlideKonten }[] = [
  {
    nomor: 1,
    judul: "Judul",
    konten: {
      layout: "title",
      kicker: "Matematika · Bab Persamaan Kuadrat",
      title: "FAKTORKU",
      sub: "Memfaktorkan Persamaan Kuadrat — dari kisah jualan Rina hingga Metode AC",
      blocks: [
        { t: "eq", v: "ax^2 + bx + c = 0", big: true },
        { t: "text", v: "Hari ini kita belajar memecahkan persamaan kuadrat dengan T-Faktor (a = 1) dan Metode AC (a > 1)." },
      ],
    },
  },
  {
    nomor: 2,
    judul: "Uang Masuk",
    konten: {
      layout: "content",
      kicker: "Kisah Rina · Bagian 1",
      title: "Uang yang Masuk",
      sub: "Rina berjualan keripik pisang buatan ibunya",
      blocks: [
        { t: "text", v: "Setiap bungkus keripik dijual Rp50 ribu... eh, Rp5 ribu! Maksudnya: harga per bungkus = 50 (ratus rupiah). Jika terjual x bungkus, pendapatannya:" },
        { t: "eq", v: "Pendapatan = 50x", big: true },
        { t: "box", title: "Ingat", v: "x adalah banyak bungkus yang terjual. Semakin besar x, semakin besar uang yang masuk.", tone: "info" },
      ],
    },
  },
  {
    nomor: 3,
    judul: "Uang Keluar",
    konten: {
      layout: "content",
      kicker: "Kisah Rina · Bagian 2",
      title: "Uang yang Keluar",
      sub: "Ternyata jualan butuh modal!",
      blocks: [
        { t: "list", items: [
          "Sewa lapak & plastik kemasan: biaya tetap 75 (ratus rupiah)",
          "Biaya bahan per bungkus: 30x",
          "Biaya promosi yang makin mahal saat produksi ramai: x^2",
        ] },
        { t: "eq", v: "Biaya = x^2 + 30x + 75", big: true },
        { t: "box", title: "Perhatikan", v: "Ada suku x^2 di biaya! Inilah yang membuat masalah Rina jadi menarik.", tone: "warn" },
      ],
    },
  },
  {
    nomor: 4,
    judul: "Impas",
    konten: {
      layout: "focus",
      kicker: "Kisah Rina · Bagian 3",
      title: "Kapan Rina Balik Modal?",
      sub: "Titik impas (Break Even Point) terjadi saat pendapatan = biaya",
      blocks: [
        { t: "eq", v: "Pendapatan = Biaya" },
        { t: "arrow", v: "Substitusikan kedua rumus" },
        { t: "eq", v: "50x = x^2 + 30x + 75", big: true },
        { t: "box", title: "Pertanyaan", v: "Berapa bungkus yang harus terjual agar Rina tidak rugi?", tone: "violet" },
      ],
    },
  },
  {
    nomor: 5,
    judul: "Persamaan Rina",
    konten: {
      layout: "focus",
      kicker: "Menyusun Persamaan",
      title: "Persamaan Rina",
      sub: "Pindahkan semua suku ke satu ruas",
      blocks: [
        { t: "steps", items: [
          "50x = x^2 + 30x + 75",
          "0 = x^2 + 30x + 75 - 50x",
          "0 = x^2 - 20x + 75",
        ] },
        { t: "eq", v: "x^2 - 20x + 75 = 0", big: true },
        { t: "box", title: "Jadi", v: "Masalah jualan Rina berubah menjadi sebuah persamaan kuadrat!", tone: "success" },
      ],
    },
  },
  {
    nomor: 6,
    judul: "Ini Persamaan Kuadrat",
    konten: {
      layout: "content",
      kicker: "Konsep Kunci",
      title: "Ini Persamaan Kuadrat",
      sub: "Bentuk umum dan komponennya",
      blocks: [
        { t: "eq", v: "ax^2 + bx + c = 0, a =/= 0", big: true },
        { t: "table", head: ["Koefisien", "Pada x^2 - 20x + 75"], rows: [
          ["a", "1"],
          ["b", "-20"],
          ["c", "75"],
        ] },
        { t: "box", title: "Nama Bagian", v: "a = koefisien x^2, b = koefisien x, c = konstanta. Hati-hati dengan tanda negatif!", tone: "info" },
      ],
    },
  },
  {
    nomor: 7,
    judul: "Cara Coba-coba",
    konten: {
      layout: "content",
      kicker: "Pendekatan Pertama",
      title: "Cara Coba-coba",
      sub: "Bagaimana kalau kita tebak saja nilai x?",
      blocks: [
        { t: "check", eq: "x = 3 : 9 - 60 + 75", result: "= 24 (bukan 0)", ok: false },
        { t: "check", eq: "x = 5 : 25 - 100 + 75", result: "= 0  — cocok!", ok: true },
        { t: "check", eq: "x = 15 : 225 - 300 + 75", result: "= 0  — cocok!", ok: true },
        { t: "box", title: "Masalahnya", v: "Menebak itu lambat dan tidak pasti. Ada berapa nilai yang harus dicoba? Bagaimana kalau jawabannya pecahan?", tone: "warn" },
      ],
    },
  },
  {
    nomor: 8,
    judul: "Cara Sistematis",
    konten: {
      layout: "focus",
      kicker: "Strategi Baru",
      title: "Perlu Cara Sistematis",
      sub: "Pemfaktoran: mengubah jumlah menjadi perkalian",
      blocks: [
        { t: "arrow", v: "Ubah persamaan menjadi bentuk perkalian dua kurung" },
        { t: "eq", v: "x^2 - 20x + 75 = (x - p)(x - q) = 0", big: true },
        { t: "box", title: "Sifat Nol", v: "Jika A x B = 0, maka A = 0 atau B = 0. Inilah kunci mengapa pemfaktoran berhasil!", tone: "violet" },
      ],
    },
  },
  {
    nomor: 9,
    judul: "Ide T-Faktor",
    konten: {
      layout: "content",
      kicker: "Metode 1 · T-Faktor (a = 1)",
      title: "Ide di Balik T-Faktor",
      sub: "Kembangkan (x + p)(x + q)",
      blocks: [
        { t: "eq", v: "(x + p)(x + q) = x^2 + (p + q)x + pq", big: true },
        { t: "steps", items: [
          "Cari dua bilangan p dan q",
          "Syarat 1: p + q = b (koefisien x)",
          "Syarat 2: p x q = c (konstanta)",
        ] },
        { t: "box", title: "Kenapa disebut T-Faktor?", v: "Karena kita menyusun kandidat pasangan faktor dalam tabel berbentuk huruf T.", tone: "info" },
      ],
    },
  },
  {
    nomor: 10,
    judul: "T-Faktor untuk Rina",
    konten: {
      layout: "focus",
      kicker: "Metode 1 · T-Faktor (a = 1)",
      title: "T-Faktor untuk Rina",
      sub: "Cari p dan q untuk x^2 - 20x + 75 = 0",
      blocks: [
        { t: "steps", items: [
          "Butuh p + q = -20",
          "Butuh p x q = 75 (positif!)",
          "Karena hasil kali positif & jumlah negatif, keduanya negatif",
          "Pasangan 75: (-1, -75), (-3, -25), (-5, -15)",
          "Cek jumlah: -5 + (-15) = -20 — cocok!",
        ] },
        { t: "eq", v: "p = -5, q = -15", big: true },
      ],
    },
  },
  {
    nomor: 11,
    judul: "Faktornya",
    konten: {
      layout: "focus",
      kicker: "Metode 1 · T-Faktor (a = 1)",
      title: "Faktor Persamaan Rina",
      sub: "Substitusikan p dan q ke (x + p)(x + q)",
      blocks: [
        { t: "eq", v: "x^2 - 20x + 75 = 0" },
        { t: "arrow", v: "Dengan p = -5 dan q = -15" },
        { t: "eq", v: "(x - 5)(x - 15) = 0", big: true },
        { t: "box", title: "Cek Cepat", v: "(x - 5)(x - 15) = x^2 - 15x - 5x + 75 = x^2 - 20x + 75. Benar!", tone: "success" },
      ],
    },
  },
  {
    nomor: 12,
    judul: "Akar-Akar",
    konten: {
      layout: "focus",
      kicker: "Solusi",
      title: "Akar-Akar Persamaan",
      sub: "Gunakan sifat nol pada setiap faktor",
      blocks: [
        { t: "steps", items: [
          "(x - 5)(x - 15) = 0",
          "x - 5 = 0  maka  x = 5",
          "x - 15 = 0  maka  x = 15",
        ] },
        { t: "eq", v: "x = 5 atau x = 15", big: true },
        { t: "box", title: "Maknanya untuk Rina", v: "Rina balik modal tepat saat menjual 5 bungkus, lalu impas lagi di 15 bungkus karena biaya promosi naik.", tone: "violet" },
      ],
    },
  },
  {
    nomor: 13,
    judul: "Cek Jawaban",
    konten: {
      layout: "content",
      kicker: "Verifikasi",
      title: "Selalu Cek Jawabanmu",
      sub: "Substitusi balik ke persamaan awal",
      blocks: [
        { t: "check", eq: "x = 5 : (5)^2 - 20(5) + 75 = 25 - 100 + 75", result: "= 0", ok: true },
        { t: "check", eq: "x = 15 : (15)^2 - 20(15) + 75 = 225 - 300 + 75", result: "= 0", ok: true },
        { t: "box", title: "Kebiasaan Baik", v: "Pengecekan 10 detik ini menyelamatkanmu dari jawaban yang salah di ujian.", tone: "info" },
      ],
    },
  },
  {
    nomor: 14,
    judul: "Jika a > 1",
    konten: {
      layout: "focus",
      kicker: "Tantangan Baru",
      title: "Bagaimana Jika a Bukan 1?",
      sub: "T-Faktor biasa tidak cukup!",
      blocks: [
        { t: "eq", v: "2x^2 + 7x + 3 = 0", big: true },
        { t: "text", v: "Coba cari p + q = 7 dan p x q = 3... dapat 1 dan 3? Cek: (x + 1)(x + 3) = x^2 + 4x + 3. Bukan 2x^2!" },
        { t: "box", title: "Masalah", v: "Suku 2x^2 harus dipecah jadi (2x)(x). Kita butuh strategi baru: Metode AC.", tone: "warn" },
      ],
    },
  },
  {
    nomor: 15,
    judul: "Metode AC",
    konten: {
      layout: "content",
      kicker: "Metode 2 · Metode AC (a > 1)",
      title: "Metode AC — Langkah Awal",
      sub: "Untuk 2x^2 + 7x + 3 = 0",
      blocks: [
        { t: "steps", items: [
          "Hitung a x c = 2 x 3 = 6",
          "Cari p dan q: p x q = 6 dan p + q = b = 7",
          "Pasangan 6: (1, 6), (2, 3) — cek jumlah: 1 + 6 = 7, cocok!",
          "Pecah suku tengah 7x menjadi 6x + 1x",
        ] },
        { t: "eq", v: "2x^2 + 6x + 1x + 3 = 0", big: true },
      ],
    },
  },
  {
    nomor: 16,
    judul: "Metode AC Lanjut",
    konten: {
      layout: "content",
      kicker: "Metode 2 · Metode AC (a > 1)",
      title: "Kelompokkan, Lalu Faktorkan",
      sub: "Faktorisasi parsial dua-dua",
      blocks: [
        { t: "steps", items: [
          "2x^2 + 6x + 1x + 3 = 0",
          "(2x^2 + 6x) + (x + 3) = 0",
          "2x(x + 3) + 1(x + 3) = 0",
          "(2x + 1)(x + 3) = 0",
        ] },
        { t: "eq", v: "x = -1/2 atau x = -3", big: true },
        { t: "box", title: "Kuncinya", v: "Kedua kelompok harus punya faktor (x + 3) yang sama. Itulah tanda langkahmu benar!", tone: "success" },
      ],
    },
  },
  {
    nomor: 17,
    judul: "Ringkasan",
    konten: {
      layout: "content",
      kicker: "Merangkum",
      title: "Dua Senjata Kita Hari Ini",
      sub: "Pilih sesuai nilai a",
      blocks: [
        { t: "table", head: ["", "T-Faktor (a = 1)", "Metode AC (a > 1)"], rows: [
          ["Kunci", "p + q = b, p.q = c", "p x q = a.c, p + q = b"],
          ["Langkah", "Langsung (x + p)(x + q)", "Pecah suku tengah, kelompokkan"],
          ["Contoh", "x^2 - 20x + 75", "2x^2 + 7x + 3"],
        ] },
        { t: "box", title: "Tips", v: "Selalu akhiri dengan sifat nol untuk mendapatkan akar-akar, lalu cek substitusi balik.", tone: "info" },
      ],
    },
  },
  {
    nomor: 18,
    judul: "Siap Kuis?",
    konten: {
      layout: "closing",
      kicker: "Penutup Bagian Slide",
      title: "Siap Menguji Senjatamu?",
      sub: "Latihan dulu di Worksheet, lalu buktikan di Kuis berhadiah leaderboard!",
      blocks: [
        { t: "eq", v: "(x + p)(x + q) = x^2 + (p + q)x + pq", big: true },
        { t: "text", v: "Ingat cerita Rina: setiap persamaan kuadrat adalah masalah nyata yang menunggu dipecahkan." },
      ],
    },
  },
];

/* ============================ SOAL DIAGNOSTIK ============================ */

const DIAGNOSTIK: {
  nomor: number;
  pertanyaan: string;
  tipe: string;
  opsi?: { A: string; B: string; C: string; D: string };
  kunci: string;
  skor: number;
}[] = [
  {
    nomor: 1,
    pertanyaan: "Nilai x dari 3x + 5 = 20 adalah …",
    tipe: "pg",
    opsi: { A: "x = 3", B: "x = 5", C: "x = 7", D: "x = 15" },
    kunci: "B",
    skor: 20,
  },
  {
    nomor: 2,
    pertanyaan: "Hasil dari (x + 3)(x + 4) adalah …",
    tipe: "pg",
    opsi: { A: "x^2 + 7x + 12", B: "x^2 + 12x + 7", C: "x^2 + 7x + 7", D: "x^2 + 12x + 12" },
    kunci: "A",
    skor: 20,
  },
  {
    nomor: 3,
    pertanyaan: "Pasangan faktor dari 12 yang jumlahnya 7 adalah …",
    tipe: "pg",
    opsi: { A: "2 dan 6", B: "3 dan 4", C: "1 dan 12", D: "3 dan 5" },
    kunci: "B",
    skor: 20,
  },
  {
    nomor: 4,
    pertanyaan: "Bentuk faktor dari x^2 - 9 adalah …",
    tipe: "pg",
    opsi: { A: "(x - 3)(x - 3)", B: "(x + 3)(x - 3)", C: "(x - 9)(x + 1)", D: "(x + 9)(x - 1)" },
    kunci: "B",
    skor: 20,
  },
  {
    nomor: 5,
    pertanyaan: "Jika x = -2, nilai dari x^2 + 3x + 2 adalah …",
    tipe: "pg",
    opsi: { A: "0", B: "4", C: "-4", D: "12" },
    kunci: "A",
    skor: 20,
  },
  {
    nomor: 6,
    pertanyaan: "Manakah yang merupakan persamaan kuadrat?",
    tipe: "pg",
    opsi: { A: "2x + 5 = 0", B: "x^2 - 3x + 2 = 0", C: "x^3 - 1 = 0", D: "4x = 7" },
    kunci: "B",
    skor: 20,
  },
  {
    nomor: 7,
    pertanyaan: "Hasil pengembangan 5(x - 2) adalah …",
    tipe: "pg",
    opsi: { A: "5x - 2", B: "5x - 10", C: "x - 10", D: "5x + 10" },
    kunci: "B",
    skor: 20,
  },
  {
    nomor: 8,
    pertanyaan: "Pernahkah kamu berjualan atau berdagang? Misalnya jualan makanan, pulsa, atau online shop. Ceritakan singkat pengalamanmu!",
    tipe: "terbuka",
    kunci: "",
    skor: 0,
  },
];

/* ============================= SOAL WORKSHEET ============================ */

const WORKSHEET: {
  nomor: number;
  pertanyaan: string;
  tipe: string;
  timer: number;
  data: WorksheetData;
}[] = [
  {
    nomor: 1,
    pertanyaan: "Faktorkan: x^2 + 7x + 12 = 0",
    tipe: "t-faktor",
    timer: 180,
    data: {
      a: 1, b: 7, c: 12, p: 3, q: 4,
      fa1: 1, fb1: 3, fa2: 1, fb2: 4,
      akar: [-3, -4],
      hint: [
        "Tuliskan semua pasangan faktor dari c = 12: (1,12), (2,6), (3,4).",
        "Pasangan mana yang jumlahnya b = 7? Coba jumlahkan tiap pasangan.",
        "p = 3 dan q = 4 karena 3 x 4 = 12 dan 3 + 4 = 7. Faktornya (x + 3)(x + 4).",
      ],
    },
  },
  {
    nomor: 2,
    pertanyaan: "Faktorkan: x^2 - 7x + 12 = 0",
    tipe: "t-faktor",
    timer: 180,
    data: {
      a: 1, b: -7, c: 12, p: -3, q: -4,
      fa1: 1, fb1: -3, fa2: 1, fb2: -4,
      akar: [3, 4],
      hint: [
        "Hasil kali positif (12) tetapi jumlah negatif (-7). Apa artinya tanda kedua bilangan?",
        "Kedua bilangan harus negatif: coba (-3) dan (-4).",
        "(-3) x (-4) = 12 dan (-3) + (-4) = -7. Faktornya (x - 3)(x - 4), akarnya x = 3 atau x = 4.",
      ],
    },
  },
  {
    nomor: 3,
    pertanyaan: "Faktorkan dengan Metode AC: 2x^2 + 7x + 3 = 0",
    tipe: "metode-ac",
    timer: 300,
    data: {
      a: 2, b: 7, c: 3, p: 6, q: 1,
      fa1: 2, fb1: 1, fa2: 1, fb2: 3,
      akar: [-0.5, -3],
      hint: [
        "Karena a = 2, hitung dulu a x c = 2 x 3 = 6. Cari p, q dengan p x q = 6 dan p + q = 7.",
        "p = 6 dan q = 1. Pecah 7x menjadi 6x + 1x:  2x^2 + 6x + 1x + 3.",
        "Kelompokkan: 2x(x + 3) + 1(x + 3) = (2x + 1)(x + 3). Akar: x = -1/2 atau x = -3.",
      ],
    },
  },
];

/* =============================== SOAL KUIS =============================== */

const KUIS: {
  nomor: number;
  pertanyaan: string;
  tipe: string;
  opsi?: { A: string; B: string; C: string; D: string };
  kunci: string;
  timer: number;
  skor: number;
}[] = [
  {
    nomor: 1,
    pertanyaan: "Faktorkan: x^2 - 7x + 12 = 0",
    tipe: "pg",
    opsi: {
      A: "(x - 2)(x - 6) = 0",
      B: "(x - 3)(x - 4) = 0",
      C: "(x + 3)(x + 4) = 0",
      D: "(x - 1)(x - 12) = 0",
    },
    kunci: "B",
    timer: 60,
    skor: 25,
  },
  {
    nomor: 2,
    pertanyaan: "Akar-akar dari x^2 + 7x + 12 = 0 adalah …",
    tipe: "pg",
    opsi: {
      A: "x = 3 atau x = 4",
      B: "x = -3 atau x = 4",
      C: "x = -3 atau x = -4",
      D: "x = 3 atau x = -4",
    },
    kunci: "C",
    timer: 60,
    skor: 25,
  },
  {
    nomor: 3,
    pertanyaan: "Faktorkan dengan Metode AC: 2x^2 + 7x + 3 = 0",
    tipe: "pg",
    opsi: {
      A: "(2x + 3)(x + 1) = 0",
      B: "(2x + 1)(x + 3) = 0",
      C: "(x + 1)(x + 3) = 0",
      D: "(2x - 1)(x - 3) = 0",
    },
    kunci: "B",
    timer: 90,
    skor: 25,
  },
  {
    nomor: 4,
    pertanyaan: "Ingat kisah Rina! Dari x^2 - 20x + 75 = 0, Rina impas saat menjual …",
    tipe: "pg",
    opsi: {
      A: "5 atau 20 bungkus",
      B: "15 atau 25 bungkus",
      C: "5 atau 15 bungkus",
      D: "3 atau 25 bungkus",
    },
    kunci: "C",
    timer: 60,
    skor: 25,
  },
  {
    nomor: 5,
    pertanyaan: "Faktorkan x^2 - 5x + 6 = 0. Tuliskan akar yang TERKECIL (angka saja).",
    tipe: "isian",
    kunci: "2",
    timer: 75,
    skor: 25,
  },
];

/* ============================== SEED ENGINE ============================== */

let seedPromise: Promise<void> | null = null;

/** Idempotent — mengisi konten soal & slide jika tabel masih kosong */
export async function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await db.select({ id: slide.id }).from(slide).limit(1);
      if (existing.length > 0) return;
      const now = new Date();
      void now;
      await db.insert(slide).values(
        SLIDES.map((s) => ({ id: uid(), nomor: s.nomor, judul: s.judul, konten: s.konten }))
      );
      await db.insert(soalDiagnostik).values(
        DIAGNOSTIK.map((s) => ({
          id: uid(),
          nomor: s.nomor,
          pertanyaan: s.pertanyaan,
          opsi: s.opsi ?? null,
          kunci: s.kunci,
          tipe: s.tipe,
          skor: s.skor,
        }))
      );
      await db.insert(soalWorksheet).values(
        WORKSHEET.map((s) => ({
          id: uid(),
          nomor: s.nomor,
          pertanyaan: s.pertanyaan,
          tipe: s.tipe,
          timer: s.timer,
          data: s.data,
        }))
      );
      await db.insert(soalKuis).values(
        KUIS.map((s) => ({
          id: uid(),
          nomor: s.nomor,
          pertanyaan: s.pertanyaan,
          opsi: s.opsi ?? null,
          kunci: s.kunci,
          tipe: s.tipe,
          timer: s.timer,
          skor: s.skor,
        }))
      );
    })().catch((e) => {
      seedPromise = null;
      throw e;
    });
  }
  await seedPromise;
}
