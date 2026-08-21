"use client";

import { useCallback, useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { RankingModeTabs } from "@/components/RankingModeTabs";
import { RankingRow } from "@/components/RankingRow";
import { RequireAuth } from "@/components/RequireAuth";
import { ICONS } from "@/design/icons";
import type { GameMode } from "@/lib/game/types";
import { getLeaderboard } from "@/lib/leaderboard/api";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

const PAGE_SIZE = 50;

function RankingContent() {
  const [modo, setModo] = useState<GameMode>("clasico");
  const [entradas, setEntradas] = useState<LeaderboardEntry[]>([]);
  const [propia, setPropia] = useState<LeaderboardEntry | null>(null);
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  // Al cambiar de pestaña hay que volver a mostrar "Cargando…" antes de
  // que termine la nueva consulta — ajuste de estado en respuesta a un
  // cambio de prop/state, así que se hace durante el render (patrón
  // recomendado por React), no dentro del efecto de abajo.
  const [modoEnCurso, setModoEnCurso] = useState(modo);
  if (modo !== modoEnCurso) {
    setModoEnCurso(modo);
    setLoading(true);
    setError(false);
  }

  useEffect(() => {
    let cancelled = false;
    getLeaderboard(0, modo)
      .then((result) => {
        if (cancelled) return;
        setEntradas(result.entradas);
        setPropia(result.propia);
        setPagina(0);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modo]);

  const loadMore = useCallback(() => {
    const nextPagina = pagina + 1;
    setLoadingMore(true);
    getLeaderboard(nextPagina, modo)
      .then((result) => {
        setEntradas((prev) => [...prev, ...result.entradas]);
        setPropia(result.propia);
        setPagina(nextPagina);
      })
      .catch(() => setError(true))
      .finally(() => setLoadingMore(false));
  }, [pagina, modo]);

  const RankingIcon = ICONS.ranking;
  // La última página trae menos que PAGE_SIZE entradas (o 0): no hay
  // flag "hasMore" en la respuesta de getLeaderboard, así que se deriva
  // del tamaño de página fijo del backend (LEADERBOARD_PAGE_SIZE).
  const hasMore = entradas.length > 0 && entradas.length === (pagina + 1) * PAGE_SIZE;
  const propiaVisible = propia !== null && entradas.some((entry) => entry.userId === propia.userId);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 lg:px-20 lg:py-10">
      <div className="mb-6 flex items-center gap-[14px] lg:mb-8 lg:gap-3">
        <BackButton href="/inicio" />
        <RankingIcon className="text-orange h-5 w-5 lg:h-[26px] lg:w-[26px]" strokeWidth={1.6} />
        <h2 className="font-display text-[20px] font-semibold lg:text-[28px]">Ranking global</h2>
      </div>

      {/* Cambiar de pestaña relanza la consulta con el modo elegido, sin
          navegar a otra URL (CIN-63). */}
      <RankingModeTabs value={modo} onChange={setModo} />

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <p className="text-text-secondary text-sm">Cargando…</p>
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
          <p role="alert" className="text-orange-tint-text text-sm">
            No se pudo cargar el ranking. Inténtalo de nuevo más tarde.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden grid-cols-[48px_56px_1fr_120px_120px_120px] gap-4 px-5 pb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-text-muted lg:grid">
            <span>#</span>
            <span />
            <span>Jugador</span>
            <span>Cadena</span>
            <span>T. medio</span>
            <span className="text-right">Puntos</span>
          </div>

          <div className="flex flex-col gap-2">
            {entradas.length === 0 ? (
              <p className="text-body text-text-tertiary">Todavía no hay nadie en el ranking.</p>
            ) : (
              entradas.map((entry) => (
                <RankingRow
                  key={entry.userId}
                  entry={entry}
                  isOwn={propia !== null && propia.userId === entry.userId}
                />
              ))
            )}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="text-button border-border text-text-primary rounded-control mt-4 self-center border-[1.5px] px-7 py-[15px] disabled:opacity-60"
            >
              {loadingMore ? "Cargando…" : "Cargar más"}
            </button>
          )}

          {propia !== null && !propiaVisible && (
            <div className="mt-6 flex flex-col gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-text-muted lg:text-xs">
                Tu posición
              </span>
              <RankingRow entry={propia} isOwn />
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function RankingPage() {
  return (
    <RequireAuth>
      <RankingContent />
    </RequireAuth>
  );
}
