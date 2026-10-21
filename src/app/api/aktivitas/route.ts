import { db } from "@/db";
import { cobaCoba, klasifikasi, siswa } from "@/db/schema";
import { gradePola, gradeSort, hitungCoba } from "@/lib/aktivitas-data";
import { parseNum, uid } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* POST — kirim percobaan nilai x / hasil klasifikasi */
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const jenis = String(b.jenis ?? "");
    const siswaId = String(b.siswaId ?? "");
    if (!siswaId) return NextResponse.json({ error: "siswaId wajib." }, { status: 400 });

    const sw = await db.select().from(siswa).where(eq(siswa.id, siswaId)).limit(1);
    if (sw.length === 0) return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
    const kelasId = sw[0].kelasId;

    if (jenis === "coba-coba") {
      const x = parseNum(String(b.x ?? ""));
      if (x === null) return NextResponse.json({ error: "Masukkan angka yang valid." }, { status: 400 });
      const hasil = Math.round(hitungCoba(x) * 1e9) / 1e9;
      const akar = Math.abs(hasil) < 1e-6;
      await db.insert(cobaCoba).values({ id: uid(), kelasId, siswaId, x, hasil, akar });
      return NextResponse.json({ ok: true, x, hasil, akar });
    }

    if (jenis === "klasifikasi") {
      const sort = (b.sort ?? {}) as Record<string, string>;
      const pola = (b.pola ?? {}) as Record<string, { sum: string; prod: string }>;
      const sortBenar = gradeSort(sort);
      const polaBenar = gradePola(pola);
      const hasil = { sort, pola };
      await db
        .insert(klasifikasi)
        .values({ id: uid(), kelasId, siswaId, sortBenar, polaBenar, hasil })
        .onConflictDoUpdate({ target: klasifikasi.siswaId, set: { sortBenar, polaBenar, hasil } });
      return NextResponse.json({ ok: true, sortBenar, polaBenar });
    }

    return NextResponse.json({ error: "Jenis aktivitas tidak dikenal." }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

/* GET — riwayat milik siswa (untuk resume saat reload) */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siswaId = searchParams.get("siswaId");
  const jenis = searchParams.get("jenis") ?? "coba-coba";
  if (!siswaId) return NextResponse.json({ error: "siswaId wajib." }, { status: 400 });

  if (jenis === "coba-coba") {
    const rows = await db
      .select()
      .from(cobaCoba)
      .where(eq(cobaCoba.siswaId, siswaId))
      .orderBy(desc(cobaCoba.createdAt))
      .limit(100);
    return NextResponse.json({
      attempts: rows.map((r) => ({
        x: r.x,
        hasil: r.hasil,
        akar: r.akar,
        waktu: r.createdAt.toISOString(),
      })),
    });
  }

  const rows = await db.select().from(klasifikasi).where(eq(klasifikasi.siswaId, siswaId)).limit(1);
  const r = rows[0];
  return NextResponse.json({
    klasifikasi: r
      ? { sortBenar: r.sortBenar, polaBenar: r.polaBenar, hasil: r.hasil }
      : null,
  });
}
