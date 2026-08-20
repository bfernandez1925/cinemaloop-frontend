import { useEffect, useState } from "react";

// Límite de turno del modo Clásico — mismo valor que
// TURN_TIME_LIMIT_SECONDS en cinemaloop-backend (src/config/gameEngine.ts).
// El servidor es la fuente de verdad de la regla (25s); este hook solo
// cuenta hacia atrás en el cliente desde el instante real en que empezó
// el turno (`turnStartedAt`, fijado cuando llega un nodoActual nuevo de
// startGame/submitAnswer) — nunca inventa su propia duración.
export const TURN_TIME_LIMIT_SECONDS = 25;

/** Segundos restantes del turno actual, recalculados cada 200ms a partir
 * de `turnStartedAt` (epoch ms) — null mientras no hay turno activo. */
export function useTurnTimer(
  turnStartedAt: number | null,
  totalSeconds: number = TURN_TIME_LIMIT_SECONDS,
): number {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);

  useEffect(() => {
    if (turnStartedAt === null) return;
    const startedAt = turnStartedAt;

    function tick() {
      const elapsed = (Date.now() - startedAt) / 1000;
      setRemainingSeconds(Math.max(0, totalSeconds - elapsed));
    }

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [turnStartedAt, totalSeconds]);

  return remainingSeconds;
}
