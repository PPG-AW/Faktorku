import { db } from "@/db";
import { sapaan, siswa } from "@/db/schema";
import { MOOD_KEYS } from "@/lib/moods";
import { uid } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const siswaId = String(b.siswaId ?? "");
    const mood = String(b.mood ?? "");
    const pesan = String(b.pesan ?? "").trim().slice(0, 200);

    if (!siswaId || !MOOD_KEYS.includes(mood)) {
      return NextResponse.json({ error: "Pilih kabar kamu dulu ya." }, { status: 400 });
    }

    const sw = await db.select().from(siswa).where(eq(siswa.id, siswaId)).limit(1);
    if (sw.length === 0) {
      return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
    }

    await db
      .insert(sapaan)
      .values({ id: uid(), kelasId: sw[0].kelasId, siswaId, mood, pesan })
      .onConflictDoUpdate({ target: sapaan.siswaId, set: { mood, pesan } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siswaId = searchParams.get("siswaId");
  if (!siswaId) return NextResponse.json({ sapaan: null });
  const rows = await db.select().from(sapaan).where(eq(sapaan.siswaId, siswaId)).limit(1);
  return NextResponse.json({ sapaan: rows[0] ?? null });
}
