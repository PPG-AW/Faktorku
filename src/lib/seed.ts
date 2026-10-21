import { db } from "@/db";
import { slide, soalKuis, soalDiagnostik, soalWorksheet, type SlideKonten } from "@/db/schema";
import { uid } from "@/lib/utils";

/* ================== SLIDE MATERI, PERSIS MODUL AJAR (T-Faktor a=1) ================== */

const SLIDES: { nomor: number; judul: string; konten: SlideKonten }[] = [
  {
    nomor: 1, judul: "Judul",
    konten: {
      layout: "title",
      kicker: "Matematika · Kelas X AKL · Fase E",
      title: "PERSAMAAN KUADRAT",
      sub: "Pemfaktoran T-Faktor untuk a = 1, lewat kisah usaha sablon kaos Rina",
      blocks: [
        { t: "eq", v: "ax^2 + bx + c = 0", big: true },
        { t: "text", v: "Discovery Learning + Think-Pair-Share · 90 menit" },
      ],
    },
  },
  {
    nomor: 2, judul: "Judul Materi",
    konten: {
      layout: "focus",
      kicker: "Pendahuluan",
      title: "Selamat Datang, Kelas X AKL!",
      sub: "Satu jam ke depan kita adalah peneliti bisnis Rina",
      blocks: [
        { t: "text", v: "Hari ini kita tidak sekadar menghafal rumus. Kita menyelidiki kapan seorang pedagang sablon kaos bernama Rina balik modal." },
        { t: "eq", v: "(x + p)(x + q) = x^2 + (p + q)x + pq", big: true },
        { t: "box", title: "Mindful · Meaningful · Joyful", v: "Siapkan HP-mu, ikuti sinyal layar, dan siap jadi detektif matematika.", tone: "info" },
      ],
    },
  },
  {
    nomor: 3, judul: "Data Usaha Rina",
    konten: {
      layout: "content",
      kicker: "Sintaks 1 · Stimulation",
      title: "Kasus Usaha Sablon Kaos Rina",
      sub: "Rina memproduksi x kaos per minggu. Setiap angka ini adalah bukti.",
      blocks: [
        { t: "table", head: ["Keterangan", "Nilai"], rows: [
          ["Harga jual per kaos", "50 ribu"],
          ["Biaya bahan per kaos", "30 ribu"],
          ["Biaya tenaga kerja per kaos", "x ribu"],
          ["Biaya tetap per minggu (sewa, listrik)", "75 ribu"],
        ] },
        { t: "box", title: "Pertanyaan Pemantik", v: "Dari data ini, bisa tidak kita menentukan Rina untung atau rugi? Pilih di HP-mu!", tone: "warn" },
      ],
    },
  },
  {
    nomor: 4, judul: "Konsep Titik Impas",
    konten: {
      layout: "focus",
      kicker: "Sintaks 2 · Problem Statement",
      title: "Apa itu Titik Impas?",
      sub: "Kondisi di mana uang masuk = uang keluar",
      blocks: [
        { t: "big", v: "Hasilnya NOL, tidak untung, tidak rugi." },
        { t: "eq", v: "Uang masuk − Uang keluar = 0", big: true },
        { t: "box", title: "Kegunaan", v: "Mengetahui jumlah minimal yang harus dijual supaya modal kembali. Ingat kata NANDD, NOL dan PERSAMAAN KUADRAT.", tone: "violet" },
      ],
    },
  },
  {
    nomor: 5, judul: "Uang Masuk Rina",
    konten: {
      layout: "focus",
      kicker: "Uang Masuk",
      title: "Pendapatan Rina",
      sub: "50 ribu per kaos dikali x kaos",
      blocks: [
        { t: "eq", v: "Pendapatan = 50x ribu", big: true },
        { t: "text", v: "Semakin banyak x, semakin besar uang yang masuk." },
      ],
    },
  },
  {
    nomor: 6, judul: "Uang Keluar Rina",
    konten: {
      layout: "content",
      kicker: "Uang Keluar",
      title: "Biaya Rina",
      sub: "Bahan + tenaga kerja + biaya tetap",
      blocks: [
        { t: "steps", items: [
          "Bahan: 30 x x = 30x ribu",
          "Tenaga kerja: x x x = x^2 ribu ← biaya per kaos (x) dikali jumlah kaos (x)",
          "Biaya tetap: 75 ribu",
        ] },
        { t: "eq", v: "Biaya = x^2 + 30x + 75 ribu", big: true },
        { t: "box", title: "Kunci", v: "Perhatikan x x x menghasilkan x^2, inilah yang membuat masalah Rina menjadi persamaan kuadrat!", tone: "warn" },
      ],
    },
  },
  {
    nomor: 7, judul: "Titik Impas → Persamaan Kuadrat",
    konten: {
      layout: "focus",
      kicker: "Titik Impas Rina",
      title: "Pembentukan Persamaan",
      sub: "Uang masuk = Uang keluar",
      blocks: [
        { t: "steps", items: [
          "50x = x^2 + 30x + 75",
          "0 = x^2 + 30x - 50x + 75",
          "0 = x^2 - 20x + 75",
        ] },
        { t: "eq", v: "x^2 - 20x + 75 = 0", big: true },
        { t: "box", title: "Persamaan Kuadrat!", v: "dengan a = 1, b = -20, c = 75. Inilah yang harus dipecahkan hari ini.", tone: "success" },
      ],
    },
  },
  {
    nomor: 8, judul: "Pertanyaan Besar",
    konten: {
      layout: "focus",
      kicker: "Pemantik Nilai x",
      title: "Berapa Nilai x?",
      sub: "yang membuat x^2 - 20x + 75 = 0",
      blocks: [
        { t: "eq", v: "x^2 - 20x + 75 = 0", big: true },
        { t: "text", v: "Artinya: berapa kaos yang harus Rina jual supaya balik modal?" },
        { t: "box", title: "Coba Tebak!", v: "Slide berikutnya adalah tebak-tebakan, buktikan intuisimu di HP!", tone: "warn" },
      ],
    },
  },
  {
    nomor: 9, judul: "CobaX, Tebak Nilai x",
    konten: {
      layout: "focus",
      kicker: "CobaX Interaktif",
      title: "Pilih Satu Angka!",
      sub: "yang membuat persamaan ini NOL",
      blocks: [
        { t: "eq", v: "x^2 - 20x + 75 = 0", big: true },
        { t: "steps", items: [
          "[  1 ]   [  3 ]   [  5 ]",
          "[ 10 ]   [ 15 ]   [ 20 ]",
        ] },
        { t: "box", title: "Tap di HP-mu", v: "Diagram tebakan kelas muncul real-time di proyektor. Guru akan membuka jawabannya bersama-sama.", tone: "violet" },
      ],
    },
  },
  {
    nomor: 10, judul: "THINK, Kerja Mandiri",
    konten: {
      layout: "focus",
      kicker: "LKPD · THINK",
      title: "Waktunya Berpikir Sendiri",
      sub: "Buka LKPD Bagian A & B, 20 menit",
      blocks: [
        { t: "steps", items: [
          "Bagian A (6'): konsep, bedakan linear vs kuadrat, bentuk umum + a,b,c, ubah ke bentuk umum",
          "Bagian B (14'): T-Faktor, cari dua bilangan, tulis faktor, tentukan x, substitusi bukti",
        ] },
        { t: "box", title: "Fokus", v: "Kerjakan sendiri tanpa diskusi. Jika bingung, tanyakan guru, bukan temanmu.", tone: "info" },
      ],
    },
  },
  {
    nomor: 11, judul: "PAIR, Diskusi",
    konten: {
      layout: "focus",
      kicker: "LKPD · PAIR",
      title: "Diskusi Berpasangan",
      sub: "Teman sebangku, 10 menit",
      blocks: [
        { t: "steps", items: [
          "Cek silang jawaban Bagian B dengan teman sebangku",
          "Cari pola tanda: bagaimana tanda b dan c menentukan tanda di faktor?",
          "Bahas: mengapa x^2 + 5x + 3 tidak bisa difaktorkan?",
        ] },
        { t: "box", title: "Kerja Sama", v: "Satu LKPD cukup untuk berdua. Catat temuan kalian, bisa jadi kalian yang presentasi!", tone: "info" },
      ],
    },
  },
  {
    nomor: 12, judul: "SHARE, Presentasi",
    konten: {
      layout: "focus",
      kicker: "SHARE",
      title: "Waktunya Berbagi!",
      sub: "Pasangan terpilih menjelaskan pola T-Faktor di depan kelas",
      blocks: [
        { t: "steps", items: [
          "Jalankan pola tanda yang kalian temukan dari tabel",
          "Jelaskan temuanmu tentang soal yang tidak bisa difaktorkan",
          "Ceritakan kesulitanmu dan bagaimana kalian mengatasinya",
        ] },
        { t: "box", title: "Etika Presentasi", v: "Dengarkan dengan mindful, tanggapi dengan hormat. Setiap cara berbeda adalah pelajaran baru.", tone: "warn" },
      ],
    },
  },
  {
    nomor: 13, judul: "Langkah T-Faktor",
    konten: {
      layout: "content",
      kicker: "Sintaks 6 · Generalization",
      title: "5 Langkah T-Faktor",
      sub: "Contoh: x^2 + 5x + 6 = 0",
      blocks: [
        { t: "steps", items: [
          "Langkah 1: Tentukan a, b, c → a = 1, b = 5, c = 6",
          "Langkah 2: Cari dua bilangan → p x q = 6, p + q = 5 → p = 2, q = 3",
          "Langkah 3: Tulis bentuk faktor → (x + 2)(x + 3) = 0",
          "Langkah 4: Tentukan nilai x → x = -2 atau x = -3",
          "Langkah 5: Cek substitusi → (-2)^2 + 5(-2) + 6 = 4 - 10 + 6 = 0 ✓",
        ] },
        { t: "box", title: "INGAT", v: "p x q = c dan p + q = b. Selalu cek substitusi, 10 detik penyelamat jawabanmu!", tone: "success" },
      ],
    },
  },
  {
    nomor: 14, judul: "Pola Tanda T-Faktor",
    konten: {
      layout: "content",
      kicker: "Generalization",
      title: "Pola Tanda",
      sub: "Tanda b dan c menentukan tanda p dan q",
      blocks: [
        { t: "table", head: ["Tanda b", "Tanda c", "Tanda p, q", "Bentuk Faktor"], rows: [
          ["b +", "c +", "(+, +)", "(x + p)(x + q)"],
          ["b -", "c +", "(-, -)", "(x - p)(x - q)"],
          ["b +", "c -", "(+, -)", "(x + p)(x - q)"],
          ["b -", "c -", "(-, +)", "(x - p)(x + q)"],
        ] },
        { t: "box", title: "Rumus Cepat", v: "c+ dan b+ → kedua positif; c+ dan b− → kedua negatif; c− → beda tanda.", tone: "info" },
      ],
    },
  },
  {
    nomor: 15, judul: "Soal yang Tidak Bisa Difaktorkan",
    konten: {
      layout: "focus",
      kicker: "Batasan T-Faktor",
      title: "x^2 + 5x + 3 = 0",
      sub: "coba cari dua bilangan dengan kali = 3 dan jumlah = 5",
      blocks: [
        { t: "check", eq: "1 x 3 = 3", result: "1 + 3 = 4 ≠ 5", ok: false },
        { t: "check", eq: "(-1) x (-3) = 3", result: "-1 + (-3) = -4 ≠ 5", ok: false },
        { t: "box", title: "Kesimpulan", v: "Tidak selalu bisa difaktorkan dengan bilangan bulat. Pertemuan depan kita pelajari Rumus ABC!", tone: "warn" },
      ],
    },
  },
  {
    nomor: 16, judul: "Kuis Kompetisi",
    konten: {
      layout: "focus",
      kicker: "Kuis",
      title: "Kuis 10 Menit!",
      sub: "5 soal, poin kecepatan",
      blocks: [
        { t: "eq", v: "Poin: 1st=20, 2nd=18, 3rd=16, 4th=14, 5th=12", big: true },
        { t: "text", v: "Tunggu guru menekan Mulai, soal muncul serempak di semua HP. Jangan curang!" },
      ],
    },
  },
  {
    nomor: 17, judul: "Leaderboard",
    konten: {
      layout: "focus",
      kicker: "Hasil Kuis",
      title: "Leaderboard Kelas",
      sub: "peringkat yang terus hidup",
      blocks: [
        { t: "text", v: "Peringkat teratas, benar tersulit, dan rata-rata kelas, semua diproyeksikan langsung." },
        { t: "box", title: "Soal Tersulit", v: "Biasanya soal substitusi / pembuktian akar. Pelajari lagi ya!", tone: "info" },
      ],
    },
  },
  {
    nomor: 18, judul: "Penutup: Kesimpulan & Doa",
    konten: {
      layout: "closing",
      kicker: "Kegiatan Penutup",
      title: "Apa yang Kita Pelajari Hari Ini?",
      sub: "T-Faktor a = 1: dua bilangan, perkalian, penjumlahan, substitusi",
      blocks: [
        { t: "steps", items: [
          "Pemfaktoran adalah kebalikan perkalian aljabar.",
          "T-Faktor: cari dua bilangan dengan p × q = c dan p + q = b.",
          "Persamaan kuadrat bisa punya dua akar, satu akar, atau tidak bisa difaktorkan bilangan bulat.",
          "Buktikan kebenaran akar melalui substitusi ke persamaan awal.",
        ] },
        { t: "box", title: "Sebelum Pulang", v: "Mari tutup dengan doa bersama. Sampai jumpa pada materi Rumus ABC!", tone: "success" },
      ],
    },
  },
];

