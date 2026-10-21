"use client";

import { Fragment, useMemo, type ReactNode } from "react";

/**
 * Renderer matematika.
 * Aturan utama: SATU ekspresi = SATU kesatuan yang tidak pernah dipenggal.
 * Jika tidak muat, seluruh ekspresi pindah baris bersama-sama.
 *  - x^2 → superskrip asli
 *  - " x " di antara operand → tanda kali ×
 *  - =/= → ≠ , -> → →
 */
function render(src: string): ReactNode[] {
  let s = src.replaceAll("=/=", "≠").replaceAll("->", "→").replaceAll("–>", "→");
  s = s.replace(/(\d|\)|[A-Za-z²³]) x (?=[(\dA-Za-z])/g, "$1 × ");
  s = s.replace(/([a-z])\.([a-z])/g, "$1·$2");

  const nodes: ReactNode[] = [];
  const regex = /([A-Za-z0-9)²³]+)\^(-?\d+)|([²³])|\b([a-zA-Z])\b|(×|≠|·)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = regex.exec(s)) !== null) {
    if (m.index > last) nodes.push(s.slice(last, m.index));

    if (m[2] !== undefined) {
      const base = m[1];
      nodes.push(
        <Fragment key={`p${k++}`}>
          {base.length === 1 && /[a-zA-Z]/.test(base) ? (
            <span className="font-serif italic">{base}</span>
          ) : (
            base
          )}
          <sup className="ml-[0.5px] align-super text-[0.6em] font-bold leading-none text-[var(--red)]">
            {m[2]}
          </sup>
        </Fragment>
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <sup key={`s${k++}`} className="ml-[0.5px] align-super text-[0.6em] font-bold leading-none text-[var(--red)]">
          {m[3] === "²" ? "2" : "3"}
        </sup>
      );
    } else if (m[4] !== undefined) {
      nodes.push(
        <span key={`v${k++}`} className="font-serif italic">{m[4]}</span>
      );
    } else if (m[5] !== undefined) {
      nodes.push(<span key={`o${k++}`} className="px-[0.1em]">{m[5]}</span>);
    }
    last = m.index + m[0].length;
  }
  if (last < s.length) nodes.push(s.slice(last));
  return nodes;
}

/**
 * Ekspresi matematika utuh (tidak pernah patah di tengah).
 * Dipakai untuk rumus, opsi jawaban, dan potongan math di dalam kalimat.
 */
export function Eq({ children, className }: { children: string; className?: string }) {
  const nodes = useMemo(() => render(children), [children]);
  return (
    <span className={`inline-block max-w-full whitespace-nowrap align-baseline ${className ?? ""}`}>
      {nodes}
    </span>
  );
}

/**
 * Kalimat panjang yang MENGANDUNG matematika.
 * Kata biasa boleh wrap, tetapi setiap potongan rumus tetap utuh.
 */
export function EqText({ children, className }: { children: string; className?: string }) {
  const parts = useMemo(() => {
    // 1) rangkaian rumus beroperator: "ax^2 + bx + c = 0", "900 + 900 + 75 = 1.875"
    // 2) token tunggal bernotasi pangkat: "x^2", "(-2)^2", "x²"
    const OPERAND = "\\d*\\(?-?[A-Za-z0-9²³.,/-]+\\)?(?:\\^-?\\d+)?";
    const SPAN = new RegExp(
      "(" +
        OPERAND + "(?:\\s*[-+×=]\\s*" + OPERAND + ")+" + "|" +
        "\\([A-Za-z0-9²³^+\\s-]+\\)\\([A-Za-z0-9²³^+\\s-]+\\)" + "|" +
        "\\(?-?[A-Za-z0-9]+\\)?\\^-?\\d+" + "|" +
        "[A-Za-z0-9]+[²³]" +
      ")",
      "g"
    );

    const out: { teks: string; math: boolean }[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = SPAN.exec(children)) !== null) {
      let token = m[0];
      let mulai = m.index;
      // jangan telan tanda baca penutup kalimat
      const trail = token.match(/[.,;:]+$/);
      if (trail && !/\d$/.test(token.slice(0, -trail[0].length))) {
        token = token.slice(0, -trail[0].length);
      }
      if (!token) continue;
      if (mulai > last) out.push({ teks: children.slice(last, mulai), math: false });
      out.push({ teks: token, math: true });
      last = mulai + token.length;
    }
    if (last < children.length) out.push({ teks: children.slice(last), math: false });
    return out.length ? out : [{ teks: children, math: false }];
  }, [children]);

  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.math ? <Eq key={i}>{p.teks}</Eq> : <Fragment key={i}>{p.teks}</Fragment>
      )}
    </span>
  );
}
