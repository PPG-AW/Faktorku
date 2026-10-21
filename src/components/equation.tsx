"use client";

import { useMemo, type ReactNode } from "react";

/**
 * Renderer persamaan ringan:
 *  - x^2 → x dengan pangkat superskrip
 *  - " x " di antara operand → tanda kali ×
 *  - =/= → ≠, -> → →
 *  - huruf tunggal (x, p, q, a, b, c) → italic matematis
 */
function renderMath(input: string, depth = 0): ReactNode[] {
  let src = input.replaceAll("=/=", "≠").replaceAll("->", "→");
  // Tanda kali: " x " diapit operand (angka, huruf, kurung)
  src = src.replace(/(\d|\)|[A-Za-z]) x (?=[(\dA-Za-z])/g, "$1 × ");
  src = src.replace(/([a-z])\.([a-z])/g, "$1·$2");

  const regex = /([A-Za-z0-9)]+)\^(-?\d+)|\b([a-zA-Z])\b|(×|≠|·)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = regex.exec(src)) !== null) {
    if (m.index > last) nodes.push(src.slice(last, m.index));
    if (m[2] !== undefined) {
      const base = m[1];
      nodes.push(
        <span key={k++} className="whitespace-nowrap">
          {depth < 2 ? renderMath(base, depth + 1) : base}
          <sup className="ml-px text-[0.62em] font-bold text-indigo-300">{m[2]}</sup>
        </span>
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <span key={k++} className="font-serif italic tracking-wide text-sky-200">
          {m[3]}
        </span>
      );
    } else if (m[4] !== undefined) {
      nodes.push(
        <span key={k++} className="px-0.5 text-amber-300/90">
          {m[4]}
        </span>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < src.length) nodes.push(src.slice(last));
  return nodes;
}

export function Eq({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const nodes = useMemo(() => renderMath(children), [children]);
  return <span className={className}>{nodes}</span>;
}