/* ================= SOAL APERSEPSI (mandiri, sesuai Modul D, opsi A-E) ============== */

const APERSEPSI: {
  nomor: number; pertanyaan: string; tipe: string;
  opsi: { A: string; B: string; C: string; D: string; E: string };
  kunci: string; skor: number;
}[] = [
  {
    nomor: 1,
    pertanyaan: "Masih ingat cara mengalikan dua bentuk aljabar? Coba kerjakan perkalian ini. Berapa hasilnya?||(x + 3)(x + 5)",
    tipe: "pg",
    opsi: {
      A: "x^2 + 8x + 15",
      B: "x^2 + 15x + 8",
      C: "x^2 + 8x + 8",
      D: "x^2 + 2x + 15",
      E: "x^2 + 15x + 15",
    },
    kunci: "A", skor: 20,
  },
  {
    nomor: 2,
    pertanyaan: "Tadi kita mengalikan dua kurung menjadi satu bentuk. Sekarang kita balik arahnya. Dua bilangan apa yang tepat mengisi titik-titik berikut?||x^2 + 8x + 15 = (x + ...)(x + ...)",
    tipe: "pg",
    opsi: {
      A: "1 dan 15",
      B: "3 dan 5",
      C: "4 dan 4",
      D: "2 dan 6",
      E: "5 dan 5",
    },
    kunci: "B", skor: 20,
  },
  {
    nomor: 3,
    pertanyaan: "Supaya bisa membalik perkalian, kita perlu terbiasa mencari pasangan bilangan. Pasangan mana yang hasil kalinya 15 dan hasil jumlahnya 8?",
    tipe: "pg",
    opsi: {
      A: "1 dan 15",
      B: "3 dan 5",
      C: "2 dan 6",
      D: "4 dan 4",
      E: "-3 dan -5",
    },
    kunci: "B", skor: 20,
  },
  {
    nomor: 4,
    pertanyaan: "Sekarang yang sedikit lebih menantang karena memuat bilangan negatif. Pasangan mana yang hasil kalinya -12 dan hasil jumlahnya 1?",
    tipe: "pg",
    opsi: {
      A: "3 dan -4",
      B: "-3 dan 4",
      C: "4 dan -3",
      D: "6 dan -2",
      E: "-6 dan 2",
    },
    kunci: "C", skor: 20,
  },
  {
    nomor: 5,
    pertanyaan: "Kegiatan membalik bentuk perkalian seperti tadi punya nama khusus dalam matematika. Apa nama kegiatan itu?",
    tipe: "pg",
    opsi: {
      A: "Pemfaktoran",
      B: "Pengumpulan suku",
      C: "Substitusi",
      D: "Eliminasi",
      E: "Distribusi aljabar",
    },
    kunci: "A", skor: 20,
  },
];

