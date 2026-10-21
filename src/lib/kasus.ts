/** Naskah kasus nyata untuk dibaca bersama saat Apersepsi (tampil di proyektor) */

export interface KasusData {
  judul: string;
  pembuka: string;
  paragraf: string[];
  tabel: { komponen: string; rincian: string; rumus: string; nada: "masuk" | "keluar" }[];
  pertanyaanPemantik: string[];
  catatan: string;
}

export const KASUS: KasusData = {
  judul: "Usaha Keripik Pisang Rina",
  pembuka:
    "Bacalah bersama-sama. Perhatikan setiap angka yang muncul, kita akan memakainya sebentar lagi.",
  paragraf: [
    "Rina punya usaha sablon kaos. Setiap minggu dia memproduksi x kaos. Dia menjual satu kaos seharga 50 ribu. Jika terjual x kaos, uang yang masuk ke kantong Rina adalah 50x ribu.",
    "Tetapi berjualan tidak gratis. Ada tiga biaya: bahan sablon 30 ribu untuk setiap kaos (total 30x), biaya tetap sewa dan listrik 75 ribu untuk seminggu penuh (tetap), dan biaya tenaga kerja sebesar x ribu untuk setiap kaos.",
    "Yang paling menarik adalah biaya tenaga kerja itu. Karena jumlah kaos juga x, totalnya menjadi x kali x alias x^2. Inilah yang membuat masalah Rina bukan lagi soal aritmetika biasa, melainkan persamaan kuadrat.",
    "Suatu sore, Rina berdiri di depan meja kerjanya dan bertanya: “Berapa kaos yang harus aku jual supaya uang masuk tepat sama dengan semua biaya? Tidak untung, tapi juga tidak rugi. Balik modal.”",
  ],
  tabel: [
    { komponen: "Harga jual per kaos", rincian: "50 ribu × x kaos", rumus: "50x", nada: "masuk" },
    { komponen: "Bahan sablon per kaos", rincian: "30 ribu × x kaos", rumus: "30x", nada: "keluar" },
    { komponen: "Tenaga kerja per kaos", rincian: "x ribu/kaos × x kaos (jumlah kaos = x)", rumus: "x^2", nada: "keluar" },
    { komponen: "Sewa & listrik (tetap/minggu)", rincian: "75 ribu, tidak tergantung jumlah kaos", rumus: "75", nada: "keluar" },
  ],
  pertanyaanPemantik: [
    "Dari data ini, bisa tidak kita menentukan Rina untung atau rugi?",
    "Informasi apa yang kita butuhkan untuk menjawab pertanyaan itu?",
    "Mengapa biaya tenaga kerja menjadi x^2 dan bukan biasa x?",
  ],
  catatan:
    "Simpan dulu rasa penasaranmu, slide setelah ini kita akan melihat jawaban dan mulai memikirkan kembali lewat CobaX.",
};

export const KASUS_PERSAMAAN = {
  langkah: ["Pendapatan = Biaya", "50x = x^2 + 30x + 75", "0 = x^2 - 20x + 75"],
  hasil: "x^2 - 20x + 75 = 0",
};
