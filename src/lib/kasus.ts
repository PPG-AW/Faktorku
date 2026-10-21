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
    "Bacalah bersama-sama. Perhatikan setiap angka yang muncul — kita akan memakainya sebentar lagi.",
  paragraf: [
    "Rina, siswa kelas X, membantu ibunya berjualan keripik pisang di depan sekolah. Setiap bungkus ia jual seharga 50 (dalam ratusan rupiah). Jika terjual x bungkus, maka uang yang masuk ke kantong Rina adalah 50x.",
    "Tetapi berjualan tidak gratis. Rina harus membayar sewa lapak dan plastik kemasan sebesar 75, berapa pun jumlah yang terjual. Bahan baku pisang menghabiskan 30 untuk setiap bungkus, sehingga totalnya 30x.",
    "Ada satu hal unik: semakin banyak Rina berproduksi, biaya promosinya ikut melonjak lebih cepat — ia harus mencetak brosur, membeli kuota untuk promosi online, dan memberi tester gratis. Biaya ini ternyata mengikuti pola x kali x, alias x².",
    "Suatu sore Rina bertanya kepada dirinya sendiri: “Berapa bungkus yang harus terjual supaya aku tidak rugi — uang masuk tepat sama dengan uang keluar?”",
  ],
  tabel: [
    { komponen: "Harga jual per bungkus", rincian: "50 per bungkus × x bungkus", rumus: "50x", nada: "masuk" },
    { komponen: "Sewa lapak & kemasan", rincian: "tetap, berapa pun penjualan", rumus: "75", nada: "keluar" },
    { komponen: "Bahan baku pisang", rincian: "30 per bungkus × x bungkus", rumus: "30x", nada: "keluar" },
    { komponen: "Promosi (naik cepat)", rincian: "melonjak mengikuti pola kuadrat", rumus: "x^2", nada: "keluar" },
  ],
  pertanyaanPemantik: [
    "Pernahkah kamu berjualan? Apa yang kamu jual dan bagaimana rasanya?",
    "Menurutmu, apa artinya “impas” atau “balik modal” bagi Rina?",
    "Jika pendapatan harus sama dengan biaya, persamaan apa yang terbentuk?",
  ],
  catatan:
    "Simpan dulu rasa penasaranmu — jawaban soal diagnostik di HP kalian akan muncul langsung di layar ini.",
};

export const KASUS_PERSAMAAN = {
  langkah: ["Pendapatan = Biaya", "50x = x^2 + 30x + 75", "0 = x^2 - 20x + 75"],
  hasil: "x^2 - 20x + 75 = 0",
};