/* ====================== KUIS (5 soal, pilihan ganda A-E) ====================== */

const KUIS: {
  nomor: number; paket: number; pertanyaan: string; tipe: string;
  opsi: { A: string; B: string; C: string; D: string; E: string };
  kunci: string; timer: number; skor: number;
}[] = [
  // ---------- PAKET 1 (utama) ----------
  {
    nomor: 1, paket: 1,
    pertanyaan: "Manakah di bawah ini yang merupakan persamaan kuadrat?",
    tipe: "pg",
    opsi: {
      A: "2x + 3 = 0",
      B: "x^2 - 4 = 0",
      C: "5x = 10",
      D: "x + 7 = 0",
      E: "3x - 8 = 4",
    },
    kunci: "B", timer: 120, skor: 20,
  },
  {
    nomor: 2, paket: 1,
    pertanyaan: "Jika persamaan x^2 = 9 diubah ke bentuk umum ax^2 + bx + c = 0, berapakah nilai berturut-turut a, b, dan c?",
    tipe: "pg",
    opsi: {
      A: "a = 1, b = 9, c = 0",
      B: "a = 1, b = -9, c = 0",
      C: "a = 1, b = 0, c = -9",
      D: "a = 1, b = 0, c = 9",
      E: "a = 0, b = 1, c = -9",
    },
    kunci: "C", timer: 120, skor: 20,
  },
  {
    nomor: 3, paket: 1,
    pertanyaan: "Bentuk pemfaktoran dari x^2 + 7x + 12 = 0 adalah...",
    tipe: "pg",
    opsi: {
      A: "(x + 1)(x + 12) = 0",
      B: "(x + 2)(x + 6) = 0",
      C: "(x + 3)(x + 4) = 0",
      D: "(x - 3)(x - 4) = 0",
      E: "(x - 2)(x - 6) = 0",
    },
    kunci: "C", timer: 120, skor: 20,
  },
  {
    nomor: 4, paket: 1,
    pertanyaan: "Akar-akar penyelesaian dari persamaan (x - 2)(x - 5) = 0 adalah...",
    tipe: "pg",
    opsi: {
      A: "x = -2 atau x = -5",
      B: "x = 2 atau x = -5",
      C: "x = -2 atau x = 5",
      D: "x = 2 atau x = 5",
      E: "x = 0 atau x = 10",
    },
    kunci: "D", timer: 120, skor: 20,
  },
  {
    nomor: 5, paket: 1,
    pertanyaan: "Jika x = 5 disubstitusikan ke dalam persamaan x^2 - 20x + 75 = 0, pembuktian yang benar adalah...",
    tipe: "pg",
    opsi: {
      A: "25 - 100 + 75 = 0 (Terbukti benar)",
      B: "25 + 100 + 75 = 200 (Tidak terbukti)",
      C: "10 - 100 + 75 = -15 (Tidak terbukti)",
      D: "25 - 20 + 75 = 80 (Tidak terbukti)",
      E: "5 - 100 + 75 = -20 (Tidak terbukti)",
    },
    kunci: "A", timer: 120, skor: 20,
  },

  // ---------- PAKET 2 (cadangan) ----------
  {
    nomor: 1, paket: 2,
    pertanyaan: "Manakah di bawah ini yang BUKAN merupakan persamaan kuadrat?",
    tipe: "pg",
    opsi: {
      A: "x^2 + 2x = 0",
      B: "4x - 9 = 0",
      C: "x^2 = 16",
      D: "x^2 - 5x + 6 = 0",
      E: "2x^2 - 8 = 0",
    },
    kunci: "B", timer: 120, skor: 20,
  },
  {
    nomor: 2, paket: 2,
    pertanyaan: "Bentuk umum ax^2 + bx + c = 0 dari 3x^2 - 7 = 2x memiliki nilai berturut-turut a, b, dan c yaitu...",
    tipe: "pg",
    opsi: {
      A: "a = 3, b = 2, c = -7",
      B: "a = 3, b = -2, c = 7",
      C: "a = 3, b = -2, c = -7",
      D: "a = -3, b = 2, c = 7",
      E: "a = 3, b = -7, c = 2",
    },
    kunci: "C", timer: 120, skor: 20,
  },
  {
    nomor: 3, paket: 2,
    pertanyaan: "Bentuk pemfaktoran dari x^2 + 9x + 20 = 0 adalah...",
    tipe: "pg",
    opsi: {
      A: "(x + 2)(x + 10) = 0",
      B: "(x + 4)(x + 5) = 0",
      C: "(x - 4)(x - 5) = 0",
      D: "(x + 1)(x + 20) = 0",
      E: "(x - 2)(x - 10) = 0",
    },
    kunci: "B", timer: 120, skor: 20,
  },
  {
    nomor: 4, paket: 2,
    pertanyaan: "Akar-akar penyelesaian dari persamaan (x + 6)(x - 1) = 0 adalah...",
    tipe: "pg",
    opsi: {
      A: "x = 6 atau x = -1",
      B: "x = -6 atau x = -1",
      C: "x = 6 atau x = 1",
      D: "x = -6 atau x = 1",
      E: "x = 0 atau x = 6",
    },
    kunci: "D", timer: 120, skor: 20,
  },
  {
    nomor: 5, paket: 2,
    pertanyaan: "Jika x = 3 disubstitusikan ke persamaan x^2 - 8x + 15 = 0, langkah pembuktian yang benar adalah...",
    tipe: "pg",
    opsi: {
      A: "6 - 24 + 15 = -3 (Salah)",
      B: "9 - 24 + 15 = 0 (Terbukti benar)",
      C: "9 + 24 + 15 = 48 (Salah)",
      D: "9 - 8 + 15 = 16 (Salah)",
      E: "3 - 24 + 15 = -6 (Salah)",
    },
    kunci: "B", timer: 120, skor: 20,
  },

  // ---------- PAKET 3 (cadangan kedua) ----------
  {
    nomor: 1, paket: 3,
    pertanyaan: "Pada persamaan kuadrat x^2 - 6x + 8 = 0, berapakah nilai koefisien b?",
    tipe: "pg",
    opsi: {
      A: "1",
      B: "-6",
      C: "6",
      D: "8",
      E: "-8",
    },
    kunci: "B", timer: 120, skor: 20,
  },
  {
    nomor: 2, paket: 3,
    pertanyaan: "Ubah x^2 + 4x = 12 ke bentuk umum. Nilai berturut-turut a, b, dan c adalah...",
    tipe: "pg",
    opsi: {
      A: "a = 1, b = 4, c = 12",
      B: "a = 1, b = -4, c = -12",
      C: "a = 1, b = 4, c = -12",
      D: "a = 1, b = -12, c = 4",
      E: "a = 4, b = 1, c = -12",
    },
    kunci: "C", timer: 120, skor: 20,
  },
  {
    nomor: 3, paket: 3,
    pertanyaan: "Bentuk pemfaktoran dari x^2 - 5x - 14 = 0 adalah...",
    tipe: "pg",
    opsi: {
      A: "(x - 7)(x + 2) = 0",
      B: "(x + 7)(x - 2) = 0",
      C: "(x - 7)(x - 2) = 0",
      D: "(x + 14)(x - 1) = 0",
      E: "(x - 14)(x + 1) = 0",
    },
    kunci: "A", timer: 120, skor: 20,
  },
  {
    nomor: 4, paket: 3,
    pertanyaan: "Akar-akar penyelesaian dari persamaan (x - 8)(x + 3) = 0 adalah...",
    tipe: "pg",
    opsi: {
      A: "x = -8 atau x = 3",
      B: "x = 8 atau x = -3",
      C: "x = -8 atau x = -3",
      D: "x = 8 atau x = 3",
      E: "x = 0 atau x = -24",
    },
    kunci: "B", timer: 120, skor: 20,
  },
  {
    nomor: 5, paket: 3,
    pertanyaan: "Buktikan apakah x = 2 adalah akar dari x^2 - 5x + 6 = 0 melalui substitusi:",
    tipe: "pg",
    opsi: {
      A: "4 - 10 + 6 = 0 (Terbukti benar)",
      B: "4 + 10 + 6 = 20 (Salah)",
      C: "2 - 10 + 6 = -2 (Salah)",
      D: "4 - 5 + 6 = 5 (Salah)",
      E: "8 - 10 + 6 = 4 (Salah)",
    },
    kunci: "A", timer: 120, skor: 20,
  },
];

