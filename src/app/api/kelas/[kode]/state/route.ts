import { db } from "@/db";
import { kelas, kuisSession, siswa, slide, soalKuis } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { and, desc, eq, gt, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kode: string }> }
) {
  try {
    const { kode } = await params;
    await ensureSeed();

    const k = await db.select().from(kelas).where(eq(kelas.kode, kode.toUpperCase())).limit(1);
    if (k.length === 0) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }
    const krow = k[0];

    const now = new Date();
    const onlineSince = new Date(now.getTime() - 30_000);

    const [slideRows, onlineRows, totalRows, sessionRows, soalRows] = await Promise.all([
      db.select({ id: slide.id }).from(slide),
      db
        .select({ c: count() })
        .from(siswa)
        .where(and(eq(siswa.kelasId, krow.id), gt(siswa.lastSeenAt, onlineSince))),
      db.select({ c: count() }).from(siswa).where(eq(siswa.kelasId, krow.id)),
      db
        .select()
        .from(kuisSession)
        .where(eq(kuisSession.kelasId, krow.id))
        .orderBy(desc(kuisSession.startedAt))
        .limit(1),
      db.select().from(soalKuis).orderBy(soalKuis.nomor),
    ]);

    let kuis = null;
    const s = sessionRows[0];
    if (s) {
      const paketRows = soalRows.filter((r) => r.paket === s.paket);
      const soal = paketRows.find((r) => r.nomor === s.soalAktif);
      kuis = {
        sessionId: s.id,
        aktif: s.aktif,
        soalAktif: s.soalAktif,
        soalMulai: s.soalMulai.toISOString(),
        paket: s.paket,
        totalSoal: paketRows.length,
        timer: soal?.timer ?? 60,
        ended: !s.aktif && s.endedAt !== null,
      };
    }

    return NextResponse.json({
      kelas: {
        id: krow.id,
        kode: krow.kode,
        nama: krow.nama,
        guru: krow.guru,
        stage: krow.stage,
        slideAktif: krow.slideAktif,
        slideLocked: krow.slideLocked,
        slideTotal: slideRows.length,
        apersepsiSoalAktif: krow.apersepsiSoalAktif ?? 1,
        timerStart: krow.timerStart ? krow.timerStart.toISOString() : null,
        timerDurasi: krow.timerDurasi ?? 0,
        timerRunning: krow.timerRunning ?? false,
        timerRemaining: krow.timerRemaining ?? 0,
      },
      siswaOnline: onlineRows[0]?.c ?? 0,
      totalSiswa: totalRows[0]?.c ?? 0,
      serverNow: now.toISOString(),
      kuis,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
