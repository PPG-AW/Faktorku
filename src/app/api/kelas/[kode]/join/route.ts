import { db } from "@/db";
import { kelas, siswa } from "@/db/schema";
import { uid } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ kode: string }> }
) {
  try {
    const { kode } = await params;
    const body = await req.json();
    const nama = String(body.nama ?? "").trim();
    if (nama.length < 2) {
      return NextResponse.json({ error: "Nama minimal 2 huruf." }, { status: 400 });
    }

    const k = await db.select().from(kelas).where(eq(kelas.kode, kode.toUpperCase())).limit(1);
    if (k.length === 0) {
      return NextResponse.json({ error: `Kelas dengan kode "${kode.toUpperCase()}" tidak ditemukan.` }, { status: 404 });
    }
    const krow = k[0];

    const existing = await db
      .select()
      .from(siswa)
      .where(and(eq(siswa.kelasId, krow.id), eq(siswa.nama, nama)))
      .limit(1);

    let srow;
    if (existing.length > 0) {
      srow = existing[0];
      await db.update(siswa).set({ lastSeenAt: new Date() }).where(eq(siswa.id, srow.id));
    } else {
      const inserted = await db
        .insert(siswa)
        .values({ id: uid(), nama, kelasId: krow.id })
        .returning();
      srow = inserted[0];
    }

    return NextResponse.json({ kelas: krow, siswa: srow });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
