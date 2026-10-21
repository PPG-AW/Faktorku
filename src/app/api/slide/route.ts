import { db } from "@/db";
import { slide } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeed();
  const rows = await db.select().from(slide).orderBy(slide.nomor);
  return NextResponse.json({
    slide: rows.map((s) => ({ nomor: s.nomor, judul: s.judul, konten: s.konten })),
  });
}
