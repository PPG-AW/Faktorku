import { db } from "@/db";
import { jawaban, siswa, soalDiagnostik } from "@/db/schema";
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

  const soals = await db.select().from(soalDiagnostik).orderBy(soalDiagnostik.nomor);
  const siswaRows = await db.select().from(siswa).where(eq(siswa.kelasId, kelasId));
  const siswaIds = new Set(siswaRows.map((s) => s.id));
  const totalSiswa = siswaRows.length;

  const allJawaban = await db.select().from(jawaban);
  const relevant = allJawaban.filter((j) => siswaIds.has(j.siswaId));

  const perSoal = soals.map((s) => {
    const js = relevant.filter((j) => j.soalId === s.id);
    if (s.tipe === "terbuka") {
      return {
        soalId: s.id,
        nomor: s.nomor,
        pertanyaan: s.pertanyaan,
        tipe: s.tipe,
        terjawab: js.length,
        texts: js.map((j) => j.jawaban),
      };
    }
    const opsiCount: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    let benarCount = 0;
    for (const j of js) {
      opsiCount[j.jawaban] = (opsiCount[j.jawaban] ?? 0) + 1;
      if (j.benar) benarCount++;
    }
    return {
      soalId: s.id,
      nomor: s.nomor,
      pertanyaan: s.pertanyaan,
      tipe: s.tipe,
      opsi: s.opsi,
      kunci: s.kunci,
      terjawab: js.length,
      benar: benarCount,
      opsiCount,
    };
  });

  const terjawabSet = new Set(relevant.map((j) => j.siswaId));

  return NextResponse.json({
    soal: perSoal,
    totalSiswa,
    siswaMenjawab: terjawabSet.size,
  });
}