/* ========================= WORKSHEET HARD CODE (T-Faktor a=1) ============= */

const WORKSHEET = [
  { nomor: 1, pertanyaan: "Faktorkan: x^2 + 5x + 6 = 0 (T-Faktor)", tipe: "t-faktor", timer: 180,
    data: { a: 1, b: 5, c: 6, p: 2, q: 3, fa1: 1, fb1: 2, fa2: 1, fb2: 3, akar: [-2, -3] as [number, number],
      hint: ["c = 6. Pasangan faktor: (1,6) → jumlah 7? (2,3) → jumlah?", "2 x 3 = 6 dan 2 + 3 = 5", "p = 2, q = 3 → (x+2)(x+3) = 0 → x = -2 atau x = -3"] } },
  { nomor: 2, pertanyaan: "Faktorkan: x^2 - 7x + 12 = 0 (T-Faktor)", tipe: "t-faktor", timer: 180,
    data: { a: 1, b: -7, c: 12, p: -3, q: -4, fa1: 1, fb1: -3, fa2: 1, fb2: -4, akar: [3, 4] as [number, number],
      hint: ["c = 12, b = -7. Dua bilangan negatif agar kali positif tapi jumlah negatif.", "(-3) x (-4) = 12 dan (-3) + (-4) = -7", "p = -3, q = -4 → (x-3)(x-4) = 0 → x = 3 atau x = 4"] } },
  { nomor: 3, pertanyaan: "Faktorkan: x^2 + 2x - 15 = 0 (T-Faktor)", tipe: "t-faktor", timer: 180,
    data: { a: 1, b: 2, c: -15, p: 5, q: -3, fa1: 1, fb1: 5, fa2: 1, fb2: -3, akar: [-5, 3] as [number, number],
      hint: ["c = -15, b = 2. Pasangan beda tanda: (5,-3) atau (-3,5).", "5 x (-3) = -15 dan 5 + (-3) = 2", "p = 5, q = -3 → (x+5)(x-3) = 0 → x = -5 atau x = 3"] } },
];

