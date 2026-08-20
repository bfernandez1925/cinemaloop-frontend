"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { ICONS } from "@/design/icons";

type ChainPreviewEntity = { name: string; type: "actor" | "movie" };

function ChainEntityBadge({ type }: { type: "actor" | "movie" }) {
  const PersonIcon = ICONS.actor;
  const MovieIcon = ICONS.movie;

  return (
    <div
      className={`flex h-[38px] w-[38px] items-center justify-center border-2 ${
        type === "actor" ? "rounded-full border-violet" : "rounded-lg border-orange"
      }`}
    >
      {type === "actor" ? (
        <PersonIcon className="text-violet h-4 w-4" strokeWidth={1.8} />
      ) : (
        <MovieIcon className="text-orange h-4 w-4" strokeWidth={1.8} />
      )}
    </div>
  );
}

// Tarjetas decorativas de "vista previa de cadena" (solo desktop, no
// están en el frame mobile del handoff). Puramente ilustrativas.
function ChainPreviewCard({
  from,
  to,
  className = "",
}: {
  from: ChainPreviewEntity;
  to: ChainPreviewEntity;
  className?: string;
}) {
  const ArrowIcon = ICONS.arrow;

  return (
    <div
      className={`bg-surface-glass border-border flex items-center gap-[14px] rounded-card-lg border px-[22px] py-4 backdrop-blur-[6px] ${className}`}
    >
      <ChainEntityBadge type={from.type} />
      <span className="text-sm font-semibold">{from.name}</span>
      <ArrowIcon className="text-border h-4 w-4" strokeWidth={2} />
      <ChainEntityBadge type={to.type} />
      <span className="text-sm font-semibold">{to.name}</span>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center lg:flex-row lg:justify-between lg:gap-20 lg:px-24 lg:text-left">
      <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[20%] h-[340px] w-[340px] animate-[cl-drift_14s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(255,90,60,0.35),transparent_70%)] blur-[40px] lg:-top-[25%] lg:-left-[8%] lg:h-[620px] lg:w-[620px] lg:bg-[radial-gradient(circle,rgba(255,90,60,0.32),transparent_70%)] lg:blur-[50px]" />
        <div className="absolute -right-[25%] -bottom-[25%] h-[380px] w-[380px] animate-[cl-drift_16s_ease-in-out_infinite_reverse] rounded-full bg-[radial-gradient(circle,rgba(123,60,255,0.35),transparent_70%)] blur-[40px] lg:-right-[8%] lg:-bottom-[30%] lg:h-[680px] lg:w-[680px] lg:bg-[radial-gradient(circle,rgba(123,60,255,0.32),transparent_70%)] lg:blur-[50px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center lg:max-w-[480px] lg:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element -- asset final del handoff, no un placeholder de TMDb (no necesita next/image) */}
        <img
          src="/cinemaloop-logo.png"
          alt="CinemaLoop"
          className="mb-[18px] h-auto w-32 lg:mb-5 lg:w-[152px]"
        />
        <h1 className="font-display text-wordmark lg:text-wordmark-lg mb-3.5 tracking-tight lg:mb-[18px]">
          CinemaLoop
        </h1>
        <p className="text-lead-paragraph text-text-secondary mb-[30px] leading-relaxed lg:hidden">
          Recibe un actor o una película y encadena tu conocimiento: actor → película → actor. Sin
          repetir nodos, contra el reloj.
        </p>
        <p className="text-lead-paragraph-lg text-text-secondary mb-8 hidden leading-relaxed lg:block">
          Recibe un actor o una película y encadena tu conocimiento: actor → película → actor. Sin
          repetir nodos, contra el reloj. ¿Cuánto puedes alargar la cadena?
        </p>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:gap-3.5">
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className="text-button bg-orange text-bg-primary rounded-control px-7 py-[15px]"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="text-button border-border text-text-primary rounded-control border-[1.5px] px-7 py-[15px]"
          >
            Crear cuenta
          </button>
        </div>

        <div className="mt-9 flex gap-7 lg:mt-11 lg:gap-9">
          <div>
            <div className="font-display text-stat-number lg:text-stat-number-lg text-orange">
              12,480
            </div>
            <div className="text-meta text-text-muted mt-0.5">jugadores</div>
          </div>
          <div>
            <div className="font-display text-stat-number lg:text-stat-number-lg text-violet">
              38
            </div>
            <div className="text-meta text-text-muted mt-0.5">récord de cadena</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-10 hidden flex-col gap-[18px] lg:mt-0 lg:flex">
        <ChainPreviewCard
          from={{ name: "Willem Dafoe", type: "actor" }}
          to={{ name: "The Lighthouse", type: "movie" }}
        />
        <ChainPreviewCard
          from={{ name: "The Lighthouse", type: "movie" }}
          to={{ name: "Willem Dafoe", type: "actor" }}
          className="ml-10"
        />
      </div>

      {authMode && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
          onSuccess={() => router.push("/modos")}
        />
      )}
    </main>
  );
}
