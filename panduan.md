# PANDUAN DEPLOY FAKTORKU UNTUK PEMULA

Panduan ini dibuat untuk pengguna yang **belum pernah menggunakan Git, GitHub, Neon, atau Vercel**.

Anda tidak perlu mengetik perintah Git. Semua proses utama dilakukan dengan membuka website dan mengklik tombol.

Layanan yang digunakan:

1. **GitHub** untuk menyimpan file aplikasi.
2. **Neon** untuk database PostgreSQL.
3. **Vercel** untuk menerbitkan website.

Biaya dapat tetap gratis selama penggunaan masih berada dalam batas free tier masing-masing layanan.

---

# BAGIAN 1 - FILE YANG SUDAH DISIAPKAN

Di dalam folder project sudah tersedia:

| File | Fungsi |
|---|---|
| `neon-schema.sql` | Membuat seluruh tabel database di Neon |
| `.env.example` | Contoh environment variable |
| `drizzle.neon.config.ts` | Konfigurasi Drizzle untuk Neon jika suatu hari memakai terminal |
| `panduan.md` | Panduan yang sedang Anda baca |
| `package.json` | Daftar dependency dan perintah build aplikasi |
| `src/` | Seluruh kode aplikasi |
| `public/` | File publik website |

## File yang jangan pernah diunggah ke GitHub

Jangan mengunggah file berikut jika ada:

```text
.env
.env.local
.env.production
```

File tersebut dapat berisi password database.

Jangan mengunggah folder berikut jika ada:

```text
node_modules
.next
```

Kedua folder tersebut sangat besar dan akan dibuat ulang otomatis oleh Vercel.

File `.env.example` **boleh diunggah** karena hanya berisi contoh dan tidak memiliki password asli.

---

# BAGIAN 2 - MENYIAPKAN FOLDER PROJECT

Jika Anda mengunduh project dari editor atau platform pembuatan aplikasi:

1. Cari tombol **Download**, **Export**, atau **Download ZIP**.
2. Simpan file ZIP ke komputer.
3. Klik kanan file ZIP.
4. Pilih **Extract All**, **Ekstrak Semua**, atau **Extract Here**.
5. Buka folder hasil ekstrak.
6. Pastikan di dalamnya langsung terlihat file berikut:

```text
package.json
panduan.md
neon-schema.sql
src
public
```

Jika file tersebut masih berada di dalam folder lain, buka folder terdalam yang memiliki `package.json`. Folder itulah yang akan diunggah ke GitHub.

Sebelum upload:

- Hapus folder `node_modules` jika ada.
- Hapus folder `.next` jika ada.
- Hapus `.env` dan `.env.local` jika ada.
- Jangan hapus `package.json`.
- Jangan hapus `package-lock.json` jika ada.
- Jangan hapus `.env.example`.

---

# BAGIAN 3 - MEMBUAT DATABASE DI NEON

## 3.1 Membuat akun Neon

1. Buka <https://neon.tech>.
2. Klik **Sign Up**.
3. Pilih masuk menggunakan akun Google atau GitHub.
4. Setelah masuk, Anda akan melihat Neon Console.

## 3.2 Membuat project database

1. Klik **New Project** atau **Create Project**.
2. Pada nama project, isi:

```text
faktorku
```

3. Jika ada pilihan region, pilih region yang dekat dengan Indonesia, misalnya:

```text
Singapore
```

4. Nama database boleh dibiarkan sebagai:

```text
neondb
```

5. Klik **Create Project**.
6. Tunggu sampai project selesai dibuat.

## 3.3 Membuat seluruh tabel dengan SQL Editor

Anda tidak perlu menjalankan perintah terminal. Gunakan file `neon-schema.sql` yang sudah disiapkan.

1. Di dashboard project Neon, buka menu **SQL Editor**.
2. Di komputer, buka file `neon-schema.sql` menggunakan Notepad, Visual Studio Code, atau editor teks lain.
3. Tekan **Ctrl + A** untuk memilih seluruh isi file.
4. Tekan **Ctrl + C** untuk menyalin.
5. Kembali ke Neon SQL Editor.
6. Klik area editor SQL.
7. Tekan **Ctrl + V** untuk menempel.
8. Klik tombol **Run**.
9. Tunggu sampai muncul pesan berhasil atau sukses.

File SQL tidak menghapus data. Perintah menggunakan `IF NOT EXISTS`, sehingga aman dijalankan ulang untuk memastikan tabel yang belum ada dibuat.

## 3.4 Memastikan tabel berhasil dibuat

