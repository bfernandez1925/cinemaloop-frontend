import { formatFecha } from "@/lib/historial/format";
import type { GameHistoryEntry } from "@/lib/historial/types";

function EstadoPill({ estado }: { estado: GameHistoryEntry["estado"] }) {
  const isRanking = estado === "Ranking";

  return (
    <span
      className={`rounded-pill w-fit shrink-0 px-2.5 py-[5px] text-[10px] font-bold uppercase tracking-[0.05em] lg:px-3 lg:py-1.5 lg:text-[11px] ${
        isRanking
          ? "bg-orange-tint-bg text-orange-tint-text"
          : "bg-violet-tint-bg text-violet-tint-text-strong"
      }`}
    >
      {estado}
    </span>
  );
}

/** Historial de partidas de "Mis partidas": lista de tarjetas en mobile,
 * tabla en desktop (verificado en la screen "06 · Mis partidas") — solo
 * lectura, sin ninguna acción de borrado (spec-historial.md: descartar
 * solo está disponible en el resumen de fin de partida). */
export function HistorialList({ partidas }: { partidas: GameHistoryEntry[] }) {
  if (partidas.length === 0) {
    return <p className="text-body text-text-tertiary">Todavía no has jugado ninguna partida.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="hidden grid-cols-[140px_1fr_100px_140px] gap-4 px-5 pb-2.5 lg:grid">
        {["Puntuación", "Fecha", "Nodos", "Estado"].map((label) => (
          <span
            key={label}
            className="text-[11px] font-bold uppercase tracking-[0.06em] text-text-muted"
          >
            {label}
          </span>
        ))}
      </div>

      {partidas.map((partida) => (
        <div
          key={partida.gameId}
          className="rounded-stat-card border-border bg-surface flex items-center justify-between gap-2.5 border px-3.5 py-3.5 lg:grid lg:grid-cols-[140px_1fr_100px_140px] lg:gap-4 lg:px-5 lg:py-4"
        >
          <div className="flex flex-col gap-[3px] lg:contents">
            <span className="text-[14px] font-semibold lg:font-display lg:text-[18px] lg:font-bold">
              {partida.puntuacion_total} pts
            </span>
            <span className="text-[11.5px] text-text-muted lg:hidden">
              {formatFecha(partida.fecha)} · {partida.nodos_alcanzados} nodos
            </span>
            <span className="text-text-secondary hidden text-sm lg:block">
              {formatFecha(partida.fecha)}
            </span>
            <span className="text-text-secondary hidden text-sm lg:block">
              {partida.nodos_alcanzados}
            </span>
          </div>
          <EstadoPill estado={partida.estado} />
        </div>
      ))}
    </div>
  );
}
