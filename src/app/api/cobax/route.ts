import { db } from "@/db";
import { cobaxJawaban, kelas, sesiAktif, siswa } from "@/db/schema";
import { COBAX, hitungCobax } from "@/lib/aktivitas-data";
import { uid } from "@/lib/utils";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getSesiAktif(kelasId: string) {
  const rows = await db
    .select()
    .from(sesiAktif)
    .where(and(eq(sesiAktif.kelasId, kelasId), eq(sesiAktif.status, "live")))
    .orderBy(desc(sesiAktif.startedAt))
    .limit(1);
  return rows[0] ?? null;
}

/* POST — siswa kirim pilihan 1/3/5/10/15/20 */
export async function POST(req: Request) {
  try {
    const { siswaId, pilihan } = await req.json();
    const p = Number(pilihan);
    if (!siswaId || !COBAX.opsi.includes(p as (typeof COBAX.opsi)[number])) {
      return NextResponse.json({ error: "Pilihan tidak valid." }, { status: 400 });
    }

    const sw = await db.select().from(siswa).where(eq(siswa.id, String(siswaId))).limit(1);
    if (sw.length === 0) return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
    const kelasId = sw[0].kelasId;

    const sesi = await getSesiAktif(kelasId);
    if (!sesi) return NextResponse.json({ error: "Sesi CobaX belum dibuka guru." }, { status: 400 });

    const { hasil, benar } = hitungCobax(p);
    const hasilInt = Math.round(hasil);
    await db
      .insert(cobaxJawaban)
      .values({ id: uid(), kelasId, sesiId: sesi.id, siswaId: String(siswaId), pilihan: p, hasil: hasilInt, benar })
      .onConflictDoUpdate({
        target: [cobaxJawaban.sesiId, cobaxJawaban.siswaId],
        set: { pilihan: p, hasil: hasilInt, benar },
      });

    return NextResponse.json({ ok: true, pilihan: p, hasil, benar });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

/* GET — rekap tebakan (diagram), rahasia kunci hanya jika reveal=true */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kelasId = searchParams.get("kelasId");
  const reveal = searchParams.get("reveal") === "true";
  if (!kelasId) return NextResponse.json({ error: "kelasId wajib." }, { status: 400 });

  const k = await db.select({ id: kelas.id }).from(kelas).where(eq(kelas.id, kelasId)).limit(1);
  if (k.length === 0) return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });

  const siswaRows = await db.select().from(siswa).where(eq(siswa.kelasId, kelasId));
  const total = siswaRows.length;
  const sesi = await getSesiAktif(kelasId);
  if (!sesi) {
    return NextResponse.json({
      sesi: null, terisi: 0, total,
      opsi: COBAX.opsi.map((o) => ({ pilihan: o, count: 0, hasil: null, benar: null })),
      reveal: false,
    });
  }

  const jawabanRows = await db.select().from(cobaxJawaban).where(eq(cobaxJawaban.sesiId, sesi.id));
  const byOpsi = new Map<number, number>();
  for (const r of jawabanRows) byOpsi.set(r.pilihan, (byOpsi.get(r.pilihan) ?? 0) + 1);

  return NextResponse.json({
    sesi: { id: sesi.id, startedAt: sesi.startedAt.toISOString() },
    terisi: jawabanRows.length,
    total,
    reveal,
    opsi: COBAX.opsi.map((o) => ({
      pilihan: o,
      count: byOpsi.get(o) ?? 0,
      hasil: reveal ? Math.round(hitungCobax(o).hasil) : null,
      benar: reveal ? hitungCobax(o).benar : null,
    })),
    namaJawaban: jawabanRows.map((r) => ({
      nama: siswaRows.find((s) => s.id === r.siswaId)?.nama ?? "Siswa",
      pilihan: r.pilihan,
    })),
  });
}
