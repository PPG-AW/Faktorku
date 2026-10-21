import { db } from "@/db";
import { siswa } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  const { kelasId } = await params;
  const rows = await db.select().from(siswa).where(eq(siswa.kelasId, kelasId)).orderBy(siswa.nama);
  const now = Date.now();
  return NextResponse.json({
    serverNow: new Date().toISOString(),
    siswa: rows.map((s) => ({
      id: s.id,
      nama: s.nama,
      online: now - new Date(s.lastSeenAt).getTime() < 30_000,
      lastSeenAt: s.lastSeenAt.toISOString(),
    })),
  });
}
