"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModeCard } from "@/components/ModeCard";
import { ICONS } from "@/design/icons";
import { startGame } from "@/lib/game/api";
import { ACTIVE_GAME_SESSION_KEY } from "@/lib/game/session";

const MODES = [
  {
    key: "clasico",
    title: "Clásico",
    icon: ICONS.modeClasico,
    variant: "primary" as const,
    description: {
      mobile: "Cronómetro por respuesta, sin límite de cadena.",
      desktop: "Cronómetro por respuesta, sin límite de cadena. Ideal para empezar.",
    },
  },
  {
    key: "contrarreloj",
    title: "Contrarreloj",
    icon: ICONS.modeContrarreloj,
    variant: "comingSoon" as const,
    description: {
      mobile: "90 segundos totales para encadenar nodos.",
      desktop:
        "90 segundos totales. Encadena tantos nodos como puedas antes de que se agote el tiempo.",
    },
  },
  {
    key: "maraton",
    title: "Maratón",
    icon: ICONS.modeMaraton,
    variant: "comingSoon" as const,
    description: {
      mobile: "Cadena infinita hasta el primer fallo.",
      desktop: "Cadena infinita: termina solo cuando fallas o repites un nodo.",
    },
  },
];

export function ModeGrid() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStartClasico() {
    setStarting(true);
    setErrorMessage(null);
    try {
      const { gameId, nodoActual } = await startGame("clasico");
      sessionStorage.setItem(ACTIVE_GAME_SESSION_KEY, JSON.stringify({ gameId, nodoActual }));
      router.push("/partida");
    } catch {
      setErrorMessage("No se pudo iniciar la partida. Inténtalo de nuevo.");
      setStarting(false);
    }
  }

  return (
    <div>
      {/* Entrada escalonada de las 3 tarjetas al montar (CIN-52). */}
      <div className="cl-animate-stagger flex flex-col gap-[14px] lg:grid lg:grid-cols-3 lg:gap-6">
        {MODES.map(({ key, variant, ...mode }) => (
          <ModeCard
            key={key}
            variant={variant}
            {...mode}
            onClick={variant === "primary" ? handleStartClasico : undefined}
            loading={variant === "primary" && starting}
          />
        ))}
      </div>
      {errorMessage && (
        <p role="alert" className="text-orange-tint-text mt-4 text-sm">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
