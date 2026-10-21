import { db } from "@/db";
import {
  jawaban,
  jawabanWorksheet,
  kelas,
  kuisJawaban,
  kuisSession,
  refleksi,
  siswa,
  soalDiagnostik,
  soalKuis,
  soalWorksheet,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  const { kelasId } = await params;

  const k = await db.select().from(kelas).where(eq(kelas.id, kelasId)).limit(1);
  if (k.length === 0) return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });

  const siswaRows = await db.select().from(siswa).where(eq(siswa.kelasId, kelasId)).orderBy(siswa.nama);
  const ids = new Set(siswaRows.map((s) => s.id));

  const [diag, diagJ, ws, wsJ, kuisSoal, sessionRows, kuisJ, refl] = await Promise.all([
    db.select().from(soalDiagnostik),
    db.select().from(jawaban),
    db.select().from(soalWorksheet),
    db.select().from(jawabanWorksheet),
    db.select().from(soalKuis),
    db.select().from(kuisSession).where(eq(kuisSession.kelasId, kelasId)).orderBy(desc(kuisSession.startedAt)).limit(1),
    db.select().from(kuisJawaban),
    db.select().from(refleksi),
  ]);

  const diagPG = diag.filter((d) => d.tipe !== "terbuka").length;
  const session = sessionRows[0] ?? null;
  const maxKuis = kuisSoal.reduce((a, b) => a + b.skor, 0);
  const maxWs = ws.length * 100;

  const rows = siswaRows.map((sw) => {
    const dJ = diagJ.filter((j) => j.siswaId === sw.id);
    const dBenar = dJ.filter((j) => j.benar).length;
    const apersepsiNilai = diagPG > 0 ? Math.round((dBenar / diagPG) * 100) : 0;

    const wJ = wsJ.filter((j) => j.siswaId === sw.id);
    const wsSkor = wJ.reduce((a, b) => a + b.skor, 0);
    const wsNilai = maxWs > 0 ? Math.round((wsSkor / maxWs) * 100) : 0;

    const kJ = session ? kuisJ.filter((j) => j.sessionId === session.id && j.siswaId === sw.id) : [];
    const kuisSkor = kJ.reduce((a, b) => a + b.skor, 0);
    const kuisNilai = maxKuis > 0 ? Math.round((kuisSkor / maxKuis) * 100) : 0;

    const reflDone = refl.some((r) => r.siswaId === sw.id);

    const total = Math.round(apersepsiNilai * 0.25 + wsNilai * 0.4 + kuisNilai * 0.35);

    return {
      siswaId: sw.id,
      nama: sw.nama,
      apersepsi: { benar: dBenar, total: diagPG, nilai: apersepsiNilai },
      worksheet: { skor: wsSkor, max: maxWs, nilai: wsNilai, selesai: wJ.length },
      kuis: { skor: kuisSkor, max: maxKuis, nilai: kuisNilai, benar: kJ.filter((j) => j.benar).length, kosong: kJ.filter((j) => j.kosong).length },
      refleksiDone: reflDone,
      total,
    };
  });

  rows.sort((a, b) => b.total - a.total);

  return NextResponse.json({
    kelas: k[0],
    rows,
    meta: { diagPG, maxWs, maxKuis, adaKuis: session !== null, totalWs: ws.length },
  });
}