Hapus isi SQL Editor atau buat tab query baru, lalu tempel query berikut:

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Klik **Run**.

Beberapa tabel yang harus terlihat:

```text
kelas
siswa
sesi_aktif
slide
soal_diagnostik
jawaban
soal_worksheet
jawaban_worksheet
soal_kuis
kuis_session
kuis_jawaban
refleksi
voting
cobax_jawaban
annotation_stiker
```

Jika tabel-tabel tersebut muncul, schema database berhasil dibuat.

---

# BAGIAN 4 - MENGAMBIL DATABASE_URL DARI NEON

Aplikasi hanya memiliki **satu environment variable wajib**, yaitu `DATABASE_URL`.

## 4.1 Membuka menu Connect

1. Di dashboard project Neon, klik tombol **Connect**.
2. Pilih database `neondb` atau database yang Anda buat.
3. Pilih role atau user default yang diberikan Neon.
4. Jika ada pilihan tipe koneksi, pilih:

```text
Pooled connection
```

Pooled connection lebih cocok untuk Vercel.

5. Pastikan connection string memiliki:

```text
sslmode=require
```

6. Klik ikon **Copy** untuk menyalin connection string.

Bentuknya kurang lebih seperti ini:

```text
postgresql://neondb_owner:PASSWORD_RAHASIA@ep-nama-project-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Contoh di atas hanya contoh. Gunakan URL asli yang diberikan akun Neon Anda.

## 4.2 Arti bagian DATABASE_URL

```text
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

| Bagian | Isi |
|---|---|
| `USER` | Nama role database dari Neon |
| `PASSWORD` | Password database rahasia dari Neon |
| `HOST` | Alamat server Neon, biasanya mengandung `pooler` |
| `DATABASE` | Biasanya `neondb` |
| `sslmode=require` | Memastikan koneksi aman menggunakan SSL |

Jangan menghapus tanda, karakter, atau bagian apa pun dari URL yang disalin Neon.

Simpan URL tersebut sementara di Notepad pribadi. Jangan kirim ke orang lain dan jangan unggah ke GitHub.

---

# BAGIAN 5 - MEMBUAT REPOSITORY GITHUB TANPA GIT

## 5.1 Membuat akun GitHub

1. Buka <https://github.com>.
2. Klik **Sign Up**.
3. Selesaikan pendaftaran dan verifikasi email.

## 5.2 Membuat repository baru

1. Setelah login, klik ikon **+** di kanan atas.
2. Pilih **New repository**.
3. Pada **Repository name**, isi:

```text
faktorku
```

4. Pilih **Private** jika kode hanya ingin dilihat oleh Anda.
5. Pada pilihan README, jangan centang **Add a README file**.
6. Jangan tambahkan `.gitignore` dari GitHub.
7. Jangan tambahkan license.
8. Klik **Create repository**.

Anda akan masuk ke halaman repository kosong.

## 5.3 Mengunggah project melalui website GitHub

1. Pada halaman repository kosong, klik link **uploading an existing file**.

Jika repository tidak kosong:

1. Klik **Add file**.
2. Pilih **Upload files**.

Kemudian:

1. Buka folder project yang sudah diekstrak di komputer.
2. Pilih semua file dan folder di dalamnya.
3. Jangan memilih folder pembungkus paling luar jika itu menyebabkan `package.json` berada satu tingkat terlalu dalam.
4. Seret file dan folder yang dipilih ke area upload GitHub.
5. Tunggu sampai seluruh daftar file selesai diproses.

Pastikan struktur yang terlihat di GitHub nanti seperti ini:

```text
faktorku/
├── src/
├── public/
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── neon-schema.sql
├── panduan.md
└── .env.example
```

Bukan seperti ini:

```text
faktorku/faktorku/package.json
```

`package.json` harus langsung berada di halaman utama repository.

## 5.4 Jika GitHub membatasi jumlah file

GitHub dapat membatasi jumlah file pada satu kali upload. Jika upload gagal:

1. Upload file root terlebih dahulu:
   - `package.json`
   - `package-lock.json`
   - `next.config.ts`
   - `tsconfig.json`
   - `neon-schema.sql`
   - `.env.example`
2. Klik **Commit changes**.
3. Klik **Add file** lalu **Upload files** lagi.
4. Upload folder `src`.
5. Commit kembali.
6. Upload folder `public`.
7. Commit kembali.

Anda boleh melakukan upload dalam beberapa tahap.

## 5.5 Menyimpan file di GitHub

Di bagian bawah halaman upload:

1. Pada kotak commit message, isi:

```text
Upload aplikasi FAKTORKU
```

2. Pilih **Commit directly to the main branch**.
3. Klik **Commit changes**.

Tunggu sampai kembali ke halaman repository.

## 5.6 Periksa file rahasia

Periksa daftar file GitHub. Pastikan tidak ada:

```text
.env
.env.local
node_modules
.next
```

Jika ada `.env` atau `.env.local`:

1. Klik file tersebut.
2. Klik ikon tiga titik atau ikon tempat sampah.
3. Pilih **Delete file**.
4. Klik **Commit changes**.
5. Ganti password database Neon karena URL rahasia pernah terunggah.

---

# BAGIAN 6 - DEPLOY KE VERCEL

## 6.1 Membuat akun Vercel

1. Buka <https://vercel.com>.
2. Klik **Sign Up**.
3. Pilih **Continue with GitHub**.
4. Izinkan Vercel membaca repository GitHub Anda.

## 6.2 Mengimpor repository

1. Di dashboard Vercel, klik **Add New**.
2. Pilih **Project**.
3. Cari repository bernama `faktorku`.
4. Klik **Import**.

Jika repository tidak terlihat:

1. Klik **Adjust GitHub App Permissions**.
2. Beri akses ke repository `faktorku`.
3. Kembali ke Vercel dan refresh halaman.

## 6.3 Pengaturan project Vercel

Pada halaman Configure Project:

- **Framework Preset**: pilih atau biarkan `Next.js`.
- **Root Directory**: biarkan `./`.
- **Build Command**: biarkan default `next build` atau `npm run build`.
- **Output Directory**: biarkan default.
- **Install Command**: biarkan default `npm install`.

Jangan langsung klik Deploy. Tambahkan environment variable terlebih dahulu.

---

# BAGIAN 7 - MENGISI ENVIRONMENT VARIABLES DI VERCEL

## 7.1 Environment variable wajib

Buka bagian **Environment Variables** pada halaman Configure Project.

Tambahkan variabel berikut:

### Name

```text
DATABASE_URL
```

### Value

Isi dengan seluruh connection string **Pooled** yang disalin dari Neon. Contoh bentuknya:

```text
postgresql://neondb_owner:PASSWORD_RAHASIA@ep-nama-project-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Jangan menggunakan tanda petik pada kotak Value di Vercel. Tempel URL-nya saja.

Pilih environment:

- Production
- Preview
- Development

Jika tersedia tombol **Add**, klik tombol tersebut.

## 7.2 Environment variable opsional

Aplikasi saat ini tidak wajib memakai variabel ini, tetapi boleh ditambahkan setelah website selesai terbit:

### Name

```text
NEXT_PUBLIC_APP_URL
```

### Value

```text
https://NAMA-PROJECT-ANDA.vercel.app
```

Ganti dengan domain Vercel asli Anda.

Contoh:

```text
https://faktorku.vercel.app
```

Karena domain Vercel baru diketahui setelah deployment pertama, variabel ini boleh tidak diisi.

## 7.3 Variabel yang tidak diperlukan

Versi aplikasi saat ini tidak memerlukan:

```text
PUSHER_APP_ID
PUSHER_KEY
PUSHER_SECRET
NEXT_PUBLIC_PUSHER_KEY
BLOB_READ_WRITE_TOKEN
```

Jangan mengisi nilai palsu untuk variabel tersebut. Cukup gunakan `DATABASE_URL`.

---

# BAGIAN 8 - MENJALANKAN DEPLOYMENT

Setelah `DATABASE_URL` ditambahkan:

1. Klik **Deploy**.
2. Tunggu proses Building.
3. Proses dapat memakan waktu beberapa menit.
4. Jika berhasil, Vercel menampilkan halaman Congratulations.
5. Klik **Continue to Dashboard** atau **Visit**.

Anda akan mendapat alamat seperti:

```text
https://faktorku-abc123.vercel.app
```

---

# BAGIAN 9 - MENYIAPKAN DATA SOAL DAN SLIDE

Anda tidak perlu menempel data soal melalui Neon SQL Editor.

Aplikasi mengisi slide, apersepsi, worksheet, dan tiga paket kuis secara otomatis ketika fitur pertama kali digunakan.

Cara termudah:

1. Buka website Vercel Anda.
2. Login sebagai guru.
3. Buat kelas baru.
4. Saat kelas dibuat, aplikasi menjalankan seed data otomatis.

Alternatif, buka alamat berikut satu per satu:

```text
https://DOMAIN-ANDA.vercel.app/api/slide
https://DOMAIN-ANDA.vercel.app/api/apersepsi/soal
https://DOMAIN-ANDA.vercel.app/api/kuis/soal?paket=1
https://DOMAIN-ANDA.vercel.app/api/kuis/soal?paket=2
https://DOMAIN-ANDA.vercel.app/api/kuis/soal?paket=3
https://DOMAIN-ANDA.vercel.app/api/worksheet/soal
```

Ganti `DOMAIN-ANDA` dengan alamat Vercel Anda.

Jika terlihat JSON, endpoint berhasil dan data awal sudah tersedia.

---

# BAGIAN 10 - MEMERIKSA WEBSITE

## 10.1 Periksa koneksi database

Buka:

```text
https://DOMAIN-ANDA.vercel.app/api/health
```

Hasil yang benar:

```json
{"ok":true}
```

Jika hasilnya `ok: false` atau error 500, baca Bagian Troubleshooting.

## 10.2 Uji alur guru dan siswa

Gunakan dua perangkat atau dua jendela browser.

### Jendela pertama sebagai guru

1. Buka website.
2. Pilih login Guru.
3. Masukkan nama guru.
4. Buat kelas, misalnya `X AKL 1`.
5. Catat kode kelas yang muncul.

### Jendela kedua sebagai siswa

1. Buka website yang sama.
2. Pilih login Siswa.
3. Masukkan nama siswa.
4. Masukkan kode kelas dari guru.
5. Pastikan nama siswa muncul pada cover guru.

### Uji sinkronisasi

1. Di dashboard guru, aktifkan **HP siswa ikut slide**.
2. Tekan slide berikutnya.
3. Tunggu sekitar 1 sampai 3 detik.
4. Pastikan layar siswa ikut berpindah.

Uji juga:

- Apersepsi
- Voting kasus Rina
- CobaX 0 sampai 30
- LKPD dan timer
- Coretan bebas di proyektor
- Paket kuis 1, 2, dan 3
- Refleksi dan word cloud
- Akhiri sesi

---

# BAGIAN 11 - MENGGANTI DOMAIN PROJECT

Secara default, Vercel memberi nama domain otomatis.

Untuk mengganti nama project:

1. Buka dashboard project Vercel.
2. Klik **Settings**.
3. Buka **General**.
4. Cari **Project Name**.
5. Ganti menjadi nama yang tersedia, misalnya:

```text
faktorku-smk
```

Vercel akan membuat domain baru seperti:

```text
https://faktorku-smk.vercel.app
```

Jika Anda menambahkan `NEXT_PUBLIC_APP_URL`, ubah nilainya ke domain baru dan lakukan Redeploy.

---

# BAGIAN 12 - CARA MEMPERBARUI WEBSITE TANPA GIT

Jika Anda menerima folder project versi baru:

1. Ekstrak ZIP versi baru.
2. Buka repository `faktorku` di GitHub.
3. Klik **Add file**.
4. Pilih **Upload files**.
5. Seret file versi baru ke area upload.
6. GitHub akan menandai file yang berubah.
7. Isi commit message:

```text
Perbarui aplikasi FAKTORKU
```

8. Klik **Commit changes**.
9. Vercel akan otomatis melakukan deployment ulang.
10. Buka menu **Deployments** di Vercel untuk melihat prosesnya.

Jika jumlah file terlalu banyak, upload hanya file yang berubah. Misalnya:

- Perubahan tampilan: upload folder `src`.
- Perubahan file publik: upload folder `public`.
- Perubahan dependency: upload `package.json` dan `package-lock.json`.
- Perubahan database: jalankan SQL tambahan melalui Neon SQL Editor.

Jangan menghapus folder lain di GitHub secara sembarangan.

---

# BAGIAN 13 - CARA MENGUBAH ENVIRONMENT VARIABLE SETELAH DEPLOY

1. Buka project di Vercel.
2. Klik **Settings**.
3. Klik **Environment Variables**.
4. Cari `DATABASE_URL`.
5. Klik ikon tiga titik.
6. Pilih **Edit**.
7. Tempel URL Pooled Neon yang baru.
8. Simpan.
9. Buka menu **Deployments**.
10. Klik tiga titik pada deployment terbaru.
11. Pilih **Redeploy**.

Perubahan environment variable tidak selalu diterapkan ke deployment lama. Lakukan Redeploy setelah mengubahnya.

---

# BAGIAN 14 - TROUBLESHOOTING

## Masalah 1: Vercel menampilkan DATABASE_URL is required

Penyebab: `DATABASE_URL` belum ditambahkan atau salah nama.

Solusi:

1. Buka Vercel Project.
2. Buka Settings.
3. Buka Environment Variables.
4. Pastikan namanya persis:

```text
DATABASE_URL
```

Huruf besar dan underscore harus sama.

5. Pastikan Value berisi URL Neon lengkap.
6. Simpan dan Redeploy.

## Masalah 2: `/api/health` menghasilkan 500

Kemungkinan penyebab:

- URL database salah.
- Password Neon salah.
- Menggunakan direct connection yang tidak cocok.
- `sslmode=require` hilang.
- Tabel belum dibuat.

Solusi:

1. Salin ulang **Pooled connection string** dari Neon.
2. Perbarui `DATABASE_URL` di Vercel.
3. Jalankan kembali `neon-schema.sql` di Neon SQL Editor.
4. Redeploy Vercel.

## Masalah 3: Relation atau table does not exist

Artinya schema belum dibuat.

1. Buka Neon SQL Editor.
2. Buka file `neon-schema.sql` di komputer.
3. Salin seluruh isi.
4. Tempel dan klik Run.
5. Redeploy Vercel.

## Masalah 4: Repository tidak terlihat di Vercel

1. Klik **Add New Project**.
2. Klik **Adjust GitHub App Permissions**.
3. Pilih repository `faktorku`.
4. Simpan izin.
5. Refresh Vercel.

## Masalah 5: Build Vercel gagal karena package tidak ditemukan

Pastikan GitHub memiliki:

```text
package.json
package-lock.json
```

Keduanya harus berada langsung di root repository, bukan di dalam folder tambahan.

## Masalah 6: Website tampil tetapi soal kosong

Buka:

```text
https://DOMAIN-ANDA.vercel.app/api/slide
```

Lalu buka:

```text
https://DOMAIN-ANDA.vercel.app/api/kuis/soal?paket=1
```

Setelah itu refresh dashboard guru.

## Masalah 7: Siswa tidak ikut berpindah slide

- Pastikan **HP siswa ikut slide** aktif.
- Pastikan guru dan siswa menggunakan kode kelas yang sama.
- Pastikan HP siswa terhubung ke internet.
- Tunggu sekitar 1 sampai 3 detik karena sinkronisasi menggunakan polling.

## Masalah 8: GitHub menolak upload karena terlalu banyak file

Upload dalam beberapa tahap:

1. File root.
2. Folder `src`.
3. Folder `public`.

Jangan upload `node_modules` dan `.next`.

---

# BAGIAN 15 - CHECKLIST SEBELUM DIPAKAI DI KELAS

## Database

- [ ] Project Neon sudah dibuat.
- [ ] `neon-schema.sql` sudah dijalankan.
- [ ] Daftar tabel tampil di Neon.
- [ ] Pooled connection string sudah disalin.

## GitHub

- [ ] `package.json` berada di root repository.
- [ ] Folder `src` sudah terunggah.
- [ ] Folder `public` sudah terunggah.
- [ ] `.env` dan `.env.local` tidak ada di GitHub.
- [ ] `node_modules` dan `.next` tidak ada di GitHub.

## Vercel

- [ ] Repository berhasil diimpor.
- [ ] Framework terdeteksi Next.js.
- [ ] `DATABASE_URL` sudah ditambahkan.
- [ ] Deployment berhasil.
- [ ] `/api/health` menghasilkan `{"ok":true}`.

## Pengujian kelas

- [ ] Guru dapat membuat kelas.
- [ ] Kode kelas terlihat pada cover.
- [ ] Siswa dapat login.
- [ ] Nama siswa muncul dalam daftar hadir.
- [ ] Slide siswa mengikuti guru.
- [ ] Voting berhasil.
- [ ] CobaX berhasil.
- [ ] Paket kuis 1, 2, dan 3 tersedia.
- [ ] Refleksi tampil pada word cloud.
- [ ] Tombol Akhiri Sesi bekerja.

---

# RINGKASAN ENVIRONMENT VARIABLE

Environment variable wajib di Vercel:

```text
Name  : DATABASE_URL
Value : connection string Pooled dari Neon
```

Contoh bentuk Value:

```text
postgresql://neondb_owner:PASSWORD@ep-project-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Environment variable opsional:

```text
Name  : NEXT_PUBLIC_APP_URL
Value : https://nama-project.vercel.app
```

Untuk versi aplikasi saat ini, **cukup `DATABASE_URL` agar aplikasi dapat berjalan**.
