"use client";

import Link from "next/link";

/**
 * Logo baru, kotak teka-teki silang faktor 2×2 ala rubrik koran:
 * [x²][p] di atas, [q][=] di bawah. Hitam-putih dengan aksen merah.
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      role="img"
      aria-label="Logo Faktorku"
      className="shrink-0"
    >
      <rect width="36" height="36" fill="#141414" />
      <rect width="36" height="36" fill="none" stroke="#141414" strokeWidth="2" />
      {/* garis silang */}
      <line x1="18" y1="0" x2="18" y2="36" stroke="#f6f3ec" strokeOpacity="0.75" strokeWidth="1" />
      <line x1="0" y1="18" x2="36" y2="18" stroke="#f6f3ec" strokeOpacity="0.75" strokeWidth="1" />
      {/* sel teka-teki */}
      <text x="9" y="12.5" textAnchor="middle" fontFamily="'Space Mono', monospace" fontSize="8.2" fontWeight="700" fill="#f6f3ec">x²</text>
      <text x="27" y="12.5" textAnchor="middle" fontFamily="'Space Mono', monospace" fontSize="9.5" fontWeight="700" fill="#c11920">p</text>
      <text x="9" y="31" textAnchor="middle" fontFamily="'Space Mono', monospace" fontSize="9.5" fontWeight="700" fill="#c11920">q</text>
      <text x="27" y="31" textAnchor="middle" fontFamily="'Space Mono', monospace" fontSize="9.5" fontWeight="700" fill="#f6f3ec">=</text>
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="transition-transform group-hover:-rotate-3">
        <LogoMark size={30} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span
            className="ff-display block text-[1.05rem] font-black tracking-tight"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            FAKTOR<span className="ff-italic" style={{ color: "var(--red)" }}>KU.</span>
          </span>
          <span
            className="mono mt-1 block text-[0.52rem] uppercase tracking-[0.34em] text-[var(--ink-3)]"
          >
            The Equation Daily
          </span>
        </span>
      )}
    </Link>
  );
}

export function StageDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`h-2 w-2 ${active ? "bg-[var(--red)] pulse-dot" : done ? "bg-emerald-600" : "bg-black/25"}`}
        style={{ borderRadius: 1 }}
      />
      <span className={`text-xs font-bold uppercase tracking-wider ${active ? "text-[var(--red)]" : done ? "text-emerald-700" : "text-[var(--ink-3)]"}`}>
        {label}
      </span>
    </div>
  );
}
