import { db } from "@/db";
import { kuisJawaban, kuisSession, siswa, soalKuis } from "@/db/schema";
import { gradeKuis } from "@/lib/scoring";
import { poinKuis } from "@/lib/aktivitas-data";
import { and, eq, desc, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { siswaId, soalId } = body;
    const jaw = String(body.jawaban ?? "").trim();
    const waktu = Math.max(0, Number(body.waktu) || 0);
    const kosong = Boolean(body.kosong);

    if (!siswaId || !soalId) return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });

    const sw = await db.select().from(siswa).where(eq(siswa.id, String(siswaId))).limit(1);
    if (sw.length === 0) return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });

    const s = await db
      .select()
      .from(kuisSession)
      .where(and(eq(kuisSession.kelasId, sw[0].kelasId), eq(kuisSession.aktif, true)))
      .orderBy(desc(kuisSession.startedAt))
      .limit(1);
    if (s.length === 0) return NextResponse.json({ error: "Kuis tidak sedang berjalan." }, { status: 400 });
    const session = s[0];

    const soalRows = await db.select().from(soalKuis).where(eq(soalKuis.id, String(soalId))).limit(1);
    if (soalRows.length === 0) return NextResponse.json({ error: "Soal tidak ditemukan." }, { status: 404 });
    const soal = soalRows[0];

    if (soal.nomor !== session.soalAktif) {
      return NextResponse.json({ error: "Soal ini sudah tidak aktif." }, { status: 410 });
    }

    const benar = !kosong && gradeKuis(soal.tipe, soal.kunci, jaw);

    // Poin kecepatan: urutan benar = jumlah jawaban benar sebelumnya + 1
    let skor = 0;
    let urutan = 0;
    if (benar) {
      const benarRows = await db
        .select({ c: count() })
        .from(kuisJawaban)
        .where(and(eq(kuisJawaban.sessionId, session.id), eq(kuisJawaban.soalId, soal.id), eq(kuisJawaban.benar, true)));
      urutan = (benarRows[0]?.c ?? 0) + 1;
      skor = poinKuis(urutan);
    }

    const inserted = await db
      .insert(kuisJawaban)
      .values({
        id: crypto.randomUUID(), sessionId: session.id, siswaId: String(siswaId), soalId: soal.id,
        jawaban: kosong ? "" : jaw, benar, skor, waktu, kosong: kosong || jaw === "",
      })
      .onConflictDoNothing()
      .returning();

    if (inserted.length === 0) return NextResponse.json({ ok: true, already: true });
    return NextResponse.json({ ok: true, benar, skor, urutan });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
