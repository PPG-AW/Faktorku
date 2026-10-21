import { db } from "@/db";
import { siswa } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { siswaId, stage } = await req.json();
    if (!siswaId) return NextResponse.json({ ok: false }, { status: 400 });
    await db
      .update(siswa)
      .set({
        lastSeenAt: new Date(),
        ...(typeof stage === "string" && stage ? { currentStage: stage } : {}),
      })
      .where(eq(siswa.id, String(siswaId)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
