"use client";

import { useEffect } from "react";
import { EntityImage } from "@/components/EntityImage";
import type { NodeType, PoolEntity } from "@/lib/game/types";

/** Confirmación manual de ambigüedad (CIN-23): cuando hay varios
 * candidatos con popularidad similar, el servidor no elige por el
 * jugador — muestra hasta 3 opciones con foto/póster para que elija.
 * Sin `onClose`: a diferencia de ConfirmDialog, aquí no hay "cancelar"
 * — el turno ya está en curso esperando una elección real. */
export function AmbiguityDialog({
  expectedType,
  candidatos,
  selecting,
  onSelect,
}: {
  expectedType: NodeType;
  candidatos: PoolEntity[];
  selecting: boolean;
  onSelect: (candidato: PoolEntity) => void;
}) {
  useEffect(() => {
    function trapEscape(event: KeyboardEvent) {
      // Se traga el Escape en vez de cerrar (no hay onClose): la
      // elección es obligatoria para continuar el turno.
      if (event.key === "Escape") event.preventDefault();
    }
    document.addEventListener("keydown", trapEscape);
    return () => document.removeEventListener("keydown", trapEscape);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ambiguity-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5"
    >
      <div className="bg-surface border-border relative w-full max-w-sm rounded-card border p-7">
        <h2 id="ambiguity-dialog-title" className="font-display mb-3 text-xl font-medium">
          ¿A quién te refieres?
        </h2>
        <p className="text-body text-text-secondary mb-6">
          Hay varias respuestas igual de probables. Elige la correcta.
        </p>
        <div className="flex flex-col gap-3">
          {candidatos.map((candidato) => (
            <button
              key={candidato.entidad_tmdb_id}
              type="button"
              disabled={selecting}
              onClick={() => onSelect(candidato)}
              className="border-border rounded-control flex items-center gap-3 border p-3 text-left disabled:opacity-60"
            >
              <EntityImage
                path={candidato.imagen}
                type={expectedType === "actor" ? "actor" : "movie"}
                alt={candidato.nombre}
                size={56}
              />
              <span className="font-display text-node-title text-text-primary">
                {candidato.nombre}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
