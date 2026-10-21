import { db } from "@/db";
import { refleksi } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const siswaId = String(b.siswaId ?? "");
    if (!siswaId) return NextResponse.json({ error: "siswaId wajib." }, { status: 400 });

    const values = {
      tujuan1: Boolean(b.tujuan1),
      tujuan2: Boolean(b.tujuan2),
      tujuan3: Boolean(b.tujuan3),
      ratingTF: Math.max(0, Math.min(5, Number(b.ratingTF) || 0)),
      ratingAC: Math.max(0, Math.min(5, Number(b.ratingAC) || 0)),
      // Siswa mengirim "sulit"/"mudah", database menyimpan kolom kesulitan/tugasRumah
      kesulitan: String(b.sulit ?? b.kesulitan ?? "").slice(0, 500),
      tugasRumah: String(b.mudah ?? b.tugasRumah ?? "").slice(0, 500),
      rating: Math.max(0, Math.min(5, Number(b.rating) || 0)),
      satuKata: String(b.satuKata ?? "").slice(0, 40),
      exitTicket: String(b.exitTicket ?? "").slice(0, 120),
    };

    await db
      .insert(refleksi)
      .values({ id: crypto.randomUUID(), siswaId, ...values })
      .onConflictDoUpdate({ target: refleksi.siswaId, set: values });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siswaId = searchParams.get("siswaId");
  if (!siswaId) return NextResponse.json({ refleksi: null });
  const rows = await db.select().from(refleksi).where(eq(refleksi.siswaId, siswaId)).limit(1);
  return NextResponse.json({ refleksi: rows[0] ?? null });
}
