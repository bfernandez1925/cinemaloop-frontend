"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HistorialList } from "@/components/HistorialList";
import { RecordCards } from "@/components/RecordCards";
import { RequireAuth } from "@/components/RequireAuth";
import { ICONS } from "@/design/icons";
import { getUserGames, getUserProfile } from "@/lib/historial/api";
import type { GameHistoryEntry, UserProfile } from "@/lib/historial/types";

const PAGE_SIZE = 20;

function InicioContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partidas, setPartidas] = useState<GameHistoryEntry[]>([]);
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getUserProfile(), getUserGames(0)])
      .then(([profileResult, gamesResult]) => {
        if (cancelled) return;
        setProfile(profileResult);
        setPartidas(gamesResult.partidas);
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
  }, []);

  const loadMore = useCallback(() => {
    const nextPagina = pagina + 1;
    setLoadingMore(true);
    getUserGames(nextPagina)
      .then((result) => {
        setPartidas((prev) => [...prev, ...result.partidas]);
        setPagina(nextPagina);
      })
      .catch(() => setError(true))
      .finally(() => setLoadingMore(false));
  }, [pagina]);

  const GameIcon = ICONS.gameModes;
  // La última página trae menos que PAGE_SIZE entradas (o 0): no hay
  // flag "hasMore" en la respuesta de getUserGames, así que se deriva
  // del tamaño de página fijo del backend (HISTORIAL_PAGE_SIZE).
  const hasMore = partidas.length > 0 && partidas.length === (pagina + 1) * PAGE_SIZE;

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-text-secondary text-sm">Cargando…</p>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <p role="alert" className="text-orange-tint-text text-sm">
          No se pudo cargar tu perfil. Inténtalo de nuevo más tarde.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-5 lg:gap-8 lg:px-20 lg:py-10">
      <h2 className="font-display text-screen-title lg:text-screen-title-lg text-text-primary">
        Mis partidas
      </h2>

      <Link
        href="/modos"
        className="text-button bg-orange text-bg-primary flex w-fit items-center justify-center gap-2 rounded-control px-7 py-[15px]"
      >
        <GameIcon className="h-4 w-4" strokeWidth={2} />
        Jugar partida nueva
      </Link>

      <RecordCards profile={profile} />

      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-text-muted lg:text-xs">
          Historial
        </span>
        <HistorialList partidas={partidas} />
        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="text-button border-border text-text-primary rounded-control mt-2 self-center border-[1.5px] px-7 py-[15px] disabled:opacity-60"
          >
            {loadingMore ? "Cargando…" : "Cargar más"}
          </button>
        )}
      </div>
    </main>
  );
}

export default function InicioPage() {
  return (
    <RequireAuth>
      <InicioContent />
    </RequireAuth>
  );
}
