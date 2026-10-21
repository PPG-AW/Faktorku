import { db } from "@/db";
import { jawabanWorksheet, siswa, soalWorksheet } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  const { kelasId } = await params;
  await ensureSeed();

  const soals = await db.select().from(soalWorksheet).orderBy(soalWorksheet.nomor);
  const siswaRows = await db.select().from(siswa).where(eq(siswa.kelasId, kelasId)).orderBy(siswa.nama);
  const ids = new Set(siswaRows.map((s) => s.id));
  const all = (await db.select().from(jawabanWorksheet)).filter((r) => ids.has(r.siswaId));

  const perSoal = soals.map((s) => {
    const js = all.filter((r) => r.soalId === s.id);
    const selesai = js.length;
    const benar = js.filter((r) => r.benar).length;
    const avgSkor = selesai > 0 ? Math.round(js.reduce((a, b) => a + b.skor, 0) / selesai) : 0;
    const avgHint = selesai > 0 ? Math.round((js.reduce((a, b) => a + b.hintDipakai, 0) / selesai) * 10) / 10 : 0;
    const avgWaktu = selesai > 0 ? Math.round(js.reduce((a, b) => a + b.waktu, 0) / selesai) : 0;
    return { soalId: s.id, nomor: s.nomor, pertanyaan: s.pertanyaan, tipe: s.tipe, selesai, benar, avgSkor, avgHint, avgWaktu };
  });

  const matrix = siswaRows.map((sw) => ({
    siswaId: sw.id,
    nama: sw.nama,
    perSoal: Object.fromEntries(
      soals.map((s) => {
        const r = all.find((x) => x.siswaId === sw.id && x.soalId === s.id);
        return [s.id, r ? { skor: r.skor, benar: r.benar, hint: r.hintDipakai } : null];
      })
    ),
    totalSkor: all.filter((x) => x.siswaId === sw.id).reduce((a, b) => a + b.skor, 0),
  }));

  return NextResponse.json({ soal: perSoal, matrix, totalSiswa: siswaRows.length });
}
