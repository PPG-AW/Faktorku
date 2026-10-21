import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { Eq } from "@/components/equation";
import { LoginPanel } from "@/components/login-panel";
import { ArrowRight, BookOpen, GraduationCap, PenLine } from "lucide-react";

const TUJUAN = [
  {
    icon: BookOpen,
    title: "Memahami konsep",
    description: "Mengenali bentuk umum, koefisien, dan akar-akar persamaan kuadrat.",
  },
  {
    icon: PenLine,
    title: "Menemukan T-Faktor",
    description: "Memfaktorkan persamaan kuadrat dengan a = 1 melalui hubungan p + q dan p × q.",
  },
  {
    icon: GraduationCap,
    title: "Membuktikan akar",
    description: "Menentukan nilai x dari bentuk faktor, lalu membuktikannya dengan substitusi.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Ambient />

      <header className="relative z-10 border-b-2 border-[var(--ink)] bg-[var(--paper)]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Logo />
          <span className="mono hidden text-[0.62rem] font-bold uppercase tracking-[0.28em] text-[var(--ink-3)] sm:block">
            Matematika · Kelas X
          </span>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-5 py-10 md:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:py-14">
        {/* Materi utama */}
        <div className="anim-fade-up">
          <div className="mono flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--red)]">
            <BookOpen className="h-4 w-4" />
            Materi Pembelajaran Hari Ini
          </div>

          <h1
            className="mt-5 leading-[0.94] tracking-tight"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: "clamp(calc(3.2rem + 10px), calc(7.5vw + 10px), calc(6.4rem + 10px))",
            }}
          >
            Persamaan
            <br />
            <em className="ff-italic text-[var(--red)]">Kuadrat</em>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-[1.8] text-[var(--ink-2)] md:text-lg">
            Belajar menemukan akar-akar persamaan kuadrat melalui faktorisasi
            dengan metode <strong className="text-[var(--ink)]">T-Faktor</strong> untuk
            bentuk <span className="mono eq-badge px-2 py-0.5"><Eq>a = 1</Eq></span>,
            lewat kisah usaha sablon kaos Rina.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="eq-badge mono px-5 py-3 text-xl font-bold md:text-2xl">
              <Eq>ax^2 + bx + c = 0</Eq>
            </div>
            <ArrowRight className="h-5 w-5 text-[var(--red)]" />
            <div className="eq-badge mono px-5 py-3 text-xl font-bold md:text-2xl">
              <Eq>(x + p)(x + q) = 0</Eq>
            </div>
          </div>

          {/* Tujuan belajar */}
          <div className="mt-9 border-t-2 border-[var(--ink)] pt-4">
            <p className="mono text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--ink-3)]">
              Hari ini kita akan belajar
            </p>
            <div className="mt-3 grid gap-px bg-[var(--hairline-strong)] sm:grid-cols-3" style={{ border: "1px solid var(--hairline)" }}>
              {TUJUAN.map((item, index) => (
                <article key={item.title} className="bg-[var(--card)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="mono text-[0.62rem] font-bold tracking-[0.2em] text-[var(--red)]">
                      0{index + 1}
                    </span>
                    <item.icon className="h-4 w-4 text-[var(--ink-3)]" />
                  </div>
                  <h2 className="mt-3 text-lg leading-snug">{item.title}</h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-2)]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Login */}
        <div className="anim-fade-up anim-fade-up-2">
          <LoginPanel />
        </div>

      </section>
    </main>
  );
}
