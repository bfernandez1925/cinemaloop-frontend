import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnswerForm } from "@/components/AnswerForm";

let lastInstance: SpeechRecognition | null = null;

function createFakeSpeechRecognition(): SpeechRecognition {
  const instance = {
    lang: "",
    interimResults: false,
    maxAlternatives: 1,
    onresult: null,
    onerror: null,
    onend: null,
    start: vi.fn(),
    stop: vi.fn(() => instance.onend?.()),
  } as unknown as SpeechRecognition;
  lastInstance = instance;
  return instance;
}

function resultEvent(transcript: string): SpeechRecognitionEvent {
  return { results: { length: 1, 0: { 0: { transcript } } } } as unknown as SpeechRecognitionEvent;
}

function errorEvent(error: string): SpeechRecognitionErrorEvent {
  return { error } as SpeechRecognitionErrorEvent;
}

describe("AnswerForm", () => {
  afterEach(() => {
    lastInstance = null;
    delete (window as { SpeechRecognition?: unknown }).SpeechRecognition;
    delete (window as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  });

  it("el input no tiene autocompletado ni sugerencias en ningún caso", () => {
    render(<AnswerForm expectedType="pelicula" submitting={false} onSubmit={vi.fn()} />);

    const input = screen.getByPlaceholderText("Nombre de la película…");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("autocapitalize", "off");
    expect(input).toHaveAttribute("spellcheck", "false");
  });

  it("al enviar, llama a onSubmit con el texto recortado y limpia el input", () => {
    const onSubmit = vi.fn();
    render(<AnswerForm expectedType="pelicula" submitting={false} onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("Nombre de la película…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  The Lighthouse  " } });
    fireEvent.submit(input.closest("form")!);

    expect(onSubmit).toHaveBeenCalledWith("The Lighthouse");
    expect(input.value).toBe("");
  });

  it("no envía si el input está vacío o solo tiene espacios", () => {
    const onSubmit = vi.fn();
    render(<AnswerForm expectedType="actor" submitting={false} onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("Nombre del actor o actriz…");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(input.closest("form")!);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra "Comprobando…" mientras submitting es true, y deshabilita el input', () => {
    render(<AnswerForm expectedType="actor" submitting={true} onSubmit={vi.fn()} />);

    expect(screen.getByText("Comprobando…")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre del actor o actriz…")).toBeDisabled();
  });

  describe("entrada por voz (CIN-37)", () => {
    it("sin soporte de Web Speech API, el botón de micrófono está deshabilitado", () => {
      render(<AnswerForm expectedType="actor" submitting={false} onSubmit={vi.fn()} />);

      expect(
        screen.getByRole("button", { name: "Entrada por voz no disponible en este navegador" }),
      ).toBeDisabled();
      // El input de texto sigue disponible sin fricción (spec-voice-input.md).
      expect(screen.getByPlaceholderText("Nombre del actor o actriz…")).toBeEnabled();
    });

    it("con soporte, pulsar el micrófono empieza a escuchar", () => {
      window.SpeechRecognition =
        createFakeSpeechRecognition as unknown as new () => SpeechRecognition;
      render(<AnswerForm expectedType="actor" submitting={false} onSubmit={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: "Responder por voz" }));

      expect(lastInstance?.start).toHaveBeenCalledOnce();
      expect(screen.getByRole("button", { name: "Detener entrada por voz" })).toBeInTheDocument();
    });

    it("la transcripción se envía como respuesta igual que el texto escrito, sin validación distinta", () => {
      window.SpeechRecognition =
        createFakeSpeechRecognition as unknown as new () => SpeechRecognition;
      const onSubmit = vi.fn();
      render(<AnswerForm expectedType="pelicula" submitting={false} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByRole("button", { name: "Responder por voz" }));
      act(() => lastInstance?.onresult?.(resultEvent("  The Lighthouse  ")));

      expect(onSubmit).toHaveBeenCalledWith("The Lighthouse");
    });

    it("si se deniega el permiso de micrófono, muestra un aviso y el input sigue disponible", () => {
      window.SpeechRecognition =
        createFakeSpeechRecognition as unknown as new () => SpeechRecognition;
      render(<AnswerForm expectedType="actor" submitting={false} onSubmit={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: "Responder por voz" }));
      act(() => lastInstance?.onerror?.(errorEvent("not-allowed")));

      expect(
        screen.getByText("No se pudo acceder al micrófono. Puedes escribir tu respuesta."),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Nombre del actor o actriz…")).toBeEnabled();
    });
  });
});
