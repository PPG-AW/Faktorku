import { db } from "@/db";
import { kuisJawaban, kuisSession, siswa, soalKuis } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  const { kelasId } = await params;
  await ensureSeed();

  const [session] = await db
    .select()
    .from(kuisSession)
    .where(eq(kuisSession.kelasId, kelasId))
    .orderBy(desc(kuisSession.startedAt))
    .limit(1);

  const soalRows = await db.select().from(soalKuis).orderBy(soalKuis.nomor);
  const maxSkor = soalRows.reduce((a, b) => a + b.skor, 0);

  if (!session) {
    return NextResponse.json({ session: null, entries: [], maxSkor, soalStats: [], totalSoal: soalRows.length });
  }

  const paketSoal = soalRows.filter((r) => r.paket === session.paket);
  const siswaRows = await db.select().from(siswa).where(eq(siswa.kelasId, kelasId));
  const allJawaban = await db.select().from(kuisJawaban).where(eq(kuisJawaban.sessionId, session.id));

  const entries = siswaRows
    .map((sw) => {
      const js = allJawaban.filter((j) => j.siswaId === sw.id);
      const dijawab = js.filter((j) => !j.kosong);
      return {
        siswaId: sw.id,
        nama: sw.nama,
        skor: js.reduce((a, b) => a + b.skor, 0),
        benar: js.filter((j) => j.benar).length,
        kosong: js.filter((j) => j.kosong).length,
        sudahJawab: js.length,
        avgWaktu: dijawab.length > 0 ? Math.round(dijawab.reduce((a, b) => a + b.waktu, 0) / dijawab.length) : 0,
      };
    })
    .sort((a, b) => b.skor - a.skor || b.benar - a.benar || a.avgWaktu - b.avgWaktu);

  const soalStats = paketSoal.map((s) => {
    const js = allJawaban.filter((j) => j.soalId === s.id);
    const answered = js.length;
    const benar = js.filter((j) => j.benar).length;
    const avgWaktu = answered > 0 ? Math.round(js.reduce((a, b) => a + b.waktu, 0) / answered) : 0;
    return {
      soalId: s.id,
      nomor: s.nomor,
      pertanyaan: s.pertanyaan,
      tipe: s.tipe,
      skor: s.skor,
      timer: s.timer,
      answered,
      benar,
      kosong: js.filter((j) => j.kosong).length,
      avgWaktu,
    };
  });

  return NextResponse.json({
    session: {
      id: session.id,
      aktif: session.aktif,
      paket: session.paket,
      soalAktif: session.soalAktif,
      soalMulai: session.soalMulai.toISOString(),
      endedAt: session.endedAt?.toISOString() ?? null,
    },
    entries,
    maxSkor,
    soalStats,
    totalSoal: paketSoal.length,
    totalSiswa: siswaRows.length,
  });
}
