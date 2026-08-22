"use client";

import Link from "next/link";
import { useState } from "react";
import { ChainVisualization } from "@/components/ChainVisualization";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ICONS } from "@/design/icons";
import { discardGame, saveGame, submitToLeaderboard } from "@/lib/game/api";
import type { FinishGameResponse, GameNode } from "@/lib/game/types";

type Action = "ranking" | "save" | "discard";
type Status =
  | { kind: "idle" }
  | { kind: "confirmingDiscard" }
  | { kind: "pending"; action: Action }
  | { kind: "done"; action: Action }
  | { kind: "error"; action: Action; message: string };

// Precisión omitida deliberadamente: submitAnswer/finishGame solo
// registran turnos correctos (no hay `turns` de intentos fallidos), así
// que un porcentaje de aciertos real no es calculable con los datos que
// devuelve el backend — decisión del usuario, mostrar solo lo real.
export function GameOverScreen({
  score,
  gameId,
  chain,
  summary,
}: {
  score: number;
  gameId: string;
  chain: GameNode[];
  summary: FinishGameResponse | null;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const TrophyIcon = ICONS.ranking;
  const SaveIcon = ICONS.save;

  async function run(action: Action, call: () => Promise<unknown>) {
    setStatus({ kind: "pending", action });
    try {
      await call();
      setStatus({ kind: "done", action });
    } catch {
      setStatus({
        kind: "error",
        action,
        message: "No se pudo completar la acción. Inténtalo de nuevo.",
      });
    }
  }

  const pendingAction = status.kind === "pending" ? status.action : null;
  const resolved = status.kind === "done";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-6 py-10 text-center lg:max-w-lg lg:py-16">
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted lg:text-xs">
        Partida terminada
      </span>

      <div>
        <p className="bg-gradient-to-br from-orange to-violet bg-clip-text font-display text-score-hero font-bold text-transparent lg:text-score-hero-lg">
          {score}
        </p>
        <p className="text-meta text-text-tertiary">puntos</p>
      </div>

      {summary && (
        <div className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-stat-card border border-border bg-surface px-3.5 py-3.5">
            <p className="font-display text-stat-card-number font-bold text-orange lg:text-stat-card-number-lg">
              {summary.nodos_alcanzados}
            </p>
            <p className="mt-1 text-meta text-text-muted">Nodos alcanzados</p>
          </div>
          <div className="rounded-stat-card border border-border bg-surface px-3.5 py-3.5">
            <p className="font-display text-stat-card-number font-bold text-violet lg:text-stat-card-number-lg">
              {summary.tiempo_medio_respuesta.toFixed(1)}s
            </p>
            <p className="mt-1 text-meta text-text-muted">Tiempo medio</p>
          </div>
        </div>
      )}

      <ChainVisualization chain={chain} />

      {status.kind === "error" && (
        <p role="alert" className="text-sm text-orange-tint-text">
          {status.message}
        </p>
      )}

      {resolved ? (
        <Link
          href="/modos"
          className="text-button rounded-control bg-orange px-7 py-[15px] text-bg-primary"
        >
          Volver a jugar
        </Link>
      ) : (
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            disabled={pendingAction !== null}
            onClick={() => void run("ranking", () => submitToLeaderboard(gameId))}
            className="text-button flex items-center justify-center gap-2 rounded-control bg-orange py-[15px] text-bg-primary disabled:bg-orange-disabled lg:py-[18px]"
          >
            <TrophyIcon className="h-4 w-4" strokeWidth={2} />
            {pendingAction === "ranking" ? "Enviando…" : "Enviar al ranking"}
          </button>
          <button
            type="button"
            disabled={pendingAction !== null}
            onClick={() => void run("save", () => saveGame(gameId))}
            className="text-button flex items-center justify-center gap-2 rounded-control border-[1.5px] border-violet bg-[rgba(123,60,255,0.1)] py-[15px] text-violet-tint-text-strong disabled:opacity-60 lg:py-[18px]"
          >
            <SaveIcon className="h-4 w-4" strokeWidth={2} />
            {pendingAction === "save" ? "Guardando…" : "Guardar partida"}
          </button>
          <button
            type="button"
            disabled={pendingAction !== null}
            onClick={() => setStatus({ kind: "confirmingDiscard" })}
            className="text-button rounded-control border-[1.5px] border-border py-[15px] text-text-tertiary disabled:opacity-60 lg:py-[18px]"
          >
            Descartar
          </button>
        </div>
      )}

      {(status.kind === "confirmingDiscard" ||
        (status.kind === "pending" && status.action === "discard")) && (
        <ConfirmDialog
          title="¿Descartar la partida?"
          description="Se eliminará por completo. No aparecerá en tu historial ni en el ranking."
          confirmLabel="Descartar"
          confirming={status.kind === "pending"}
          onConfirm={() => void run("discard", () => discardGame(gameId))}
          onClose={() => setStatus({ kind: "idle" })}
        />
      )}
    </main>
  );
}
