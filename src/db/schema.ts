import {
  pgTable,
  text,
  integer,
  boolean,
  doublePrecision,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* ============================= KELAS & SISWA ============================= */

export const kelas = pgTable("kelas", {
  id: text("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  guru: text("guru").notNull(),
  stage: text("stage").notNull().default("lobby"),
  slideAktif: integer("slide_aktif").notNull().default(1),
  slideLocked: boolean("slide_locked").notNull().default(true),
  loginDitutup: boolean("login_ditutup").notNull().default(false),
  cobaxRevealed: boolean("cobax_revealed").notNull().default(false),
  rina1Revealed: boolean("rina1_revealed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siswa = pgTable(
  "siswa",
  {
    id: text("id").primaryKey(),
    nama: text("nama").notNull(),
    kelasId: text("kelas_id").notNull().references(() => kelas.id),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    currentStage: text("current_stage").notNull().default("lobby"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("siswa_kelas_idx").on(t.kelasId), uniqueIndex("siswa_kelas_nama_uniq").on(t.kelasId, t.nama)]
);

/* ======================== SESI PEMBELAJARAN AKTIF ========================= */

export const sesiAktif = pgTable(
  "sesi_aktif",
  {
    id: text("id").primaryKey(),
    kelasId: text("kelas_id").notNull().references(() => kelas.id),
    status: text("status").notNull().default("live"), // live | ended
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => [index("sesi_kelas_idx").on(t.kelasId)]
);

/* ============================ FITUR 3: APERSEPSI ========================= */

export const soalDiagnostik = pgTable("soal_diagnostik", {
  id: text("id").primaryKey(),
  nomor: integer("nomor").notNull(),
  pertanyaan: text("pertanyaan").notNull(),
  opsi: jsonb("opsi").$type<{ A: string; B: string; C: string; D: string }>(),
  kunci: text("kunci").notNull().default(""),
  tipe: text("tipe").notNull().default("pg"),
  skor: integer("skor").notNull().default(20),
});

export const jawaban = pgTable(
  "jawaban",
  {
    id: text("id").primaryKey(),
    siswaId: text("siswa_id").notNull().references(() => siswa.id),
    soalId: text("soal_id").notNull().references(() => soalDiagnostik.id),
    jawaban: text("jawaban").notNull(),
    benar: boolean("benar").notNull().default(false),
    skor: integer("skor").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("jawaban_siswa_soal_uniq").on(t.siswaId, t.soalId)]
);

/* ============================== FITUR 1: SLIDE =========================== */

export type SlideBlock =
  | { t: "text"; v: string }
  | { t: "big"; v: string }
  | { t: "eq"; v: string; big?: boolean }
  | { t: "arrow"; v: string }
  | { t: "box"; title: string; v: string; tone?: "info" | "success" | "warn" | "violet" }
  | { t: "list"; items: string[] }
  | { t: "steps"; items: string[] }
  | { t: "check"; eq: string; result: string; ok: boolean }
  | { t: "table"; head: string[]; rows: string[][] };

export interface SlideKonten {
  layout?: "title" | "content" | "focus" | "closing";
  kicker?: string;
  title: string;
  sub?: string;
  blocks: SlideBlock[];
}

export const slide = pgTable("slide", {
  id: text("id").primaryKey(),
  nomor: integer("nomor").notNull().unique(),
  judul: text("judul").notNull(),
  konten: jsonb("konten").$type<SlideKonten>().notNull(),
});

/* ============================ FITUR 2: WORKSHEET ========================= */

export interface WorksheetData {
  a: number;
  b: number;
  c: number;
  p: number;
  q: number;
  fa1: number;
  fb1: number;
  fa2: number;
  fb2: number;
  akar: [number, number];
  hint: string[];
}

export const soalWorksheet = pgTable("soal_worksheet", {
  id: text("id").primaryKey(),
  nomor: integer("nomor").notNull(),
  pertanyaan: text("pertanyaan").notNull(),
  tipe: text("tipe").notNull().default("t-faktor"),
  data: jsonb("data").$type<WorksheetData>().notNull(),
  timer: integer("timer").notNull().default(180),
});

export const jawabanWorksheet = pgTable(
  "jawaban_worksheet",
  {
    id: text("id").primaryKey(),
    siswaId: text("siswa_id").notNull().references(() => siswa.id),
    soalId: text("soal_id").notNull().references(() => soalWorksheet.id),
    jawaban: jsonb("jawaban").$type<Record<string, unknown>>().notNull(),
    benar: boolean("benar").notNull().default(false),
    skor: integer("skor").notNull().default(0),
    hintDipakai: integer("hint_dipakai").notNull().default(0),
    waktu: integer("waktu").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("jw_soal_idx").on(t.soalId), uniqueIndex("jw_siswa_soal_uniq").on(t.siswaId, t.soalId)]
);

/* ============================== FITUR 4: KUIS ============================ */

export const kuisSession = pgTable(
  "kuis_session",
  {
    id: text("id").primaryKey(),
    kelasId: text("kelas_id").notNull().references(() => kelas.id),
    aktif: boolean("aktif").notNull().default(false),
    paket: integer("paket").notNull().default(1),
    soalAktif: integer("soal_aktif").notNull().default(1),
    soalMulai: timestamp("soal_mulai", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => [index("kuis_session_kelas_idx").on(t.kelasId)]
);

export const soalKuis = pgTable("soal_kuis", {
  id: text("id").primaryKey(),
  nomor: integer("nomor").notNull(),
  paket: integer("paket").notNull().default(1),
  pertanyaan: text("pertanyaan").notNull(),
  opsi: jsonb("opsi").$type<{ A: string; B: string; C: string; D: string; E?: string }>(),
  kunci: text("kunci").notNull().default(""),
  tipe: text("tipe").notNull().default("pg"),
  timer: integer("timer").notNull().default(60),
  skor: integer("skor").notNull().default(25),
});

export const kuisJawaban = pgTable(
  "kuis_jawaban",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull().references(() => kuisSession.id),
    siswaId: text("siswa_id").notNull().references(() => siswa.id),
    soalId: text("soal_id").notNull().references(() => soalKuis.id),
    jawaban: text("jawaban").notNull(),
    benar: boolean("benar").notNull().default(false),
    skor: integer("skor").notNull().default(0),
    waktu: integer("waktu").notNull().default(0),
    kosong: boolean("kosong").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("kj_session_idx").on(t.sessionId), uniqueIndex("kj_session_siswa_soal_uniq").on(t.sessionId, t.siswaId, t.soalId)]
);

/* ============================ FITUR 5: REFLEKSI ========================== */

export const refleksi = pgTable(
  "refleksi",
  {
    id: text("id").primaryKey(),
    siswaId: text("siswa_id").notNull().references(() => siswa.id),
    tujuan1: boolean("tujuan1").notNull().default(false),
    tujuan2: boolean("tujuan2").notNull().default(false),
    tujuan3: boolean("tujuan3").notNull().default(false),
    ratingTF: integer("rating_tf").notNull().default(0),
    ratingAC: integer("rating_ac").notNull().default(0),
    kesulitan: text("kesulitan").notNull().default(""),
    tugasRumah: text("tugas_rumah").notNull().default(""),
    rating: integer("rating").notNull().default(0),
    satuKata: text("satu_kata").notNull().default(""),
    exitTicket: text("exit_ticket").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("refleksi_siswa_uniq").on(t.siswaId)]
);

/* ============================ SAPAAN PEMBUKA ============================= */

export const sapaan = pgTable(
  "sapaan",
  {
    id: text("id").primaryKey(),
    kelasId: text("kelas_id").notNull().references(() => kelas.id),
    siswaId: text("siswa_id").notNull().references(() => siswa.id),
    mood: text("mood").notNull(),
    pesan: text("pesan").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sapaan_kelas_idx").on(t.kelasId), uniqueIndex("sapaan_siswa_uniq").on(t.siswaId)]
);

/* ================= FASE 2 EKSPLORASI BEBAS (COBA-COBA) ==================== */

export const cobaCoba = pgTable(
  "coba_coba",
  {
    id: text("id").primaryKey(),
    kelasId: text("kelas_id").notNull().references(() => kelas.id),
    siswaId: text("siswa_id").notNull().references(() => siswa.id),
    x: doublePrecision("x").notNull(),
    hasil: doublePrecision("hasil").notNull(),
    akar: boolean("akar").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("cobacoba_kelas_idx").on(t.kelasId)]
);

/* ============ FASE 3: KLASIFIKASI + TABEL PENEMUAN POLA ================== */

export const klasifikasi = pgTable(
  "klasifikasi",
  {
    id: text("id").primaryKey(),
    kelasId: text("kelas_id").notNull().references(() => kelas.id),
    siswaId: text("siswa_id").notNull().references(() => siswa.id),
    sortBenar: integer("sort_benar").notNull().default(0),
    polaBenar: integer("pola_benar").notNull().default(0),
    hasil: jsonb("hasil").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("klasifikasi_siswa_uniq").on(t.siswaId)]
);

/* ================= ANNOTATION CORET GURU (STIKER) ======================== */

export const annotationStiker = pgTable(
  "annotation_stiker",
  {
    id: text("id").primaryKey(),
    kelasId: text("kelas_id").notNull().references(() => kelas.id),
    stage: text("stage").notNull(), // slide deck key: "materi", "impas" dll
    x: doublePrecision("x").notNull(), // 0..1
    y: doublePrecision("y").notNull(), // 0..1
    warna: text("warna").notNull().default("red"),
    ikon: text("ikon").notNull().default("star"), // star | star3 | exclaim | thought | heart | check | question
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("stiker_kelas_stage_idx").on(t.kelasId, t.stage)]
);

/* ================= VOTING UMUM (mis. untung/rugi Rina) =================== */

export const voting = pgTable(
  "voting",
  {
    id: text("id").primaryKey(),
    kelasId: text("kelas_id").notNull().references(() => kelas.id),
    siswaId: text("siswa_id").notNull().references(() => siswa.id),
    topik: text("topik").notNull(),
    pilihan: text("pilihan").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("voting_kelas_topik_idx").on(t.kelasId, t.topik),
    uniqueIndex("voting_siswa_topik_uniq").on(t.siswaId, t.topik),
  ]
);

/* ================= SLIDE 9: COBAX PILIHAN ENAM ANGKA ====================== */

export const cobaxJawaban = pgTable(
  "cobax_jawaban",
  {
    id: text("id").primaryKey(),
    kelasId: text("kelas_id").notNull().references(() => kelas.id),
    sesiId: text("sesi_id").notNull().references(() => sesiAktif.id),
    siswaId: text("siswa_id").notNull().references(() => siswa.id),
    pilihan: integer("pilihan").notNull(),
    hasil: integer("hasil").notNull(),
    benar: boolean("benar").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("cobax_sesi_idx").on(t.sesiId), uniqueIndex("cobax_sesi_siswa_uniq").on(t.sesiId, t.siswaId)]
);
