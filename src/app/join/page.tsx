"use client";

import { Ambient } from "@/components/ambient";
import { Logo } from "@/components/topbar";
import { LoginPanel } from "@/components/login-panel";

export default function JoinPage() {
  return (
    <main className="relative min-h-screen">
      <Ambient />

      <header className="relative z-10 border-b-2 border-[var(--ink)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <Logo />
          <span className="mono hidden text-[0.62rem] font-bold uppercase tracking-[0.28em] text-[var(--ink-3)] sm:block">
            Halaman Login
          </span>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-73px)] max-w-5xl items-center gap-10 px-5 py-10 md:px-8 lg:grid-cols-[1fr_420px]">
        <div className="anim-fade-up">
          <div className="mono text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--red)]">
            Persamaan Kuadrat
          </div>
          <h1
            className="mt-4 leading-[0.96] tracking-tight"
            style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: "clamp(calc(2.4rem + 10px), calc(5.5vw + 10px), calc(4rem + 10px))" }}
          >
            Siap belajar
            <br />
            <em className="ff-italic text-[var(--red)]">bersama kelas?</em>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-[1.8] text-[var(--ink-2)] md:text-base">
            Masukkan username kamu terlebih dahulu. Setelah itu, cukup ketik kode
            kelas yang ditampilkan guru di layar depan untuk bergabung.
          </p>
        </div>

        <div className="anim-fade-up anim-fade-up-2">
          <LoginPanel />
        </div>
      </section>
    </main>
  );
}
