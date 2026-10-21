"use client";

import { useState } from "react";
import useSWR from "swr";
import { GuruShell } from "@/components/guru-shell";
import { fetcher, useGuruKode, useKelasState } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { BarChart3, CheckCircle2, CircleDashed, Download, Trophy } from "lucide-react";

interface HasilRow {
  siswaId: string;
  nama: string;
  apersepsi: { benar: number; total: number; nilai: number };
  worksheet: { skor: number; max: number; nilai: number; selesai: number };
  kuis: { skor: number; max: number; nilai: number; benar: number; kosong: number };
  refleksiDone: boolean;
  total: number;
}
interface HasilData {
  kelas: { nama: string; guru: string; kode: string };
  rows: HasilRow[];
  meta: { diagPG: number; maxWs: number; maxKuis: number; adaKuis: boolean; totalWs: number };
}

function NilaiCell({ nilai }: { nilai: number }) {
  return (
    <span className={cn(
      "mono inline-block min-w-12 rounded-lg px-2 py-1 text-center text-sm font-extrabold tabular",
      nilai >= 80 ? "bg-emerald-400/12 text-emerald-300" : nilai >= 60 ? "bg-amber-400/12 text-amber-300" : nilai > 0 ? "bg-rose-400/12 text-rose-300" : "text-zinc-600"
    )}>
      {nilai}
    </span>
  );
}

export default function GuruHasil() {
  const { kode } = useGuruKode();
  const { state } = useKelasState(kode, 6000);
  const { data } = useSWR<HasilData>(state ? `/api/hasil/${state.kelas.id}` : null, fetcher, {
    refreshInterval: 5000,
  });
  const [exporting, setExporting] = useState(false);

  const rows = data?.rows ?? [];
  const avg = rows.length > 0 ? Math.round(rows.reduce((a, b) => a + b.total, 0) / rows.length) : 0;

  async function exportPdf() {
    if (!data || exporting) return;
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const { autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("LAPORAN HASIL BELAJAR — FAKTORKU", 14, 16);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Kelas: ${data.kelas.nama} (${data.kelas.kode})  ·  Guru: ${data.kelas.guru}`, 14, 23);
      doc.text(`Materi: Memfaktorkan Persamaan Kuadrat (T-Faktor & Metode AC)  ·  Tanggal: ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`, 14, 29);

      autoTable(doc, {
        startY: 34,
        head: [["#", "Nama Siswa", "Apersepsi", "Worksheet", "Kuis", "Refleksi", "Nilai Akhir", "Predikat"]],
        body: rows.map((r, i) => [
          i + 1,
          r.nama,
          `${r.apersepsi.benar}/${r.apersepsi.total} benar (${r.apersepsi.nilai})`,
          `${r.worksheet.skor}/${r.worksheet.max} (${r.worksheet.nilai})`,
          `${r.kuis.skor}/${r.kuis.max} (${r.kuis.nilai})`,
          r.refleksiDone ? "Selesai" : "-",
          r.total,
          r.total >= 85 ? "A" : r.total >= 70 ? "B" : r.total >= 55 ? "C" : "D",
        ]),
        styles: { fontSize: 9, cellPadding: 2.4 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 246, 252] },
        columnStyles: { 7: { fontStyle: "bold", halign: "center" }, 6: { fontStyle: "bold", halign: "center" }, 0: { halign: "center" } },
      });

      const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 150;
      doc.setFontSize(9);
      doc.setTextColor(110);
      doc.text(`Rata-rata kelas: ${avg}  ·  Jumlah siswa: ${rows.length}  ·  Dibuat otomatis oleh FAKTORKU`, 14, finalY + 10);
      doc.save(`faktorku-hasil-${data.kelas.kode}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <GuruShell
      title="Rekap Nilai Lengkap"
      icon={<BarChart3 className="h-5 w-5 text-cyan-300" />}
      maxW="max-w-7xl"
      headerRight={
        <button onClick={exportPdf} disabled={exporting || rows.length === 0} className="btn btn-primary px-4 py-2 text-sm">
          {exporting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Download className="h-4 w-4" />}
          Ekspor PDF
        </button>
      }
    >
      {/* Ringkasan */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Siswa", value: String(rows.length) },
          { label: "Rata-rata kelas", value: String(avg) },
          { label: "Apersepsi PG", value: `${data?.meta.diagPG ?? 0} soal` },
          { label: "Maks kuis", value: `${data?.meta.maxKuis ?? 0} poin` },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl px-5 py-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">{s.label}</p>
            <p className="mono mt-1 text-2xl font-extrabold text-white tabular">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3 text-xs uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-3.5 text-left font-bold">#</th>
                <th className="px-5 py-3.5 text-left font-bold">Nama Siswa</th>
                <th className="px-4 py-3.5 text-center font-bold">Apersepsi</th>
                <th className="px-4 py-3.5 text-center font-bold">Worksheet</th>
                <th className="px-4 py-3.5 text-center font-bold">Kuis</th>
                <th className="px-4 py-3.5 text-center font-bold">Refleksi</th>
                <th className="px-5 py-3.5 text-right font-bold">Nilai Akhir</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.siswaId} className="border-b border-white/4 transition-colors hover:bg-white/3">
                  <td className="mono px-5 py-3 text-xs font-bold text-zinc-600 tabular">
                    <span className="flex items-center gap-1">
                      {i + 1}
                      {i === 0 && <Trophy className="h-3.5 w-3.5 text-amber-300" />}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-zinc-200">{r.nama}</td>
                  <td className="px-4 py-3 text-center">
                    <NilaiCell nilai={r.apersepsi.nilai} />
                    <span className="mono ml-1.5 text-[0.65rem] text-zinc-500">{r.apersepsi.benar}/{r.apersepsi.total}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <NilaiCell nilai={r.worksheet.nilai} />
                    <span className="mono ml-1.5 text-[0.65rem] text-zinc-500">{r.worksheet.skor}/{r.worksheet.max}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <NilaiCell nilai={r.kuis.nilai} />
                    <span className="mono ml-1.5 text-[0.65rem] text-zinc-500">{r.kuis.skor}/{r.kuis.max}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.refleksiDone ? (
                      <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-300" />
                    ) : (
                      <CircleDashed className="mx-auto h-4.5 w-4.5 text-zinc-700" />
                    )}
                  </td>
                  <td className="mono px-5 py-3 text-right text-base font-extrabold text-white tabular">{r.total}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-zinc-500">
                    Belum ada data nilai. Nilai muncul setelah siswa mengerjakan aktivitas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-600">
        Bobot nilai akhir: Apersepsi 25% · Worksheet 40% · Kuis 35%. Refleksi bersifat formatif.
      </p>
    </GuruShell>
  );
}
