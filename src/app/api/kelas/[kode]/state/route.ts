import { db } from "@/db";
import { kelas, kuisSession, siswa, slide, soalKuis } from "@/db/schema";
import { ensureMigrations, ensureSeed } from "@/lib/seed";
import { and, desc, eq, gt, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kode: string }> }
) {
  try {
    const { kode } = await params;
    
    // Pastikan migrasi kolom berjalan terlebih dahulu
    try {
      await ensureMigrations();
      await ensureSeed();
    } catch (seedErr) {
      console.warn("Migration/seed warning in state:", seedErr);
    }

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
      const mulaiIso = s.soalMulai
        ? (s.soalMulai instanceof Date ? s.soalMulai.toISOString() : new Date(s.soalMulai).toISOString())
        : now.toISOString();

      kuis = {
        sessionId: s.id,
        aktif: s.aktif,
        soalAktif: s.soalAktif,
        soalMulai: mulaiIso,
        paket: s.paket,
        totalSoal: paketRows.length,
        timer: soal?.timer ?? 60,
        ended: !s.aktif && s.endedAt !== null,
      };
    }

    const timerStartIso = krow.timerStart
      ? (krow.timerStart instanceof Date ? krow.timerStart.toISOString() : new Date(krow.timerStart).toISOString())
      : null;

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
        timerStart: timerStartIso,
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
    console.error("GET /api/kelas/[kode]/state error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server saat memuat kelas." }, { status: 500 });
  }
}
