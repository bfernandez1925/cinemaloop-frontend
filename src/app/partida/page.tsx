"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AmbiguityDialog } from "@/components/AmbiguityDialog";
import { AnswerForm } from "@/components/AnswerForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DirectionIndicator } from "@/components/DirectionIndicator";
import { GameBadges } from "@/components/GameBadges";
import { GameOverScreen } from "@/components/GameOverScreen";
import { NodeCard } from "@/components/NodeCard";
import { RequireAuth } from "@/components/RequireAuth";
import { TimerRing } from "@/components/TimerRing";
import { UsedEntitiesList } from "@/components/UsedEntitiesList";
import { ICONS } from "@/design/icons";
import { finishGame, submitAnswer } from "@/lib/game/api";
import type {
  FinishGameResponse,
  GameMode,
  GameNode,
  NodeType,
  PoolEntity,
  SubmitAnswerResponse,
} from "@/lib/game/types";
import {
  CONTRARRELOJ_TOTAL_TIME_LIMIT_SECONDS,
  TURN_TIME_LIMIT_SECONDS,
  useTurnTimer,
} from "@/lib/game/useTurnTimer";
import { clearActiveGameSession, readActiveGameSession } from "@/lib/game/session";

type Phase = "loading" | "playing" | "checking" | "ambiguous" | "gameOver";

// Se envía cuando se acaba el tiempo sin nada válido escrito (submitAnswer
// no acepta una respuesta vacía) — un texto que en la práctica nunca
// encaja con TMDb, así que el turno se resuelve como incorrecto por el
// mismo camino ya existente en el servidor, sin duplicar aquí su lógica
// de fin de partida. Se usa tanto para el timeout por turno (Clásico)
// como para el timeout de partida completa (Contrarreloj, CIN-62).
const TIMEOUT_ANSWER = "(tiempo agotado)";

// Config del temporizador por modo (CIN-62/CIN-54): Clásico e Infantil
// cuentan por turno (se resetea en cada respuesta — Infantil comparte
// toda la mecánica de Clásico, solo cambia el pool), Contrarreloj cuenta
// la partida completa (nunca se resetea), Maratón no tiene temporizador
// visible — el guard de inactividad del servidor (5 min) es una red de
// seguridad silenciosa, no una cuenta atrás que deba verse.
function getTimerTotalSeconds(modo: GameMode): number | null {
  if (modo === "clasico" || modo === "infantil") return TURN_TIME_LIMIT_SECONDS;
  if (modo === "contrarreloj") return CONTRARRELOJ_TOTAL_TIME_LIMIT_SECONDS;
  return null;
}

const INACTIVITY_ERROR_MESSAGE = "La partida se cerró por inactividad.";

