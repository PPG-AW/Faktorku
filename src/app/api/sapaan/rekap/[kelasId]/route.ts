import { db } from "@/db";
import { sapaan, siswa } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  const { kelasId } = await params;

  const siswaRows = await db.select().from(siswa).where(eq(siswa.kelasId, kelasId)).orderBy(siswa.nama);
  const rows = await db
    .select()
    .from(sapaan)
    .where(eq(sapaan.kelasId, kelasId))
    .orderBy(desc(sapaan.createdAt));

  const moodCount: Record<string, number> = {};
  for (const r of rows) moodCount[r.mood] = (moodCount[r.mood] ?? 0) + 1;

  const namaMap = new Map(siswaRows.map((s) => [s.id, s.nama]));

  return NextResponse.json({
    totalSiswa: siswaRows.length,
    terisi: rows.length,
    moodCount,
    messages: rows.map((r) => ({
      nama: namaMap.get(r.siswaId) ?? "Siswa",
      mood: r.mood,
      pesan: r.pesan,
      waktu: r.createdAt.toISOString(),
    })),
    serverNow: new Date().toISOString(),
  });
}
