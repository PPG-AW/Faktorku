import { db } from "@/db";
import { jawaban, soalDiagnostik } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureSeed();
  const { searchParams } = new URL(req.url);
  const siswaId = searchParams.get("siswaId");

  const soals = await db.select().from(soalDiagnostik).orderBy(soalDiagnostik.nomor);

  let jawabanMap: Record<string, { jawaban: string; benar: boolean }> = {};
  if (siswaId) {
    const rows = await db.select().from(jawaban).where(eq(jawaban.siswaId, siswaId));
    jawabanMap = Object.fromEntries(rows.map((r) => [r.soalId, { jawaban: r.jawaban, benar: r.benar }]));
  }

  return NextResponse.json({
    soal: soals.map((s) => ({
      id: s.id,
      nomor: s.nomor,
      pertanyaan: s.pertanyaan,
      tipe: s.tipe,
      opsi: s.opsi,
      skor: s.skor,
    })),
    jawaban: jawabanMap,
  });
}
