import { db } from "@/db";
import { soalKuis } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Daftar soal kuis yang DISANITASI (tanpa kunci) untuk halaman siswa */
export async function GET(req: Request) {
  await ensureSeed();
  const { searchParams } = new URL(req.url);
  const paket = Math.max(1, Math.min(3, Number(searchParams.get("paket")) || 1));
  const rows = (await db.select().from(soalKuis).orderBy(soalKuis.nomor)).filter((r) => r.paket === paket);
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
