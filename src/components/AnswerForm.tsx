"use client";

import { useState, type FormEvent } from "react";
import { ICONS } from "@/design/icons";
import type { NodeType } from "@/lib/game/types";

const FIELD = {
  actor: { placeholder: "Nombre del actor o actriz…", icon: ICONS.actor, color: "violet" },
  pelicula: { placeholder: "Nombre de la película…", icon: ICONS.movie, color: "orange" },
} as const satisfies Record<NodeType, { placeholder: string; icon: unknown; color: string }>;

/** Input de respuesta (sin autocompletado/sugerencias en ningún caso,
 * spec-frontend-ux.md: "decisión explícita de diseño") + botón de
 * micrófono, deshabilitado hasta la integración funcional de voz
 * (fase 3, CIN-37). El envío es por Enter, como en el handoff — no hay
 * un botón de enviar independiente dibujado en la screen 03a/03b. */
export function AnswerForm({
  expectedType,
  submitting,
  onSubmit,
}: {
  expectedType: NodeType;
  submitting: boolean;
  onSubmit: (respuesta: string) => void;
}) {
  const [value, setValue] = useState("");
  const field = FIELD[expectedType];
  const Icon = field.icon;
  const MicIcon = ICONS.mic;
  const isViolet = field.color === "violet";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || submitting) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Icon
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 lg:left-[18px] lg:h-[18px] lg:w-[18px] ${
              isViolet ? "text-violet" : "text-orange"
            }`}
            strokeWidth={1.8}
          />
          <input
            type="text"
            // Ninguna sugerencia ni autocompletado en ningún caso — la
            // mecánica no debe insinuar la respuesta (decisión de diseño).
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={field.placeholder}
            aria-label={field.placeholder}
            value={value}
            disabled={submitting}
            onChange={(event) => setValue(event.target.value)}
            className={`text-input lg:text-input-lg bg-surface text-text-primary rounded-control w-full border-[1.5px] py-[14px] pr-3.5 pl-10 outline-none disabled:opacity-60 lg:py-[17px] lg:pl-12 ${
              isViolet ? "border-violet" : "border-orange"
            }`}
          />
        </div>
        <button
          type="button"
          disabled
          aria-label="Entrada por voz (próximamente)"
          className="border-violet bg-violet-tint-bg flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-control border opacity-60 lg:h-[54px] lg:w-[54px]"
        >
          <MicIcon
            className="text-violet-tint-text h-[18px] w-[18px] lg:h-5 lg:w-5"
            strokeWidth={1.8}
          />
        </button>
      </form>
      {submitting && (
        <p role="status" className="text-meta text-text-tertiary">
          Comprobando…
        </p>
      )}
    </div>
  );
}
