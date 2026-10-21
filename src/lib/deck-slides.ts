import {
  BookOpen, ClipboardList, Coins, Flag, FlaskConical, Goal, Home,
  Lightbulb, ListChecks, MonitorPlay, PenLine, Scale, Speech, Sparkles,
  Target, TrendingUp, Trophy, Vote, type LucideIcon,
} from "lucide-react";
import type { SlideKonten } from "@/db/schema";

export type Interaktif =
  | null
  | "presensi"
  | "apersepsi"
  | "vote-rina"
  | "cobax"
  | "lkpd"
  | "share"
  | "kuis"
  | "leaderboard"
  | "refleksi"
  | "logout";

export interface DeckItem {
  nomor: number;
  key: string;
  grup: "Pendahuluan" | "Kegiatan Inti" | "Penutup";
  label: string;
  fase: string;
  stage: string;
  konten: SlideKonten | null;
  interaktif: Interaktif;
  /** blok konten muncul satu per satu (klik / panah bawah) */
  bertahap?: boolean;
  timer?: "think" | "share";
  icon: LucideIcon;
}

export const DECK: DeckItem[] = [
  /* ========================= PENDAHULUAN ========================= */
  {
    nomor: 1, key: "cover", grup: "Pendahuluan", label: "Cover Materi", fase: "Pembuka",
    stage: "lobby", interaktif: "presensi", icon: Home,
    konten: {
      layout: "title",
      kicker: "Matematika · Kelas X AKL · Fase E",
      title: "PERSAMAAN KUADRAT",
      sub: "Pemfaktoran T-Faktor untuk a = 1",
      blocks: [
        { t: "eq", v: "ax² + bx + c = 0", big: true },
        { t: "text", v: "Discovery Learning · Think, Pair, Share · 90 menit" },
      ],
    },
  },
  {
    nomor: 2, key: "apersepsi", grup: "Pendahuluan", label: "Apersepsi", fase: "Pendahuluan",
    stage: "apersepsi", interaktif: "apersepsi", icon: Target,
    konten: null,
  },
  {
    nomor: 3, key: "tujuan", grup: "Pendahuluan", label: "Tujuan Pembelajaran", fase: "Pendahuluan",
    stage: "materi", interaktif: null, bertahap: true, icon: Goal,
    konten: {
      layout: "content",
      kicker: "Pendahuluan · Tujuan",
      title: "Tujuan Hari Ini",
      sub: "Target: benar minimal 3 dari 4 soal",
      blocks: [
        { t: "box", title: "Tujuan 1, Konsep", v: "Memahami konsep persamaan kuadrat dan bentuk umum ax² + bx + c = 0.", tone: "info" },
        { t: "list", items: [
          "Menyebutkan bentuk umum ax² + bx + c = 0",
          "Mengidentifikasi nilai a, b, dan c",
          "Membedakan persamaan linear dan kuadrat",
          "Mengubah persamaan ke bentuk umum",
        ] },
        { t: "box", title: "Tujuan 2, T-Faktor", v: "Menentukan akar persamaan kuadrat bentuk a = 1 dengan metode T-Faktor.", tone: "success" },
        { t: "list", items: [
          "Mencari dua bilangan: hasil kali = c, hasil jumlah = b",
          "Menuliskan bentuk faktor (x + p)(x + q) = 0",
          "Menentukan nilai x dari bentuk faktor",
          "Membuktikan akar dengan substitusi",
        ] },
      ],
    },
  },

  /* ======================== KEGIATAN INTI ======================== */
  {
    nomor: 4, key: "cerita", grup: "Kegiatan Inti", label: "Cerita Rina", fase: "Fase 1 · Stimulation",
    stage: "materi", interaktif: null, bertahap: true, icon: BookOpen,
    konten: {
      layout: "content",
      kicker: "Fase 1 · Stimulation",
      title: "Cerita Usaha Sablon Kaos Rina",
      sub: "Mari baca bersama-sama, perhatikan setiap angkanya",
      blocks: [
        { t: "text", v: "Rina baru saja membuka usaha sablon kaos di rumahnya." },
        { t: "text", v: "Setiap minggu jumlah kaos yang dia produksi berbeda-beda. Karena itu, jumlah kaos kita sebut saja x." },
        { t: "text", v: "Satu kaos dijual seharga 50 ribu rupiah." },
        { t: "text", v: "Jadi kalau terjual x kaos, uang yang masuk adalah 50 dikali x." },
        { t: "text", v: "Tetapi berjualan tidak gratis. Tinta dan kaos polos berharga 30 ribu untuk setiap kaos." },
        { t: "text", v: "Sewa tempat dan listrik 75 ribu setiap minggu. Jumlah ini tetap, mau produksi banyak atau sedikit." },
        { t: "text", v: "Ada satu biaya lagi yang unik, yaitu upah tenaga kerja." },
        { t: "text", v: "Makin banyak kaos, makin rumit pengerjaannya. Upah untuk setiap kaos ikut naik mengikuti jumlah kaos, yaitu x ribu." },
        { t: "box", title: "Inilah yang menarik", v: "Upah tiap kaos adalah x ribu dan jumlah kaos adalah x. Maka total upah menjadi x dikali x, yaitu x².", tone: "violet" },
        { t: "text", v: "Suatu sore Rina bertanya pada dirinya sendiri." },
        { t: "box", title: "Pertanyaan Rina", v: "Berapa kaos yang harus aku jual supaya uang masuk tepat sama dengan semua biaya? Tidak untung, tetapi juga tidak rugi.", tone: "warn" },
      ],
    },
  },
  {
    nomor: 5, key: "data", grup: "Kegiatan Inti", label: "Data Usaha Rina", fase: "Fase 1 · Stimulation",
    stage: "materi", interaktif: null, icon: ClipboardList,
    konten: {
      layout: "content",
      kicker: "Fase 1 · Stimulation",
      title: "Ringkasan Data Rina",
      sub: "x = jumlah kaos yang diproduksi dalam seminggu",
      blocks: [
        { t: "table", head: ["Komponen", "Rincian", "Rumus"], rows: [
          ["Harga jual", "50 ribu tiap kaos", "50x"],
          ["Bahan sablon", "30 ribu tiap kaos", "30x"],
          ["Upah tenaga kerja", "x ribu tiap kaos", "x²"],
          ["Sewa dan listrik", "75 ribu seminggu", "75"],
        ] },
      ],
    },
  },
  {
    nomor: 6, key: "vote", grup: "Kegiatan Inti", label: "Untung atau Rugi?", fase: "Fase 1 · Interaktif",
    stage: "vote-rina", interaktif: "vote-rina", icon: Vote,
    konten: {
      layout: "content",
      kicker: "Kasus untuk dijawab",
      title: "Rina Mendapat Pesanan 30 Kaos",
      sub: "Pakai data tadi untuk menilai keadaan usaha Rina",
      blocks: [
        { t: "text", v: "Minggu ini Rina menerima pesanan sebanyak 30 kaos. Semua pesanan berhasil dia selesaikan dan terjual habis." },
        { t: "table", head: ["Komponen", "Perhitungan", "Hasil"], rows: [
          ["Uang masuk", "50 ribu × 30 kaos", "1,5 juta"],
          ["Bahan sablon", "30 ribu × 30 kaos", "900 ribu"],
          ["Upah tenaga kerja", "30 ribu × 30 kaos", "900 ribu"],
          ["Sewa dan listrik", "tetap seminggu", "75 ribu"],
        ] },
        { t: "box", title: "Pertanyaan", v: "Menurutmu, apakah Rina untung atau rugi pada minggu ini? Jawab di HP kalian.", tone: "warn" },
      ],
    },
  },
  {
    nomor: 7, key: "contoh", grup: "Kegiatan Inti", label: "Coba Hitung 10 Kaos", fase: "Fase 2 · Problem",
    stage: "materi", interaktif: null, bertahap: true, icon: Coins,
    konten: {
      layout: "content",
      kicker: "Menguji dengan angka nyata",
      title: "Bagaimana Kalau Terjual 10 Kaos?",
      sub: "Mari masukkan nilai x = 10 ke data Rina",
      blocks: [
        { t: "table", head: ["Komponen", "Hitungan untuk x = 10", "Hasil"], rows: [
          ["Uang masuk", "50 × 10", "500 ribu"],
          ["Bahan sablon", "30 × 10", "300 ribu"],
          ["Upah tenaga kerja", "10 × 10", "100 ribu"],
          ["Sewa & listrik", "tetap", "75 ribu"],
          ["Total biaya", "300 + 100 + 75", "475 ribu"],
        ] },
        { t: "box", title: "Hasilnya", v: "Uang masuk 500 ribu dan biaya 475 ribu. Rina untung 25 ribu.", tone: "success" },
        { t: "text", v: "Tetapi ini baru satu percobaan. Bagaimana kalau 5 kaos? Atau 20 kaos?" },
        { t: "box", title: "Masalahnya", v: "Mencoba satu per satu sangat lambat. Kita butuh cara pasti untuk menemukan titik ketika untung dan rugi bertemu.", tone: "warn" },
      ],
    },
  },
  {
    nomor: 8, key: "impas", grup: "Kegiatan Inti", label: "Konsep Titik Impas", fase: "Fase 2 · Problem",
    stage: "materi", interaktif: null, bertahap: true, icon: Scale,
    konten: {
      layout: "focus",
      kicker: "Fase 2 · Problem Statement",
      title: "Titik Impas, Jawaban Kita",
      sub: "Untuk tahu untung atau rugi, cari dulu titik balik modalnya",
      blocks: [
        { t: "text", v: "Supaya bisa menjawab pertanyaan tadi, kita perlu satu angka kunci." },
        { t: "text", v: "Yaitu berapa kaos yang membuat uang masuk tepat sama dengan uang keluar." },
        { t: "eq", v: "Uang masuk = Uang keluar", big: true },
        { t: "list", items: ["Di atas titik itu: Rina untung", "Tepat di titik itu: balik modal", "Di bawah titik itu: Rina rugi"] },
        { t: "box", title: "Itulah Titik Impas", v: "Selisih uang masuk dan uang keluar sama dengan nol. Dari sinilah persamaan kita lahir.", tone: "violet" },
      ],
    },
  },
  {
    nomor: 9, key: "hitung", grup: "Kegiatan Inti", label: "Susun Persamaan", fase: "Fase 2 · Problem",
    stage: "materi", interaktif: null, bertahap: true, icon: ListChecks,
    konten: {
      layout: "content",
      kicker: "Menyusun Persamaan",
      title: "Dari Cerita ke Persamaan",
      sub: "Uang masuk = uang keluar",
      blocks: [
        { t: "box", title: "Uang Masuk", v: "50x ribu", tone: "success" },
        { t: "box", title: "Uang Keluar", v: "30x + x² + 75 ribu", tone: "warn" },
        { t: "steps", items: [
          "50x = x² + 30x + 75",
          "0 = x² + 30x - 50x + 75",
          "0 = x² - 20x + 75",
        ] },
        { t: "eq", v: "x² - 20x + 75 = 0", big: true },
        { t: "box", title: "Persamaan Kuadrat", v: "dengan a = 1, b = -20, dan c = 75.", tone: "info" },
      ],
    },
  },
  {
    nomor: 10, key: "tanya", grup: "Kegiatan Inti", label: "Coba Tebak Nilai x", fase: "Fase 2 · Pemantik",
    stage: "materi", interaktif: null, icon: Lightbulb,
    konten: {
      layout: "focus",
      kicker: "Pemantik",
      title: "Berapa Nilai x?",
      sub: "Berapa kaos yang harus terjual supaya Rina balik modal?",
      blocks: [
        { t: "eq", v: "x² - 20x + 75 = 0", big: true },
        { t: "box", title: "Siap-siap", v: "Slide berikutnya kalian bebas memilih angka berapa pun dari 0 sampai 30 lewat HP. Tebakan seluruh kelas akan tampil di layar ini.", tone: "warn" },
      ],
    },
  },
  {
    nomor: 11, key: "cobax", grup: "Kegiatan Inti", label: "CobaX, Tebakan Kelas", fase: "Fase 2 · Interaktif",
    stage: "cobax", interaktif: "cobax", icon: FlaskConical,
    konten: null,
  },
  {
    nomor: 12, key: "lkpd", grup: "Kegiatan Inti", label: "LKPD, Think & Pair", fase: "Fase 3–4",
    stage: "aktivitas-think", interaktif: "lkpd", timer: "think", icon: PenLine,
    konten: null,
  },
  {
    nomor: 13, key: "share", grup: "Kegiatan Inti", label: "SHARE, Presentasi", fase: "Fase 5 · Verification",
    stage: "aktivitas-share", interaktif: "share", timer: "share", icon: Speech,
    konten: null,
  },
  {
    nomor: 14, key: "langkah", grup: "Kegiatan Inti", label: "5 Langkah T-Faktor", fase: "Fase 6 · Generalization",
    stage: "materi", interaktif: null, bertahap: true, icon: ListChecks,
    konten: {
      layout: "content",
      kicker: "Fase 6 · Generalization",
      title: "5 Langkah T-Faktor",
      sub: "Contoh: x² + 5x + 6 = 0",
      blocks: [
        { t: "box", title: "Langkah 1", v: "Tentukan a, b, c → a = 1, b = 5, c = 6", tone: "info" },
        { t: "box", title: "Langkah 2", v: "Cari dua bilangan: p x q = 6 dan p + q = 5 → p = 2, q = 3", tone: "info" },
        { t: "box", title: "Langkah 3", v: "Tulis bentuk faktor → (x + 2)(x + 3) = 0", tone: "violet" },
        { t: "box", title: "Langkah 4", v: "Tentukan nilai x → x = -2 atau x = -3", tone: "violet" },
        { t: "box", title: "Langkah 5", v: "Cek substitusi dengan memasukkan nilai x kembali ke persamaan.", tone: "success" },
        { t: "eq", v: "(-2)² + 5(-2) + 6 = 4 - 10 + 6 = 0" },
        { t: "eq", v: "p x q = c dan p + q = b", big: true },
      ],
    },
  },
  {
    nomor: 15, key: "pola", grup: "Kegiatan Inti", label: "Pola Tanda", fase: "Fase 6 · Generalization",
    stage: "materi", interaktif: null, icon: TrendingUp,
    konten: {
      layout: "content",
      kicker: "Fase 6 · Generalization",
      title: "Pola Tanda T-Faktor",
      sub: "Tanda b dan c menentukan tanda p dan q",
      blocks: [
        { t: "table", head: ["Tanda b", "Tanda c", "Tanda p dan q", "Bentuk Faktor"], rows: [
          ["+", "+", "( + , + )", "(x + p)(x + q)"],
          ["-", "+", "( - , - )", "(x - p)(x - q)"],
          ["+", "-", "( + , - )", "(x + p)(x - q)"],
          ["-", "-", "( - , + )", "(x - p)(x + q)"],
        ] },
        { t: "box", title: "Rumus Cepat", v: "c positif → p dan q sama tanda. c negatif → p dan q beda tanda.", tone: "info" },
      ],
    },
  },
  {
    nomor: 16, key: "batas", grup: "Kegiatan Inti", label: "Yang Tidak Bisa Difaktorkan", fase: "Fase 6",
    stage: "materi", interaktif: null, bertahap: true, icon: BookOpen,
    konten: {
      layout: "focus",
      kicker: "Batasan T-Faktor",
      title: "x² + 5x + 3 = 0",
      sub: "Cari dua bilangan: hasil kali 3, hasil jumlah 5",
      blocks: [
        { t: "check", eq: "1 x 3 = 3", result: "1 + 3 = 4", ok: false },
        { t: "check", eq: "(-1) x (-3) = 3", result: "-1 + (-3) = -4", ok: false },
        { t: "box", title: "Kesimpulan", v: "Tidak ada pasangan bilangan bulat yang memenuhi, sehingga persamaan ini tidak bisa difaktorkan. Pertemuan depan kita pelajari Rumus ABC.", tone: "warn" },
      ],
    },
  },

  /* =========================== PENUTUP =========================== */
  {
    nomor: 17, key: "kuis", grup: "Penutup", label: "Kuis Kompetisi", fase: "Fase 6 · Sumatif",
    stage: "kuis", interaktif: "kuis", icon: Trophy,
    konten: null,
  },
  {
    nomor: 18, key: "leaderboard", grup: "Penutup", label: "Leaderboard", fase: "Fase 6",
    stage: "kuis", interaktif: "leaderboard", icon: Trophy,
    konten: null,
  },
  {
    nomor: 19, key: "refleksi", grup: "Penutup", label: "Refleksi & Word Cloud", fase: "Fase 6 · Reflektif",
    stage: "refleksi", interaktif: "refleksi", icon: Sparkles,
    konten: null,
  },
  {
    nomor: 20, key: "kesimpulan", grup: "Penutup", label: "Kesimpulan Bersama", fase: "Penutup",
    stage: "materi", interaktif: null, bertahap: true, icon: ListChecks,
    konten: {
      layout: "content",
      kicker: "Penutup",
      title: "Kesimpulan Hari Ini",
      sub: "Apa yang sudah kita temukan bersama?",
      blocks: [
        { t: "text", v: "Pemfaktoran adalah kebalikan dari perkalian aljabar." },
        { t: "text", v: "T-Faktor bekerja dengan mencari dua bilangan: hasil kali sama dengan c, hasil jumlah sama dengan b." },
        { t: "text", v: "Persamaan kuadrat bisa punya dua akar, satu akar, atau tidak bisa difaktorkan dengan bilangan bulat." },
        { t: "text", v: "Selalu buktikan jawaban dengan substitusi ke persamaan awal." },
        { t: "eq", v: "(x + p)(x + q) = x² + (p + q)x + pq", big: true },
      ],
    },
  },
  {
    nomor: 21, key: "preview", grup: "Penutup", label: "Pertemuan Berikutnya", fase: "Penutup",
    stage: "materi", interaktif: null, icon: MonitorPlay,
    konten: {
      layout: "content",
      kicker: "Penutup",
      title: "Pertemuan Berikutnya",
      sub: "Rumus ABC + Melengkapkan Kuadrat Sempurna",
      blocks: [
        { t: "box", title: "Materi Depan", v: "Rumus ABC untuk persamaan yang tidak bisa difaktorkan, termasuk x² + 5x + 3 = 0 tadi.", tone: "info" },
        { t: "text", v: "Persiapkan diri untuk mempelajari metode kuadratik pada pertemuan mendatang." },
      ],
    },
  },
  {
    nomor: 22, key: "doa", grup: "Penutup", label: "Doa Penutup", fase: "Penutup",
    stage: "doa", interaktif: "logout", icon: Flag,
    konten: null,
  },
];

export const DECK_GRUP = ["Pendahuluan", "Kegiatan Inti", "Penutup"] as const;
export const DECK_TOTAL = DECK.length;

export function deckByNomor(n: number): DeckItem {
  return DECK.find((d) => d.nomor === n) ?? DECK[0];
}
