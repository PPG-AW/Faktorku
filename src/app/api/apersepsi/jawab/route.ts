import { db } from "@/db";
import { jawaban, soalDiagnostik } from "@/db/schema";
import { gradeDiagnostik } from "@/lib/scoring";
import { uid } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { siswaId, soalId, jawaban: jaw } = await req.json();
    const text = String(jaw ?? "").trim();
    if (!siswaId || !soalId || text === "") {
      return NextResponse.json({ error: "Jawaban kosong." }, { status: 400 });
    }

    const s = await db.select().from(soalDiagnostik).where(eq(soalDiagnostik.id, String(soalId))).limit(1);
    if (s.length === 0) return NextResponse.json({ error: "Soal tidak ditemukan." }, { status: 404 });
    const soal = s[0];

    const existing = await db
      .select()
      .from(jawaban)
      .where(and(eq(jawaban.siswaId, String(siswaId)), eq(jawaban.soalId, soal.id)))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ ok: true, already: true, benar: existing[0].benar, skor: existing[0].skor });
    }

    const benar = gradeDiagnostik(soal.tipe, soal.kunci, text);
    const skor = benar ? soal.skor : 0;

    await db.insert(jawaban).values({
      id: uid(),
      siswaId: String(siswaId),
      soalId: soal.id,
      jawaban: text,
      benar,
      skor,
    });

    return NextResponse.json({ ok: true, benar, skor, tipe: soal.tipe });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
