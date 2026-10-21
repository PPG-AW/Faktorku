-- ============================================================================
-- FAKTORKU - SCHEMA POSTGRESQL UNTUK NEON
-- ============================================================================
-- Cara menggunakan:
-- 1. Buka project Neon.
-- 2. Pilih menu SQL Editor.
-- 3. Salin seluruh isi file ini.
-- 4. Tempel ke SQL Editor, lalu klik Run.
--
-- File ini ditujukan untuk database BARU/KOSONG.
-- Perintah memakai IF NOT EXISTS sehingga aman dijalankan ulang untuk membuat
-- objek yang belum ada. File ini tidak menghapus data.
-- ============================================================================

BEGIN;

-- ============================== MASTER KELAS ================================

CREATE TABLE IF NOT EXISTS kelas (
  id                TEXT PRIMARY KEY,
  kode              TEXT NOT NULL UNIQUE,
  nama              TEXT NOT NULL,
  guru              TEXT NOT NULL,
  stage             TEXT NOT NULL DEFAULT 'lobby',
  slide_aktif       INTEGER NOT NULL DEFAULT 1,
  slide_locked      BOOLEAN NOT NULL DEFAULT TRUE,
  login_ditutup     BOOLEAN NOT NULL DEFAULT FALSE,
  cobax_revealed    BOOLEAN NOT NULL DEFAULT FALSE,
  rina1_revealed    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS siswa (
  id                TEXT PRIMARY KEY,
  nama              TEXT NOT NULL,
  kelas_id          TEXT NOT NULL REFERENCES kelas(id),
  last_seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_stage     TEXT NOT NULL DEFAULT 'lobby',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS siswa_kelas_idx
  ON siswa (kelas_id);

CREATE UNIQUE INDEX IF NOT EXISTS siswa_kelas_nama_uniq
  ON siswa (kelas_id, nama);

-- ============================== SESI AKTIF ==================================

CREATE TABLE IF NOT EXISTS sesi_aktif (
  id                TEXT PRIMARY KEY,
  kelas_id          TEXT NOT NULL REFERENCES kelas(id),
  status            TEXT NOT NULL DEFAULT 'live',
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS sesi_kelas_idx
  ON sesi_aktif (kelas_id);

-- ============================== APERSEPSI ===================================

CREATE TABLE IF NOT EXISTS soal_diagnostik (
  id                TEXT PRIMARY KEY,
  nomor             INTEGER NOT NULL,
  pertanyaan        TEXT NOT NULL,
  opsi              JSONB,
  kunci             TEXT NOT NULL DEFAULT '',
  tipe              TEXT NOT NULL DEFAULT 'pg',
  skor              INTEGER NOT NULL DEFAULT 20
);

CREATE TABLE IF NOT EXISTS jawaban (
  id                TEXT PRIMARY KEY,
  siswa_id          TEXT NOT NULL REFERENCES siswa(id),
  soal_id           TEXT NOT NULL REFERENCES soal_diagnostik(id),
  jawaban           TEXT NOT NULL,
  benar             BOOLEAN NOT NULL DEFAULT FALSE,
  skor              INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS jawaban_siswa_soal_uniq
  ON jawaban (siswa_id, soal_id);

-- ================================= SLIDE ====================================

CREATE TABLE IF NOT EXISTS slide (
  id                TEXT PRIMARY KEY,
  nomor             INTEGER NOT NULL UNIQUE,
  judul             TEXT NOT NULL,
  konten            JSONB NOT NULL
);

-- =============================== WORKSHEET ==================================

CREATE TABLE IF NOT EXISTS soal_worksheet (
  id                TEXT PRIMARY KEY,
  nomor             INTEGER NOT NULL,
  pertanyaan        TEXT NOT NULL,
  tipe              TEXT NOT NULL DEFAULT 't-faktor',
  data              JSONB NOT NULL,
  timer             INTEGER NOT NULL DEFAULT 180
);

CREATE TABLE IF NOT EXISTS jawaban_worksheet (
  id                TEXT PRIMARY KEY,
  siswa_id          TEXT NOT NULL REFERENCES siswa(id),
  soal_id           TEXT NOT NULL REFERENCES soal_worksheet(id),
  jawaban           JSONB NOT NULL,
  benar             BOOLEAN NOT NULL DEFAULT FALSE,
  skor              INTEGER NOT NULL DEFAULT 0,
  hint_dipakai      INTEGER NOT NULL DEFAULT 0,
  waktu             INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS jw_soal_idx
  ON jawaban_worksheet (soal_id);

CREATE UNIQUE INDEX IF NOT EXISTS jw_siswa_soal_uniq
  ON jawaban_worksheet (siswa_id, soal_id);

-- ================================= KUIS =====================================

CREATE TABLE IF NOT EXISTS kuis_session (
  id                TEXT PRIMARY KEY,
  kelas_id          TEXT NOT NULL REFERENCES kelas(id),
  aktif             BOOLEAN NOT NULL DEFAULT FALSE,
  paket             INTEGER NOT NULL DEFAULT 1,
  soal_aktif        INTEGER NOT NULL DEFAULT 1,
  soal_mulai        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS kuis_session_kelas_idx
  ON kuis_session (kelas_id);

CREATE TABLE IF NOT EXISTS soal_kuis (
  id                TEXT PRIMARY KEY,
  nomor             INTEGER NOT NULL,
  paket             INTEGER NOT NULL DEFAULT 1,
  pertanyaan        TEXT NOT NULL,
  opsi              JSONB,
  kunci             TEXT NOT NULL DEFAULT '',
  tipe              TEXT NOT NULL DEFAULT 'pg',
  timer             INTEGER NOT NULL DEFAULT 60,
  skor              INTEGER NOT NULL DEFAULT 25
);

CREATE TABLE IF NOT EXISTS kuis_jawaban (
  id                TEXT PRIMARY KEY,
  session_id        TEXT NOT NULL REFERENCES kuis_session(id),
  siswa_id          TEXT NOT NULL REFERENCES siswa(id),
  soal_id           TEXT NOT NULL REFERENCES soal_kuis(id),
  jawaban           TEXT NOT NULL,
  benar             BOOLEAN NOT NULL DEFAULT FALSE,
  skor              INTEGER NOT NULL DEFAULT 0,
  waktu             INTEGER NOT NULL DEFAULT 0,
  kosong            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kj_session_idx
  ON kuis_jawaban (session_id);

CREATE UNIQUE INDEX IF NOT EXISTS kj_session_siswa_soal_uniq
  ON kuis_jawaban (session_id, siswa_id, soal_id);

-- =============================== REFLEKSI ===================================

CREATE TABLE IF NOT EXISTS refleksi (
  id                TEXT PRIMARY KEY,
  siswa_id          TEXT NOT NULL REFERENCES siswa(id),
  tujuan1           BOOLEAN NOT NULL DEFAULT FALSE,
  tujuan2           BOOLEAN NOT NULL DEFAULT FALSE,
  tujuan3           BOOLEAN NOT NULL DEFAULT FALSE,
  rating_tf         INTEGER NOT NULL DEFAULT 0,
  rating_ac         INTEGER NOT NULL DEFAULT 0,
  kesulitan         TEXT NOT NULL DEFAULT '',
  tugas_rumah       TEXT NOT NULL DEFAULT '',
  rating            INTEGER NOT NULL DEFAULT 0,
  satu_kata         TEXT NOT NULL DEFAULT '',
  exit_ticket       TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS refleksi_siswa_uniq
  ON refleksi (siswa_id);

-- ============================ DATA PENDUKUNG ================================

CREATE TABLE IF NOT EXISTS sapaan (
  id                TEXT PRIMARY KEY,
  kelas_id          TEXT NOT NULL REFERENCES kelas(id),
  siswa_id          TEXT NOT NULL REFERENCES siswa(id),
  mood              TEXT NOT NULL,
  pesan             TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sapaan_kelas_idx
  ON sapaan (kelas_id);

CREATE UNIQUE INDEX IF NOT EXISTS sapaan_siswa_uniq
  ON sapaan (siswa_id);

CREATE TABLE IF NOT EXISTS coba_coba (
  id                TEXT PRIMARY KEY,
  kelas_id          TEXT NOT NULL REFERENCES kelas(id),
  siswa_id          TEXT NOT NULL REFERENCES siswa(id),
  x                 DOUBLE PRECISION NOT NULL,
  hasil             DOUBLE PRECISION NOT NULL,
  akar              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cobacoba_kelas_idx
  ON coba_coba (kelas_id);

CREATE TABLE IF NOT EXISTS klasifikasi (
  id                TEXT PRIMARY KEY,
  kelas_id          TEXT NOT NULL REFERENCES kelas(id),
  siswa_id          TEXT NOT NULL REFERENCES siswa(id),
  sort_benar        INTEGER NOT NULL DEFAULT 0,
  pola_benar        INTEGER NOT NULL DEFAULT 0,
  hasil             JSONB NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS klasifikasi_siswa_uniq
  ON klasifikasi (siswa_id);

-- ============================== ANNOTATION ==================================

CREATE TABLE IF NOT EXISTS annotation_stiker (
  id                TEXT PRIMARY KEY,
  kelas_id          TEXT NOT NULL REFERENCES kelas(id),
  stage             TEXT NOT NULL,
  x                 DOUBLE PRECISION NOT NULL,
  y                 DOUBLE PRECISION NOT NULL,
  warna             TEXT NOT NULL DEFAULT 'red',
  ikon              TEXT NOT NULL DEFAULT 'star',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS stiker_kelas_stage_idx
  ON annotation_stiker (kelas_id, stage);

-- ================================= VOTING ===================================

CREATE TABLE IF NOT EXISTS voting (
  id                TEXT PRIMARY KEY,
  kelas_id          TEXT NOT NULL REFERENCES kelas(id),
  siswa_id          TEXT NOT NULL REFERENCES siswa(id),
  topik             TEXT NOT NULL,
  pilihan           TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS voting_kelas_topik_idx
  ON voting (kelas_id, topik);

CREATE UNIQUE INDEX IF NOT EXISTS voting_siswa_topik_uniq
  ON voting (siswa_id, topik);

-- ================================= COBAX ====================================

CREATE TABLE IF NOT EXISTS cobax_jawaban (
  id                TEXT PRIMARY KEY,
  kelas_id          TEXT NOT NULL REFERENCES kelas(id),
  sesi_id           TEXT NOT NULL REFERENCES sesi_aktif(id),
  siswa_id          TEXT NOT NULL REFERENCES siswa(id),
  pilihan           INTEGER NOT NULL,
  hasil             INTEGER NOT NULL,
  benar             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cobax_sesi_idx
  ON cobax_jawaban (sesi_id);

CREATE UNIQUE INDEX IF NOT EXISTS cobax_sesi_siswa_uniq
  ON cobax_jawaban (sesi_id, siswa_id);

COMMIT;

-- ============================================================================
-- VERIFIKASI
-- Jalankan query berikut setelah script selesai untuk melihat semua tabel:
--
-- SELECT tablename
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
-- ============================================================================
