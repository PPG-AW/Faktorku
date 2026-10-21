import { db } from "@/db";
import { siswa, voting } from "@/db/schema";
import { uid } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Voting umum per topik — mis. topik "untung-rugi" pada kasus Rina */
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const siswaId = String(b.siswaId ?? "");
    const topik = String(b.topik ?? "").slice(0, 40);
    const pilihan = String(b.pilihan ?? "").slice(0, 60);
    if (!siswaId || !topik || !pilihan) {
      return NextResponse.json({ error: "Data voting tidak lengkap." }, { status: 400 });
    }

    const sw = await db.select().from(siswa).where(eq(siswa.id, siswaId)).limit(1);
    if (sw.length === 0) return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });

    await db
      .insert(voting)
      .values({ id: uid(), kelasId: sw[0].kelasId, siswaId, topik, pilihan })
      .onConflictDoUpdate({ target: [voting.siswaId, voting.topik], set: { pilihan } });

    return NextResponse.json({ ok: true, pilihan });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kelasId = searchParams.get("kelasId");
  const topik = searchParams.get("topik");
  const siswaId = searchParams.get("siswaId");
  if (!kelasId || !topik) return NextResponse.json({ error: "kelasId & topik wajib." }, { status: 400 });

  const siswaRows = await db.select().from(siswa).where(eq(siswa.kelasId, kelasId));
  const rows = await db
    .select()
    .from(voting)
    .where(and(eq(voting.kelasId, kelasId), eq(voting.topik, topik)));

  const hitung: Record<string, number> = {};
  for (const r of rows) hitung[r.pilihan] = (hitung[r.pilihan] ?? 0) + 1;

  return NextResponse.json({
    total: siswaRows.length,
    terisi: rows.length,
    hitung,
    sayaPilih: siswaId ? (rows.find((r) => r.siswaId === siswaId)?.pilihan ?? null) : null,
  });
}
