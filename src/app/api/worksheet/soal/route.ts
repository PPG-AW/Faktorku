import { db } from "@/db";
import { jawabanWorksheet, soalWorksheet, type WorksheetData } from "@/db/schema";
import { gradeWorksheet, type WsJawabanInput } from "@/lib/scoring";
import { ensureSeed } from "@/lib/seed";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function solusiText(data: WorksheetData) {
  const s1 = data.fb1 >= 0 ? `+ ${data.fb1}` : `- ${Math.abs(data.fb1)}`;
  const s2 = data.fb2 >= 0 ? `+ ${data.fb2}` : `- ${Math.abs(data.fb2)}`;
  const f1 = data.fa1 === 1 ? "x" : `${data.fa1}x`;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000));
  return {
    p: data.p,
    q: data.q,
    faktor: `(${f1} ${s1})(x ${s2}) = 0`,
    akar: `x = ${fmt(data.akar[0])} atau x = ${fmt(data.akar[1])}`,
  };
}

export async function GET(req: Request) {
  await ensureSeed();
  const { searchParams } = new URL(req.url);
  const siswaId = searchParams.get("siswaId");

  const soals = await db.select().from(soalWorksheet).orderBy(soalWorksheet.nomor);

  let hasilMap: Record<string, unknown> = {};
  if (siswaId) {
    const rows = await db
      .select()
      .from(jawabanWorksheet)
      .where(eq(jawabanWorksheet.siswaId, siswaId));
    hasilMap = Object.fromEntries(
      rows.map((r) => {
        const soal = soals.find((s) => s.id === r.soalId);
        if (!soal) return [r.soalId, null];
        const grade = gradeWorksheet(soal.data, r.jawaban as WsJawabanInput, r.hintDipakai);
        return [
          r.soalId,
          {
            ...grade,
            skor: r.skor,
            hintDipakai: r.hintDipakai,
            waktu: r.waktu,
            solusi: solusiText(soal.data),
          },
        ];
      })
    );
  }

  return NextResponse.json({
    soal: soals.map((s) => ({
      id: s.id,
      nomor: s.nomor,
      pertanyaan: s.pertanyaan,
      tipe: s.tipe,
      timer: s.timer,
      // Sanitasi: kunci p/q/faktor/akar tidak dikirim ke siswa — dinilai di server
      data: { a: s.data.a, b: s.data.b, c: s.data.c, hint: s.data.hint },
    })),
    hasil: hasilMap,
  });
}
