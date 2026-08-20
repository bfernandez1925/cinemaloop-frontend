"use client";

import { useEffect } from "react";

/** Diálogo de confirmación genérico para acciones que no deberían
 * dispararse por una pulsación accidental (retirada voluntaria de
 * partida, CIN-42; reutilizable donde haga falta más adelante, p. ej.
 * "Descartar partida" en spec-scoring-leaderboard.md). */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  confirming = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="bg-surface border-border relative w-full max-w-sm rounded-card border p-7">
        <h2 id="confirm-dialog-title" className="font-display mb-3 text-xl font-medium">
          {title}
        </h2>
        <p className="text-body text-text-secondary mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="text-button border-border text-text-primary rounded-control flex-1 border-[1.5px] py-3 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="text-button bg-orange text-bg-primary rounded-control disabled:bg-orange-disabled flex-1 py-3"
          >
            {confirming ? "Un momento…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
