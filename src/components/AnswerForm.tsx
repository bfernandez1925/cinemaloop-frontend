"use client";

import { useState, type FormEvent } from "react";
import { ICONS } from "@/design/icons";
import type { NodeType } from "@/lib/game/types";
import { useSpeechRecognition } from "@/lib/voice/useSpeechRecognition";

const FIELD = {
  actor: { placeholder: "Nombre del actor o actriz…", icon: ICONS.actor, color: "violet" },
  pelicula: { placeholder: "Nombre de la película…", icon: ICONS.movie, color: "orange" },
} as const satisfies Record<NodeType, { placeholder: string; icon: unknown; color: string }>;

/** Input de respuesta (sin autocompletado/sugerencias en ningún caso,
 * spec-frontend-ux.md: "decisión explícita de diseño") + botón de
 * micrófono (Web Speech API, CIN-37 / spec-voice-input.md). El envío es
 * por Enter o al terminar de hablar, como en el handoff — no hay un
 * botón de enviar independiente dibujado en la screen 03a/03b. */
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

  function submitValue(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || submitting) return;
    onSubmit(trimmed);
    setValue("");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitValue(value);
  }

  // El texto transcrito converge en el mismo submitValue que el texto
  // escrito — ninguna validación distinta para voz (spec-voice-input.md).
  const speech = useSpeechRecognition({
    onResult: (transcript) => {
      setValue(transcript);
      submitValue(transcript);
    },
  });

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
          disabled={!speech.supported || submitting}
          aria-label={
            !speech.supported
              ? "Entrada por voz no disponible en este navegador"
              : speech.listening
                ? "Detener entrada por voz"
                : "Responder por voz"
          }
          onClick={() => (speech.listening ? speech.stop() : speech.start())}
          className={`border-violet flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-control border transition-colors lg:h-[54px] lg:w-[54px] ${
            speech.listening ? "bg-violet" : "bg-violet-tint-bg"
          } ${!speech.supported ? "opacity-60" : ""}`}
        >
          <MicIcon
            className={`h-[18px] w-[18px] lg:h-5 lg:w-5 ${
              speech.listening ? "text-bg-primary" : "text-violet-tint-text"
            }`}
            strokeWidth={1.8}
          />
        </button>
      </form>
      {submitting && (
        <p role="status" className="text-meta text-text-tertiary">
          Comprobando…
        </p>
      )}
      {speech.error === "not-allowed" && (
        <p role="alert" className="text-meta text-text-tertiary">
          No se pudo acceder al micrófono. Puedes escribir tu respuesta.
        </p>
      )}
    </div>
  );
}