/* ============================ SEED ENGINE ================================= */

let seedPromise: Promise<void> | null = null;

/** Idempotent, sinkronkan konten deck materi berdasar nomor slide */
export async function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      for (const s of SLIDES) {
        await db
          .insert(slide)
          .values({ id: uid(), nomor: s.nomor, judul: s.judul, konten: s.konten })
          .onConflictDoUpdate({
            target: slide.nomor,
            set: { judul: s.judul, konten: s.konten },
          })
          .catch(async () => {
            const ex = await db.select({ id: slide.id }).from(slide).limit(1);
            if (ex.length === 0) {
              await db.insert(slide).values({ id: uid(), nomor: s.nomor, judul: s.judul, konten: s.konten });
            }
          });
      }

      // Pastikan data apersepsi selalu ter-update dengan struktur terbaru (semua PG A-E)
      const existingDiag = await db.select({ id: soalDiagnostik.id, opsi: soalDiagnostik.opsi }).from(soalDiagnostik);
      const perluUpdateDiag = existingDiag.length === 0 || existingDiag.some((s) => !s.opsi || !("E" in (s.opsi as object)));
      if (perluUpdateDiag) {
        if (existingDiag.length > 0) {
          await db.delete(soalDiagnostik);
        }
        await db.insert(soalDiagnostik).values(APERSEPSI.map((s) => ({ id: uid(), nomor: s.nomor, pertanyaan: s.pertanyaan, opsi: s.opsi ?? null, kunci: s.kunci, tipe: s.tipe, skor: s.skor })));
      }
      const w = await db.select({ id: soalWorksheet.id }).from(soalWorksheet).limit(1);
      if (w.length === 0) {
        await db.insert(soalWorksheet).values(WORKSHEET.map((s) => ({ id: uid(), nomor: s.nomor, pertanyaan: s.pertanyaan, tipe: s.tipe, timer: s.timer, data: s.data })));
      }
      // Pastikan data kuis selalu ter-update dengan struktur terbaru (semua PG A-E)
      const existingKuis = await db.select({ id: soalKuis.id, tipe: soalKuis.tipe }).from(soalKuis);
      const adaIsian = existingKuis.some((s) => s.tipe === "isian");
      if (existingKuis.length === 0 || adaIsian) {
        if (existingKuis.length > 0) {
          await db.delete(soalKuis);
        }
        await db.insert(soalKuis).values(KUIS.map((s) => ({ id: uid(), nomor: s.nomor, paket: s.paket, pertanyaan: s.pertanyaan, opsi: s.opsi ?? null, kunci: s.kunci, tipe: s.tipe, timer: s.timer, skor: s.skor })));
      }
    })().catch((e) => {
      seedPromise = null;
      throw e;
    });
  }
  await seedPromise;
}

/** Dipakai sekali di dev untuk memaksa re-seed ulang tanpa restart (opsional) */
export function resetSeedCache() {
  seedPromise = null;
}
