"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModeCard } from "@/components/ModeCard";
import { ICONS } from "@/design/icons";
import { startGame } from "@/lib/game/api";
import type { GameMode } from "@/lib/game/types";
import { ACTIVE_GAME_SESSION_KEY } from "@/lib/game/session";

const MODES: Array<{
  key: GameMode;
  title: string;
  icon: (typeof ICONS)[keyof typeof ICONS];
  badge?: string;
  description: { mobile: string; desktop: string };
}> = [
  {
    key: "clasico",
    title: "Clásico",
    icon: ICONS.modeClasico,
    badge: "Popular",
    description: {
      mobile: "Cronómetro por respuesta, sin límite de cadena.",
      desktop: "Cronómetro por respuesta, sin límite de cadena. Ideal para empezar.",
    },
  },
  {
    key: "contrarreloj",
    title: "Contrarreloj",
    icon: ICONS.modeContrarreloj,
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
    description: {
      mobile: "Cadena infinita hasta el primer fallo.",
      desktop: "Cadena infinita: termina solo cuando fallas o repites un nodo.",
    },
  },
  {
    key: "infantil",
    title: "Infantil",
    icon: ICONS.modeInfantil,
    description: {
      mobile: "Actores y películas familiares, sin límite de cadena.",
      desktop: "Actores y películas familiares y de animación, sin límite de cadena.",
    },
  },
];

export function ModeGrid() {
  const router = useRouter();
  const [startingMode, setStartingMode] = useState<GameMode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStartMode(modo: GameMode) {
    setStartingMode(modo);
    setErrorMessage(null);
    try {
      const { gameId, nodoActual } = await startGame(modo);
      sessionStorage.setItem(ACTIVE_GAME_SESSION_KEY, JSON.stringify({ gameId, modo, nodoActual }));
      router.push("/partida");
    } catch {
      setErrorMessage("No se pudo iniciar la partida. Inténtalo de nuevo.");
      setStartingMode(null);
    }
  }

  return (
    <div>
      {/* Entrada escalonada de las tarjetas al montar (CIN-52). */}
      <div className="cl-animate-stagger flex flex-col gap-[14px] lg:grid lg:grid-cols-2 lg:gap-6">
        {MODES.map(({ key, ...mode }) => (
          <ModeCard
            key={key}
            variant="primary"
            {...mode}
            onClick={() => void handleStartMode(key)}
            loading={startingMode === key}
            disabled={startingMode !== null && startingMode !== key}
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
