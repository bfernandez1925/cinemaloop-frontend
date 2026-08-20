"use client";

import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { ICONS } from "@/design/icons";
import { useAuth } from "@/lib/auth/AuthProvider";

type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;

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

// Tarjeta de icono + título + descripción, reutilizada por "Cómo se
// juega" y "Por qué jugar" (CIN-51 — contenido comercial inventado, sin
// frame de handoff detrás).
function InfoCard({
  icon: Icon,
  iconColor,
  title,
  description,
}: {
  icon: IconType;
  iconColor: "orange" | "violet";
  title: string;
  description: string;
}) {
  return (
    <div className="bg-surface border-border rounded-card lg:rounded-card-lg flex flex-col items-start gap-3 border p-6 text-left">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full ${
          iconColor === "orange" ? "bg-orange-tint-bg" : "bg-violet-tint-bg"
        }`}
      >
        <Icon
          className={iconColor === "orange" ? "text-orange h-5 w-5" : "text-violet h-5 w-5"}
          strokeWidth={1.8}
        />
      </div>
      <h3 className="font-display text-card-title lg:text-card-title-lg text-text-primary">
        {title}
      </h3>
      <p className="text-card-body lg:text-card-body-lg text-text-tertiary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

const STEPS = [
  {
    icon: ICONS.actor,
    iconColor: "violet" as const,
    title: "Recibe un actor o una actriz",
    description: "Te mostramos su foto y algunos datos para que lo reconozcas de un vistazo.",
  },
  {
    icon: ICONS.movie,
    iconColor: "orange" as const,
    title: "Encadena con una película",
    description:
      "Escribe un título en el que haya actuado — o al revés, si te toca partir de una película.",
  },
  {
    icon: ICONS.clock,
    iconColor: "violet" as const,
    title: "Todo contra el reloj",
    description: "25 segundos por turno. Sigue encadenando sin repetir nunca un mismo nombre.",
  },
];

const FEATURES = [
  {
    icon: ICONS.aiCorrection,
    iconColor: "violet" as const,
    title: "Corrección inteligente",
    description:
      "Nuestra IA entiende erratas y nombres a medias, tanto de actores y actrices como de películas.",
  },
  {
    icon: ICONS.ranking,
    iconColor: "orange" as const,
    title: "Ranking global",
    description: "Compite con miles de jugadores y descubre tu puesto en la clasificación.",
  },
  {
    icon: ICONS.clock,
    iconColor: "violet" as const,
    title: "Tensión real",
    description: "25 segundos por turno, ni uno más: cada decisión cuenta de verdad.",
  },
  {
    icon: ICONS.gameModes,
    iconColor: "orange" as const,
    title: "Varios modos de juego",
    description: "Clásico ya disponible; Contrarreloj y Maratón llegan muy pronto.",
  },
];

const STATS = [
  { value: "12,480", label: "jugadores registrados", color: "orange" as const },
  { value: "48,300", label: "partidas jugadas", color: "violet" as const },
  { value: "3,780", label: "actores y actrices encadenados", color: "orange" as const },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/inicio");
  }, [loading, user, router]);

  // Un usuario con sesión activa nunca debe ver el formulario de
  // login/registro de la landing (CIN-50) — se bloquea el render hasta
  // que Firebase Auth confirme que no hay sesión, igual que RequireAuth.
  if (loading || user) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center">
        <p className="text-text-secondary text-sm">Cargando…</p>
      </main>
    );
  }

  return (
    <>
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
            Te llega un actor, una actriz o una película: encadénalos sin repetir ninguno, contra el
            reloj.
          </p>
          <p className="text-lead-paragraph-lg text-text-secondary mb-8 hidden leading-relaxed lg:block">
            Te llega un actor, una actriz o una película: encadénalos sin repetir ninguno, contra el
            reloj. ¿Cuánto puedes alargar la cadena?
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

      {/* Contenido comercial añadido en CIN-51: no forma parte del hero del
          handoff (que termina donde acaba <main> arriba), son secciones
          nuevas para reforzar la landing como página de producto. */}
      <section className="px-6 py-16 lg:px-24 lg:py-24">
        <h2 className="font-display text-screen-title lg:text-screen-title-lg text-text-primary text-center">
          Cómo se juega
        </h2>
        <p className="text-body text-text-secondary mx-auto mt-3 max-w-md text-center">
          Tres pasos, un solo objetivo: no repetir nunca un nombre.
        </p>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-3">
          {STEPS.map((step) => (
            <InfoCard key={step.title} {...step} />
          ))}
        </div>
      </section>

      <section className="bg-surface-elevated px-6 py-16 lg:px-24 lg:py-24">
        <h2 className="font-display text-screen-title lg:text-screen-title-lg text-text-primary text-center">
          Por qué te va a picar
        </h2>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <InfoCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="px-6 py-14 lg:px-24">
        <div className="mx-auto flex max-w-3xl flex-col justify-center gap-10 text-center lg:flex-row lg:gap-16">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div
                className={`font-display text-stat-number lg:text-stat-number-lg ${
                  stat.color === "orange" ? "text-orange" : "text-violet"
                }`}
              >
                {stat.value}
              </div>
              <div className="text-meta text-text-muted mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 text-center lg:px-24 lg:py-24">
        <h2 className="font-display text-screen-title lg:text-screen-title-lg text-text-primary">
          ¿Listo para encadenar tu primera partida?
        </h2>
        <p className="text-body text-text-secondary mx-auto mt-3 max-w-md">
          Regístrate gratis y empieza a encadenar actores, actrices y películas ahora mismo.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 lg:flex-row lg:gap-3.5">
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="text-button bg-orange text-bg-primary rounded-control px-7 py-[15px]"
          >
            Crear cuenta
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className="text-button border-border text-text-primary rounded-control border-[1.5px] px-7 py-[15px]"
          >
            Iniciar sesión
          </button>
        </div>
      </section>

      <footer className="border-border text-meta text-text-muted border-t px-6 py-8 text-center">
        © 2026 CinemaLoop — hecho por y para amantes del cine.
      </footer>
    </>
  );
}
