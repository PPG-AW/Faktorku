import { db } from "@/db";
import {
  cobaCoba, jawaban, jawabanWorksheet, kuisJawaban, kuisSession,
  klasifikasi, refleksi, sapaan, siswa,
} from "@/db/schema";
import { COBA, POLA_TOTAL, SORT_TOTAL } from "@/lib/aktivitas-data";
import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Agregasi lengkap: siapa di halaman apa + progres per langkah RPP */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  const { kelasId } = await params;
  const now = Date.now();

  const siswaRows = await db.select().from(siswa).where(eq(siswa.kelasId, kelasId)).orderBy(siswa.nama);
  const ids = siswaRows.map((s) => s.id);
  const empty = ids.length === 0;

  const [rowsSapaan, rowsDiag, rowsWs, rowsRefl, rowsKlas, rowsCoba, sessionRows] = empty
    ? [[], [], [], [], [], [], []]
    : await Promise.all([
        db.select().from(sapaan).where(eq(sapaan.kelasId, kelasId)),
        db.select().from(jawaban).where(inArray(jawaban.siswaId, ids)),
        db.select().from(jawabanWorksheet).where(inArray(jawabanWorksheet.siswaId, ids)),
        db.select().from(refleksi).where(inArray(refleksi.siswaId, ids)),
        db.select().from(klasifikasi).where(eq(klasifikasi.kelasId, kelasId)),
        db.select().from(cobaCoba).where(eq(cobaCoba.kelasId, kelasId)),
        db.select().from(kuisSession).where(eq(kuisSession.kelasId, kelasId)).orderBy(desc(kuisSession.startedAt)).limit(1),
      ]);

  const session = sessionRows[0] ?? null;
  const rowsKuis = session
    ? await db.select().from(kuisJawaban).where(eq(kuisJawaban.sessionId, session.id))
    : [];

  const sapaanSet = new Set(rowsSapaan.map((r) => r.siswaId));
  const reflSet = new Set(rowsRefl.map((r) => r.siswaId));

  const out = siswaRows.map((s) => {
    const online = now - new Date(s.lastSeenAt).getTime() < 30_000;

    const ap = rowsDiag.filter((r) => r.siswaId === s.id);
    const cob = rowsCoba.filter((r) => r.siswaId === s.id);
    const roots = [...new Set(cob.filter((c) => c.akar).map((c) => Math.round(c.x * 1e6) / 1e6))];
    const klas = rowsKlas.find((r) => r.siswaId === s.id) ?? null;
    const ws = rowsWs.filter((r) => r.siswaId === s.id);
    const kj = rowsKuis.filter((r) => r.siswaId === s.id);

    return {
      id: s.id,
      nama: s.nama,
      online,
      currentStage: s.currentStage,
      progress: {
        sapaan: sapaanSet.has(s.id),
        apersepsi: ap.length,
        cobacoba: { attempts: cob.length, roots },
        klasifikasi: klas ? { sortBenar: klas.sortBenar, polaBenar: klas.polaBenar } : null,
        worksheet: ws.length,
        kuis: { answered: kj.length, skor: kj.reduce((a, b) => a + b.skor, 0), benar: kj.filter((j) => j.benar).length },
        refleksi: reflSet.has(s.id),
      },
    };
  });

  // Agregat posisi halaman
  const viewing: Record<string, number> = {};
  for (const s of out) {
    if (!s.online) continue;
    viewing[s.currentStage] = (viewing[s.currentStage] ?? 0) + 1;
  }

  // Agregat coba-coba untuk live show Fase 2
  const founders: Record<string, string[]> = {};
  for (const akarNilai of COBA.akar) {
    founders[String(akarNilai)] = out
      .filter((s) => s.progress.cobacoba.roots.some((r) => Math.abs(r - akarNilai) < 1e-6))
      .map((s) => s.nama);
  }

  return NextResponse.json({
    serverNow: new Date().toISOString(),
    siswa: out,
    totals: {
      apersepsi: 8,
      worksheet: 3,
      klasifikasiSort: SORT_TOTAL,
      klasifikasiPola: POLA_TOTAL,
    },
    agg: {
      online: out.filter((s) => s.online).length,
      total: out.length,
      viewing,
      sapaan: sapaanSet.size,
      refleksi: reflSet.size,
      cobaCoba: {
        totalAttempts: rowsCoba.length,
        founders,
        recentAttempts: rowsCoba
          .slice(-12)
          .reverse()
          .map((c) => ({
            nama: siswaRows.find((s) => s.id === c.siswaId)?.nama ?? "Siswa",
            x: c.x,
            hasil: c.hasil,
            akar: c.akar,
          })),
      },
      klasifikasi: {
        submitted: rowsKlas.length,
        sortBenarTotal: rowsKlas.reduce((a, b) => a + b.sortBenar, 0),
        polaBenarTotal: rowsKlas.reduce((a, b) => a + b.polaBenar, 0),
      },
    },
  });
}