function PartidaContent() {
  const router = useRouter();
  // Se lee la sesión de forma síncrona en la inicialización perezosa del
  // estado (no en un efecto) para no disparar un setState en cascada
  // justo al montar — solo la redirección cuando falta necesita efecto.
  const [session] = useState(() => readActiveGameSession());
  const [gameId] = useState(() => session?.gameId ?? null);
  const [modo] = useState<GameMode>(() => session?.modo ?? "clasico");
  const [chain, setChain] = useState<GameNode[]>(() => (session ? [session.nodoActual] : []));
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>(() => (session ? "playing" : "loading"));
  const [turnStartedAt, setTurnStartedAt] = useState<number | null>(() =>
    session ? Date.now() : null,
  );
  // A diferencia de turnStartedAt, nunca se reinicia entre turnos — es
  // la referencia del temporizador de partida completa en Contrarreloj
  // (CIN-62). Mismo instante que turnStartedAt en el primer turno.
  const [gameStartedAt] = useState<number | null>(() => (session ? Date.now() : null));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<FinishGameResponse | null>(null);
  const [confirmingQuit, setConfirmingQuit] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const [ambiguousCandidates, setAmbiguousCandidates] = useState<PoolEntity[] | null>(null);
  // Se reenvía tal cual al confirmar un candidato ambiguo (CIN-23): el
  // tiempo de respuesta ya transcurrió en el envío original, no debe
  // penalizar al jugador por el tiempo que tarde en elegir.
  const pendingAnswerRef = useRef<{ respuesta: string; tiempoRespuestaSegundos: number } | null>(
    null,
  );
  const timedOutRef = useRef(false);

  useEffect(() => {
    if (!session) router.replace("/modos");
  }, [session, router]);

  const currentNode = chain.length > 0 ? chain[chain.length - 1]! : null;
  const expectedType: NodeType | null = currentNode
    ? currentNode.tipo === "actor"
      ? "pelicula"
      : "actor"
    : null;
  // Dos relojes independientes: turnRemainingSeconds (se resetea cada
  // turno, siempre calculado — es la base real de tiempo_respuesta_segundos
  // sin importar el modo) y gameRemainingSeconds (nunca se resetea, solo
  // relevante para el temporizador visual de partida completa de
  // Contrarreloj). Cuál se muestra depende del modo (CIN-62).
  const turnRemainingSeconds = useTurnTimer(
    phase === "playing" && modo !== "maraton" ? turnStartedAt : null,
  );
  const gameRemainingSeconds = useTurnTimer(
    phase === "playing" && modo === "contrarreloj" ? gameStartedAt : null,
    CONTRARRELOJ_TOTAL_TIME_LIMIT_SECONDS,
  );
  const timerTotalSeconds = getTimerTotalSeconds(modo);
  const remainingSeconds = modo === "contrarreloj" ? gameRemainingSeconds : turnRemainingSeconds;

  const endGame = useCallback(async (finalScore: number, activeGameId: string) => {
    setScore(finalScore);
    setPhase("gameOver");
    clearActiveGameSession();
    try {
      setSummary(await finishGame(activeGameId));
    } catch {
      // El resumen detallado (nodos alcanzados, tiempo medio) es un
      // añadido informativo — si finishGame falla, el jugador ya ve
      // su puntuación final igualmente, no se bloquea la pantalla.
      setSummary(null);
    }
  }, []);

  // Camino común a una respuesta resuelta (directa o tras confirmar un
  // candidato ambiguo, CIN-23): avanza la cadena o termina la partida.
  // El servidor nunca devuelve `ambiguo` para una respuesta ya resuelta
  // (ni la primera vez que no hay ambigüedad real, ni tras confirmar un
  // candidato_id) — de ahí el `throw` defensivo, nunca esperado en la práctica.
  const applyResolvedResult = useCallback(
    async (result: SubmitAnswerResponse, activeGameId: string) => {
      if ("ambiguo" in result) {
        throw new Error("Respuesta ambigua inesperada tras resolver el turno.");
      }
      if (!result.correcto) {
        await endGame(result.puntuacion_total, activeGameId);
        return;
      }
      setChain((prev) => [...prev, result.nodoActual]);
      setScore(result.puntuacion_total);
      if (result.partida_finalizada) {
        await endGame(result.puntuacion_total, activeGameId);
        return;
      }
      timedOutRef.current = false;
      setTurnStartedAt(Date.now());
      setPhase("playing");
    },
    [endGame],
  );

  const handleAnswer = useCallback(
    async (respuesta: string) => {
      if (!gameId || !currentNode || phase !== "playing") return;
      setPhase("checking");
      setErrorMessage(null);
      // Tiempo real del turno actual, no derivado de qué reloj se
      // muestra (que en Contrarreloj es el de partida completa, no el
      // de turno) — válido igual en cualquier modo.
      const tiempoRespuestaSegundos = turnStartedAt
        ? Math.max(0, (Date.now() - turnStartedAt) / 1000)
        : 0;

      try {
        const result = await submitAnswer(gameId, respuesta, tiempoRespuestaSegundos);
        if ("ambiguo" in result && result.ambiguo) {
          pendingAnswerRef.current = { respuesta, tiempoRespuestaSegundos };
          setAmbiguousCandidates(result.candidatos);
          setPhase("ambiguous");
          return;
        }
        await applyResolvedResult(result, gameId);
      } catch (error) {
        // La partida de Maratón puede haberse cerrado server-side por
        // inactividad (CIN-62) sin que el frontend lo supiera todavía —
        // distinto de un fallo de red genérico: la partida ya terminó,
        // seguir en "playing" dejaría al jugador escribiendo en vano.
        if (error instanceof Error && error.message.includes(INACTIVITY_ERROR_MESSAGE)) {
          await endGame(score, gameId);
          return;
        }
        setErrorMessage("No se pudo comprobar la respuesta. Inténtalo de nuevo.");
        setPhase("playing");
      }
    },
    [gameId, currentNode, phase, turnStartedAt, applyResolvedResult, endGame, score],
  );

  // El diálogo de ambigüedad permanece visible (con los botones
  // deshabilitados vía `selecting`) mientras se confirma — solo se
  // cierra al resolver con éxito, ver más abajo.
  const handleSelectCandidate = useCallback(
    async (candidato: PoolEntity) => {
      const pending = pendingAnswerRef.current;
      if (!gameId || !pending) return;
      setPhase("checking");
      setErrorMessage(null);

      try {
        const result = await submitAnswer(
          gameId,
          pending.respuesta,
          pending.tiempoRespuestaSegundos,
          candidato.entidad_tmdb_id,
        );
        await applyResolvedResult(result, gameId);
        setAmbiguousCandidates(null);
      } catch {
        setErrorMessage("No se pudo comprobar la respuesta. Inténtalo de nuevo.");
        setPhase("ambiguous");
      }
    },
    [gameId, applyResolvedResult],
  );

  async function handleQuit() {
    if (!gameId) return;
    setQuitting(true);
    await endGame(score, gameId);
    setQuitting(false);
    setConfirmingQuit(false);
  }

  useEffect(() => {
    // Maratón no tiene temporizador (timerTotalSeconds === null): nunca
    // se auto-envía un timeout por tiempo, solo el guard de inactividad
    // silencioso del servidor puede cerrar la partida.
    if (
      phase === "playing" &&
      timerTotalSeconds !== null &&
      remainingSeconds <= 0 &&
      !timedOutRef.current
    ) {
      timedOutRef.current = true;
      void handleAnswer(TIMEOUT_ANSWER);
    }
  }, [phase, timerTotalSeconds, remainingSeconds, handleAnswer]);

  if (phase === "loading" || !currentNode || !expectedType) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-text-secondary text-sm">Cargando…</p>
      </main>
    );
  }

  if (phase === "gameOver") {
    // gameId solo falta si nunca hubo sesión activa, y en ese caso el
    // efecto de arriba ya redirige a /modos antes de llegar aquí.
    if (!gameId) return null;
    return <GameOverScreen score={score} gameId={gameId} chain={chain} summary={summary} />;
  }

  const usedEntities = chain.filter((node) => node.tipo === expectedType);
  const CloseIcon = ICONS.close;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-5 lg:px-20 lg:py-10">
      <div className="flex items-center justify-between lg:mb-5">
        <button
          type="button"
          aria-label="Terminar partida"
          onClick={() => setConfirmingQuit(true)}
          className="border-border bg-surface flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border lg:h-10 lg:w-10"
        >
          <CloseIcon
            className="text-text-primary h-[15px] w-[15px] lg:h-[17px] lg:w-[17px]"
            strokeWidth={1.8}
          />
        </button>
        <GameBadges nodeCount={chain.length} score={score} />
      </div>

      {confirmingQuit && (
        <ConfirmDialog
          title="¿Terminar la partida?"
          description={`Tu puntuación actual (${score} puntos) se guardará. No podrás seguir esta partida después.`}
          confirmLabel="Terminar partida"
          confirming={quitting}
          onConfirm={() => void handleQuit()}
          onClose={() => setConfirmingQuit(false)}
        />
      )}

      {ambiguousCandidates && (
        <AmbiguityDialog
          expectedType={expectedType}
          candidatos={ambiguousCandidates}
          selecting={phase === "checking"}
          onSelect={(candidato) => void handleSelectCandidate(candidato)}
        />
      )}

      {timerTotalSeconds !== null && (
        <div className="flex flex-col items-center gap-2 lg:hidden">
          <TimerRing remainingSeconds={remainingSeconds} totalSeconds={timerTotalSeconds} />
        </div>
      )}

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[340px_1fr] lg:items-start lg:gap-14">
        <div className="flex flex-col items-center gap-5">
          {timerTotalSeconds !== null && (
            <div className="hidden lg:block">
              <TimerRing remainingSeconds={remainingSeconds} totalSeconds={timerTotalSeconds} />
            </div>
          )}
          {/* key fuerza el remount en cada nodo nuevo, para que la
              animación de entrada (CIN-52) se repita en cada turno
              superado en vez de solo la primera vez. */}
          <NodeCard key={currentNode.entidad_tmdb_id} node={currentNode} />
        </div>

        <div className="flex flex-col gap-4 lg:gap-6">
          <DirectionIndicator currentType={currentNode.tipo} />
          <AnswerForm
            expectedType={expectedType}
            submitting={phase === "checking"}
            onSubmit={(respuesta) => void handleAnswer(respuesta)}
          />
          {errorMessage && (
            <p role="alert" className="text-orange-tint-text text-sm">
              {errorMessage}
            </p>
          )}
          <UsedEntitiesList type={expectedType} entities={usedEntities} />
        </div>
      </div>
    </main>
  );
}

export default function PartidaPage() {
  return (
    <RequireAuth>
      <PartidaContent />
    </RequireAuth>
  );
}
