import { db } from "@/db";
import { annotationStiker } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const IKON_VALID = new Set(["star", "star3", "exclaim", "thought", "heart", "check", "question"]);
const WARNA_VALID = new Set(["red", "navy", "gold", "black"]);

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const kelasId = String(b.kelasId ?? "");
    const stage = String(b.stage ?? "");
    const x = Number(b.x);
    const y = Number(b.y);
    const ikon = String(b.ikon ?? "star");
    const warna = String(b.warna ?? "red");

    if (!kelasId || !stage || !IKON_VALID.has(ikon) || !WARNA_VALID.has(warna) || isNaN(x) || isNaN(y)) {
      return NextResponse.json({ error: "Data anotasi tidak valid." }, { status: 400 });
    }
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      return NextResponse.json({ error: "Koordinat di luar layar." }, { status: 400 });
    }

    const row = await db
      .insert(annotationStiker)
      .values({ id: crypto.randomUUID(), kelasId, stage, x, y, ikon, warna })
      .returning();
    return NextResponse.json({ ok: true, stiker: row[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kelasId = searchParams.get("kelasId");
  const stage = searchParams.get("stage");
  if (!kelasId || !stage) return NextResponse.json({ stiker: [] });

  const rows = await db
    .select()
    .from(annotationStiker)
    .where(and(eq(annotationStiker.kelasId, kelasId), eq(annotationStiker.stage, stage)))
    .orderBy(annotationStiker.createdAt);

  return NextResponse.json({
    stiker: rows.map((s) => ({ id: s.id, x: s.x, y: s.y, ikon: s.ikon, warna: s.warna })),
  });
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kelasId = searchParams.get("kelasId");
    const stage = searchParams.get("stage");
    if (!kelasId || !stage) return NextResponse.json({ error: "kelasId & stage wajib." }, { status: 400 });
    await db
      .delete(annotationStiker)
      .where(and(eq(annotationStiker.kelasId, kelasId), eq(annotationStiker.stage, stage)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
