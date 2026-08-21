import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSpeechRecognition } from "@/lib/voice/useSpeechRecognition";

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

describe("useSpeechRecognition", () => {
  afterEach(() => {
    lastInstance = null;
    delete (window as { SpeechRecognition?: unknown }).SpeechRecognition;
  });

  it("sin SpeechRecognition en window, supported es false", () => {
    const { result } = renderHook(() => useSpeechRecognition({ onResult: vi.fn() }));

    expect(result.current.supported).toBe(false);
  });

  it("con soporte, start() crea un reconocimiento con el idioma indicado y lo arranca", () => {
    window.SpeechRecognition =
      createFakeSpeechRecognition as unknown as new () => SpeechRecognition;
    const { result } = renderHook(() => useSpeechRecognition({ lang: "es-ES", onResult: vi.fn() }));

    act(() => result.current.start());

    expect(lastInstance?.lang).toBe("es-ES");
    expect(lastInstance?.start).toHaveBeenCalledOnce();
    expect(result.current.listening).toBe(true);
  });

  it("al terminar el reconocimiento (onend), listening vuelve a false", () => {
    window.SpeechRecognition =
      createFakeSpeechRecognition as unknown as new () => SpeechRecognition;
    const { result } = renderHook(() => useSpeechRecognition({ onResult: vi.fn() }));

    act(() => result.current.start());
    act(() => lastInstance?.onend?.());

    expect(result.current.listening).toBe(false);
  });

  it("onResult recibe el transcrito recortado", () => {
    window.SpeechRecognition =
      createFakeSpeechRecognition as unknown as new () => SpeechRecognition;
    const onResult = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onResult }));

    act(() => result.current.start());
    act(() =>
      lastInstance?.onresult?.({
        results: { length: 1, 0: { 0: { transcript: "  Dracula  " } } },
      } as unknown as SpeechRecognitionEvent),
    );

    expect(onResult).toHaveBeenCalledWith("Dracula");
  });

  it("un error 'not-allowed' se expone como tal", () => {
    window.SpeechRecognition =
      createFakeSpeechRecognition as unknown as new () => SpeechRecognition;
    const { result } = renderHook(() => useSpeechRecognition({ onResult: vi.fn() }));

    act(() => result.current.start());
    act(() => lastInstance?.onerror?.({ error: "not-allowed" } as SpeechRecognitionErrorEvent));

    expect(result.current.error).toBe("not-allowed");
  });
});
