import { db } from "@/db";
import { kelas, kuisJawaban, kuisSession, sesiAktif, siswa, slide, soalKuis } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STAGES = [
  "lobby", "sapaan", "apersepsi", "tujuan", "slide", "coba-coba", "cobax",
  "aktivitas-think", "aktivitas-pair", "aktivitas-share",
  "klasifikasi", "worksheet", "presentasi", "kuis", "refleksi", "penutup", "doa",
];

async function tandaiKosong(sessionId: string, kelasId: string, soalId: string, timer: number) {
  const allSiswa = await db.select({ id: siswa.id }).from(siswa).where(eq(siswa.kelasId, kelasId));
  const sudah = await db
    .select({ siswaId: kuisJawaban.siswaId })
    .from(kuisJawaban)
    .where(and(eq(kuisJawaban.sessionId, sessionId), eq(kuisJawaban.soalId, soalId)));
  const sudahSet = new Set(sudah.map((r) => r.siswaId));
  const belum = allSiswa.filter((s) => !sudahSet.has(s.id));
  if (belum.length === 0) return;
  await db
    .insert(kuisJawaban)
    .values(belum.map((s) => ({
      id: crypto.randomUUID(), sessionId, siswaId: s.id, soalId,
      jawaban: "", benar: false, skor: 0, waktu: timer, kosong: true,
    })))
    .onConflictDoNothing();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { kelasId, action, value } = body as {
      kelasId: string;
      action: string;
      value?: unknown;
    };
    if (!kelasId || !action) return NextResponse.json({ error: "kelasId dan action wajib." }, { status: 400 });

    const k = await db.select().from(kelas).where(eq(kelas.id, kelasId)).limit(1);
    if (k.length === 0) return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    const krow = k[0];

    switch (action) {
      case "setStage": {
        const stage = String(value);
        if (!STAGES.includes(stage)) return NextResponse.json({ error: "Stage tidak valid." }, { status: 400 });
        await db.update(kelas).set({ stage }).where(eq(kelas.id, kelasId));
        break;
      }
      case "slideNext":
      case "slidePrev":
      case "slideSet": {
        const total = (await db.select({ id: slide.id }).from(slide)).length || 1;
        let target = krow.slideAktif;
        if (action === "slideNext") target = krow.slideAktif + 1;
        else if (action === "slidePrev") target = krow.slideAktif - 1;
        else target = Number(value) || 1;
        target = Math.max(1, Math.min(total, target));
        await db.update(kelas).set({ slideAktif: target }).where(eq(kelas.id, kelasId));
        break;
      }
      case "slideLock": {
        await db.update(kelas).set({ slideLocked: Boolean(value) }).where(eq(kelas.id, kelasId));
        break;
      }
      case "tutupLogin": {
        await db.update(kelas).set({ loginDitutup: Boolean(value) }).where(eq(kelas.id, kelasId));
        break;
      }
      case "sesiStart": {
        await db.update(sesiAktif).set({ status: "ended", endedAt: new Date() }).where(eq(sesiAktif.kelasId, kelasId));
        const s = await db.insert(sesiAktif).values({ id: crypto.randomUUID(), kelasId, status: "live" }).returning();
        return NextResponse.json({ ok: true, sesi: s[0] });
      }
      case "sesiEnd": {
        await db
          .update(sesiAktif)
          .set({ status: "ended", endedAt: new Date() })
          .where(and(eq(sesiAktif.kelasId, kelasId), eq(sesiAktif.status, "live")));
        await db.update(kelas).set({ stage: "lobby", loginDitutup: false }).where(eq(kelas.id, kelasId));
        return NextResponse.json({ ok: true, logout: true });
      }
      case "kuisStart": {
        await db
          .update(kuisSession)
          .set({ aktif: false, endedAt: new Date() })
          .where(and(eq(kuisSession.kelasId, kelasId), eq(kuisSession.aktif, true)));
        const s = await db
          .insert(kuisSession)
          .values({ id: crypto.randomUUID(), kelasId, aktif: true, soalAktif: 1, soalMulai: new Date() })
          .returning();
        await db.update(kelas).set({ stage: "kuis" }).where(eq(kelas.id, kelasId));
        return NextResponse.json({ ok: true, session: s[0] });
      }
      case "kuisNext": {
        const s = (
          await db.select().from(kuisSession)
            .where(and(eq(kuisSession.kelasId, kelasId), eq(kuisSession.aktif, true))).limit(1)
        )[0];
        if (!s) return NextResponse.json({ error: "Tidak ada sesi kuis aktif." }, { status: 400 });

        const soalRows = await db.select().from(soalKuis).orderBy(soalKuis.nomor);
        const current = soalRows.find((r) => r.nomor === s.soalAktif);
        if (current) await tandaiKosong(s.id, kelasId, current.id, current.timer);

        if (s.soalAktif >= soalRows.length) {
          await db.update(kuisSession).set({ aktif: false, endedAt: new Date() }).where(eq(kuisSession.id, s.id));
          return NextResponse.json({ ok: true, finished: true });
        }
        await db.update(kuisSession).set({ soalAktif: s.soalAktif + 1, soalMulai: new Date() }).where(eq(kuisSession.id, s.id));
        break;
      }
      case "kuisStop": {
        await db
          .update(kuisSession)
          .set({ aktif: false, endedAt: new Date() })
          .where(and(eq(kuisSession.kelasId, kelasId), eq(kuisSession.aktif, true)));
        break;
      }
      default:
        return NextResponse.json({ error: "Action tidak dikenal." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
