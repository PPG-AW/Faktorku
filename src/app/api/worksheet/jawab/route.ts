import { db } from "@/db";
import { jawabanWorksheet, soalWorksheet } from "@/db/schema";
import { gradeWorksheet, type WsJawabanInput } from "@/lib/scoring";
import { parseNum, uid } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function solusiText(data: {
  fa1: number; fb1: number; fa2: number; fb2: number; akar: [number, number];
}) {
  const s1 = data.fb1 >= 0 ? `+ ${data.fb1}` : `- ${Math.abs(data.fb1)}`;
  const s2 = data.fb2 >= 0 ? `+ ${data.fb2}` : `- ${Math.abs(data.fb2)}`;
  const f1 = data.fa1 === 1 ? "x" : `${data.fa1}x`;
  const fmtAkar = (v: number) =>
    Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000);
  return {
    faktor: `(${f1} ${s1})(x ${s2}) = 0`,
    akar: `x = ${fmtAkar(data.akar[0])} atau x = ${fmtAkar(data.akar[1])}`,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { siswaId, soalId } = body;
    const j = body.jawaban as WsJawabanInput;
    const hintDipakai = Math.max(0, Math.min(3, Number(body.hintDipakai) || 0));
    const waktu = Math.max(0, Number(body.waktu) || 0);

    if (!siswaId || !soalId || !j) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    const s = await db.select().from(soalWorksheet).where(eq(soalWorksheet.id, String(soalId))).limit(1);
    if (s.length === 0) return NextResponse.json({ error: "Soal tidak ditemukan." }, { status: 404 });
    const soal = s[0];

    const existing = await db
      .select()
      .from(jawabanWorksheet)
      .where(and(eq(jawabanWorksheet.siswaId, String(siswaId)), eq(jawabanWorksheet.soalId, soal.id)))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ ok: true, already: true, skor: existing[0].skor, benar: existing[0].benar });
    }

    // Normalisasi input mentah (string) ke angka bila perlu
    const norm: WsJawabanInput = {
      p: typeof j.p === "number" ? j.p : parseNum(String(j.p ?? "")),
      q: typeof j.q === "number" ? j.q : parseNum(String(j.q ?? "")),
      fb1: typeof j.fb1 === "number" ? j.fb1 : parseNum(String(j.fb1 ?? "")),
      fb2: typeof j.fb2 === "number" ? j.fb2 : parseNum(String(j.fb2 ?? "")),
      x1: typeof j.x1 === "number" ? j.x1 : parseNum(String(j.x1 ?? "")),
      x2: typeof j.x2 === "number" ? j.x2 : parseNum(String(j.x2 ?? "")),
    };

    const grade = gradeWorksheet(soal.data, norm, hintDipakai);
    const sol = solusiText(soal.data);

    await db.insert(jawabanWorksheet).values({
      id: uid(),
      siswaId: String(siswaId),
      soalId: soal.id,
      jawaban: norm as unknown as Record<string, unknown>,
      benar: grade.benar,
      skor: grade.skor,
      hintDipakai,
      waktu,
    });

    return NextResponse.json({
      ok: true,
      ...grade,
      solusi: { p: soal.data.p, q: soal.data.q, ...sol },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
