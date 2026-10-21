import { db } from "@/db";
import { soalKuis } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Daftar soal kuis yang DISANITASI (tanpa kunci) untuk halaman siswa */
export async function GET() {
  await ensureSeed();
  const rows = await db.select().from(soalKuis).orderBy(soalKuis.nomor);
  return NextResponse.json({
    soal: rows.map((s) => ({
      id: s.id,
      nomor: s.nomor,
      pertanyaan: s.pertanyaan,
      tipe: s.tipe,
      opsi: s.opsi,
      timer: s.timer,
      skor: s.skor,
    })),
  });
}
