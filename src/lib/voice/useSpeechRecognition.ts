"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechRecognitionErrorReason = "not-allowed" | "no-speech" | "other";

/** Envuelve la Web Speech API (spec-voice-input.md): sin lógica de
 * validación propia — el texto transcrito llega igual que el escrito,
 * vía el mismo `onResult`, para que converja en el mismo `submitAnswer`
 * en quien la use. Si el navegador no expone `SpeechRecognition` (fuera
 * de Chrome/Edge, soporte desigual), `supported` es `false` y no hay
 * ningún otro efecto — el input de texto sigue disponible sin fricción. */
export function useSpeechRecognition({
  lang = "es-ES",
  onResult,
}: {
  lang?: string;
  onResult: (transcript: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<SpeechRecognitionErrorReason | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  });

  const supported =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor || listening) return;

    setError(null);
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1]?.[0]?.transcript ?? "";
      if (transcript.trim()) onResultRef.current(transcript.trim());
    };
    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "not-allowed"
          : event.error === "no-speech"
            ? "no-speech"
            : "other",
      );
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [lang, listening]);

  // Corta el reconocimiento en curso si el componente se desmonta
  // (p. ej. la partida termina) en vez de dejarlo escuchando de fondo.
  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { supported, listening, start, stop, error };
}
