import { db } from "@/db";
import { kelas } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import { generateKodeKelas, uid } from "@/lib/utils";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nama = String(body.nama ?? "").trim();
    const guru = String(body.guru ?? "").trim();
    if (!nama || !guru) {
      return NextResponse.json({ error: "Nama kelas dan nama guru wajib diisi." }, { status: 400 });
    }

    await ensureSeed();

    let created = null;
    for (let i = 0; i < 6; i++) {
      const kode = generateKodeKelas(5);
      const rows = await db
        .insert(kelas)
        .values({ id: uid(), kode, nama, guru, stage: "sapaan" })
        .onConflictDoNothing({ target: kelas.kode })
        .returning();
      if (rows.length > 0) {
        created = rows[0];
        break;
      }
    }
    if (!created) {
      return NextResponse.json({ error: "Gagal membuat kode kelas, coba lagi." }, { status: 500 });
    }
    return NextResponse.json({ kelas: created });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function GET() {
  const rows = await db.select().from(kelas).orderBy(desc(kelas.createdAt)).limit(20);
  return NextResponse.json({ kelas: rows });
}
