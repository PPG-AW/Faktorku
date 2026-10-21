export function Ambient({ variant = "default" }: { variant?: "default" | "warm" | "cool" }) {
  void variant;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Grid kertas tipis */}
      <div className="bg-grid absolute inset-0 opacity-60" />
      {/* Kolom surat kabar samar di tepi kiri */}
      <div
        className="absolute top-0 bottom-0 left-0 w-44 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,#141414 0 2px,transparent 2px 9px)",
          maskImage: "linear-gradient(90deg,#000,transparent)",
          WebkitMaskImage: "linear-gradient(90deg,#000,transparent)",
        }}
      />
      {/* Garis lukisan persamaan besar samar di kanan bawah */}
      <div
        className="absolute -right-8 -bottom-10 select-none font-serif italic opacity-[0.06]"
        style={{ fontFamily: '"Playfair Display", serif', fontSize: "22rem", lineHeight: 1 }}
      >
        x²
      </div>
      {/* Vignette kertas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(20,20,20,0.06)_100%)]" />
    </div>
  );
}
