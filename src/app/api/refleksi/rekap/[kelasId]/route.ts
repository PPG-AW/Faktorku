import { db } from "@/db";
import { refleksi, siswa } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  const { kelasId } = await params;

  const siswaRows = await db.select().from(siswa).where(eq(siswa.kelasId, kelasId));
  const ids = new Set(siswaRows.map((s) => s.id));
  const rows = (await db.select().from(refleksi)).filter((r) => ids.has(r.siswaId));

  const n = rows.length;
  const round1 = (v: number) => Math.round(v * 10) / 10;
  const avg = n > 0 ? (fn: (r: (typeof rows)[number]) => number) => round1(rows.reduce((a, r) => a + fn(r), 0) / n) : () => 0;

  return NextResponse.json({
    totalSiswa: siswaRows.length,
    terisi: n,
    tujuan: {
      tujuan1: n > 0 ? rows.filter((r) => r.tujuan1).length : 0,
      tujuan2: n > 0 ? rows.filter((r) => r.tujuan2).length : 0,
      tujuan3: n > 0 ? rows.filter((r) => r.tujuan3).length : 0,
    },
    rating: { tf: avg((r) => r.ratingTF), ac: avg((r) => r.ratingAC), keseruan: avg((r) => r.rating) },
    // Tiga word cloud terpisah sesuai spesifikasi
    satuKataTexts: rows.map((r) => r.satuKata).filter((t) => t.trim().length > 0),
    mudahTexts: rows.map((r) => r.tugasRumah).filter((t) => t.trim().length > 0),
    kesulitanTexts: rows.map((r) => r.kesulitan).filter((t) => t.trim().length > 0),
    exitTicketCounts: {
      A: rows.filter((r) => r.exitTicket === "A" || r.exitTicket.startsWith("A")).length,
      B: rows.filter((r) => r.exitTicket === "B" || r.exitTicket.startsWith("B")).length,
      C: rows.filter((r) => r.exitTicket === "C" || r.exitTicket.startsWith("C")).length,
      D: rows.filter((r) => r.exitTicket === "D" || r.exitTicket.startsWith("D")).length,
      E: rows.filter((r) => r.exitTicket === "E" || r.exitTicket.startsWith("E")).length,
    },
    exitTickets: rows
      .filter((r) => r.exitTicket.trim().length > 0)
      .map((r) => ({ nama: siswaRows.find((s) => s.id === r.siswaId)?.nama ?? "Anonim", teks: r.exitTicket })),
  });
}
