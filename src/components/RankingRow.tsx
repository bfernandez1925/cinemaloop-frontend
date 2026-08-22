import { Avatar } from "@/components/Avatar";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

/** Fila del ranking global: destacada en violeta si es la del usuario
 * autenticado, salvo el 1er puesto que siempre lleva el número en
 * naranja (verificado en la screen "05 · Ranking global" — su script de
 * datos deja el rango 1 en naranja incluso cuando también es "Tú").
 * Reutilizable tanto dentro de la lista paginada como en el bloque fijo
 * de la posición propia cuando no está en la página visible. */
export function RankingRow({ entry, isOwn }: { entry: LeaderboardEntry; isOwn: boolean }) {
  const isFirst = entry.posicion === 1;
  const rankColorClass = isFirst ? "text-orange" : isOwn ? "text-violet" : "text-text-tertiary";
  const scoreColorClass = isOwn ? "text-violet" : "text-text-primary";
  const rowColorClass = isOwn ? "bg-violet-tint-bg border-violet" : "bg-surface border-border";
  const displayName = entry.nombre_usuario ?? "Jugador";

  return (
    <div>
      <div
        className={`rounded-control grid grid-cols-[24px_34px_1fr_auto] items-center gap-[11px] border px-3.5 py-[11px] lg:hidden ${rowColorClass}`}
      >
        <span className={`font-display text-[13px] font-bold ${rankColorClass}`}>
          {entry.posicion}
        </span>
        <Avatar nombre={entry.nombre_usuario} size={34} />
        <div className="flex min-w-0 flex-col gap-px">
          <span className="truncate text-[13px] font-semibold">{displayName}</span>
          <span className="text-[11px] text-text-muted">{entry.nodos_alcanzados} nodos</span>
        </div>
        <span className={`font-display text-[13.5px] font-bold ${scoreColorClass}`}>
          {entry.puntuacion}
        </span>
      </div>

      <div
        className={`rounded-stat-card hidden items-center gap-4 border px-5 py-3.5 lg:grid lg:grid-cols-[48px_56px_1fr_120px_120px_120px] ${rowColorClass}`}
      >
        <span className={`font-display text-base font-bold ${rankColorClass}`}>
          {entry.posicion}
        </span>
        <Avatar nombre={entry.nombre_usuario} size={44} />
        <span className="truncate text-[15px] font-semibold">{displayName}</span>
        <span className="text-text-secondary text-sm">{entry.nodos_alcanzados} nodos</span>
        <span className="text-text-secondary text-sm">
          {entry.tiempo_medio_respuesta.toFixed(1)}s
        </span>
        <span className={`font-display text-right text-base font-bold ${scoreColorClass}`}>
          {entry.puntuacion}
        </span>
      </div>
    </div>
  );
}
