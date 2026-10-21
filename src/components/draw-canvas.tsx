"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eraser, Highlighter, Pen, Redo2, Trash2, Undo2, X } from "lucide-react";

type Tool = "pen" | "marker" | "eraser";

interface Stroke {
  tool: Tool;
  color: string;
  width: number;
  pts: { x: number; y: number }[]; // koordinat relatif 0..1
}

const WARNA = [
  { key: "red", v: "#C11920" },
  { key: "navy", v: "#1D3557" },
  { key: "green", v: "#15803D" },
  { key: "amber", v: "#D97706" },
  { key: "black", v: "#141414" },
];

const TEBAL = [
  { key: "s", v: 3 },
  { key: "m", v: 6 },
  { key: "l", v: 11 },
];

/**
 * Lapisan gambar bebas untuk guru (proyektor).
 * Coretan disimpan di memori per slide — tidak dikirim ke HP siswa.
 */
export function DrawCanvas({
  slideKey,
  active,
  onClose,
}: {
  slideKey: string;
  active: boolean;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const currentRef = useRef<Stroke | null>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(WARNA[0].v);
  const [width, setWidth] = useState(TEBAL[1].v);
  const [store, setStore] = useState<Record<string, Stroke[]>>({});
  const [redo, setRedo] = useState<Record<string, Stroke[]>>({});

  const strokes = store[slideKey] ?? [];

  /* ---------- render ---------- */
  const paint = useCallback(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (cv.width !== w * dpr || cv.height !== h * dpr) {
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const all = currentRef.current ? [...strokes, currentRef.current] : strokes;
    for (const s of all) {
      if (s.pts.length < 2) continue;
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      if (s.tool === "marker") {
        ctx.globalAlpha = 0.32;
        ctx.lineWidth = s.width * 3.2;
      }
      if (s.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = s.width * 4;
      }
      ctx.beginPath();
      ctx.moveTo(s.pts[0].x * w, s.pts[0].y * h);
      for (let i = 1; i < s.pts.length - 1; i++) {
        const mx = ((s.pts[i].x + s.pts[i + 1].x) / 2) * w;
        const my = ((s.pts[i].y + s.pts[i + 1].y) / 2) * h;
        ctx.quadraticCurveTo(s.pts[i].x * w, s.pts[i].y * h, mx, my);
      }
      const last = s.pts[s.pts.length - 1];
      ctx.lineTo(last.x * w, last.y * h);
      ctx.stroke();
      ctx.restore();
    }
  }, [strokes]);

  useEffect(() => { paint(); }, [paint, slideKey]);

  useEffect(() => {
    const ro = new ResizeObserver(() => paint());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [paint]);

  /* ---------- pointer ---------- */
  function rel(e: React.PointerEvent) {
    const r = wrapRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  }

  function down(e: React.PointerEvent) {
    if (!active) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    currentRef.current = { tool, color, width, pts: [rel(e)] };
    paint();
  }

  function move(e: React.PointerEvent) {
    if (!active || !drawingRef.current || !currentRef.current) return;
    currentRef.current.pts.push(rel(e));
    paint();
  }

  function up() {
    if (!drawingRef.current || !currentRef.current) return;
    drawingRef.current = false;
    const s = currentRef.current;
    currentRef.current = null;
    if (s.pts.length > 1) {
      setStore((prev) => ({ ...prev, [slideKey]: [...(prev[slideKey] ?? []), s] }));
      setRedo((prev) => ({ ...prev, [slideKey]: [] }));
    } else {
      paint();
    }
  }

  function undo() {
    setStore((prev) => {
      const cur = prev[slideKey] ?? [];
      if (cur.length === 0) return prev;
      const last = cur[cur.length - 1];
      setRedo((r) => ({ ...r, [slideKey]: [...(r[slideKey] ?? []), last] }));
      return { ...prev, [slideKey]: cur.slice(0, -1) };
    });
  }

  function redoFn() {
    setRedo((prev) => {
      const cur = prev[slideKey] ?? [];
      if (cur.length === 0) return prev;
      const last = cur[cur.length - 1];
      setStore((s) => ({ ...s, [slideKey]: [...(s[slideKey] ?? []), last] }));
      return { ...prev, [slideKey]: cur.slice(0, -1) };
    });
  }

  function clearAll() {
    setStore((prev) => ({ ...prev, [slideKey]: [] }));
    setRedo((prev) => ({ ...prev, [slideKey]: [] }));
  }

  return (
    <>
      <div
        ref={wrapRef}
        className={cn("absolute inset-0 z-30 min-h-full min-w-full", active ? "pointer-events-auto" : "pointer-events-none")}
        style={{ cursor: active ? (tool === "eraser" ? "cell" : "crosshair") : "default" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>

      {active && (
        <div className="fixed bottom-14 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center gap-1.5 border-2 border-[var(--ink)] bg-[var(--card)] px-2 py-1.5 shadow-[4px_4px_0_var(--ink)]">
          {/* alat */}
          {([
            { k: "pen" as Tool, Icon: Pen, label: "Pena" },
            { k: "marker" as Tool, Icon: Highlighter, label: "Stabilo" },
            { k: "eraser" as Tool, Icon: Eraser, label: "Hapus" },
          ]).map(({ k, Icon, label }) => (
            <button
              key={k}
              onClick={() => setTool(k)}
              title={label}
              className={cn("border-2 border-[var(--ink)] p-2 transition-colors", tool === k ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--card)] hover:bg-[var(--paper-2)]")}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}

          <span className="mx-1 h-7 w-px bg-[var(--hairline-strong)]" />

          {/* warna */}
          {WARNA.map((w) => (
            <button
              key={w.key}
              onClick={() => { setColor(w.v); if (tool === "eraser") setTool("pen"); }}
              className={cn("h-7 w-7 border-2 border-[var(--ink)] transition-transform", color === w.v && tool !== "eraser" && "scale-110 ring-2 ring-[var(--ink)] ring-offset-1")}
              style={{ backgroundColor: w.v }}
              title={w.key}
            />
          ))}

          <span className="mx-1 h-7 w-px bg-[var(--hairline-strong)]" />

          {/* ketebalan */}
          {TEBAL.map((t) => (
            <button
              key={t.key}
              onClick={() => setWidth(t.v)}
              className={cn("grid h-7 w-7 place-items-center border-2 border-[var(--ink)]", width === t.v ? "bg-[var(--ink)]" : "bg-[var(--card)]")}
              title={`Tebal ${t.key}`}
            >
              <span className="rounded-full" style={{ width: t.v + 2, height: t.v + 2, background: width === t.v ? "var(--paper)" : "var(--ink)" }} />
            </button>
          ))}

          <span className="mx-1 h-7 w-px bg-[var(--hairline-strong)]" />

          <button onClick={undo} disabled={strokes.length === 0} className="border-2 border-[var(--ink)] bg-[var(--card)] p-2 disabled:opacity-35 hover:bg-[var(--paper-2)]" title="Undo">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={redoFn} disabled={(redo[slideKey] ?? []).length === 0} className="border-2 border-[var(--ink)] bg-[var(--card)] p-2 disabled:opacity-35 hover:bg-[var(--paper-2)]" title="Redo">
            <Redo2 className="h-4 w-4" />
          </button>
          <button onClick={clearAll} disabled={strokes.length === 0} className="border-2 border-[var(--ink)] bg-[var(--card)] p-2 disabled:opacity-35 hover:bg-[var(--paper-2)]" title="Bersihkan">
            <Trash2 className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="border-2 border-[var(--red)] bg-[var(--red)] p-2 text-white" title="Tutup mode coret">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
