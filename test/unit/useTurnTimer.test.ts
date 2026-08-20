import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TURN_TIME_LIMIT_SECONDS, useTurnTimer } from "@/lib/game/useTurnTimer";

describe("useTurnTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("empieza en el total y cuenta hacia atrás con el tiempo real transcurrido", () => {
    const turnStartedAt = Date.now();
    const { result } = renderHook(() => useTurnTimer(turnStartedAt, 25));

    expect(result.current).toBe(25);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current).toBeCloseTo(15, 1);
  });

  it("nunca baja de 0 aunque haya pasado más tiempo que el límite", () => {
    const turnStartedAt = Date.now();
    const { result } = renderHook(() => useTurnTimer(turnStartedAt, 25));

    act(() => {
      vi.advanceTimersByTime(40_000);
    });

    expect(result.current).toBe(0);
  });

  it("usa TURN_TIME_LIMIT_SECONDS (25) como total por defecto", () => {
    const { result } = renderHook(() => useTurnTimer(Date.now()));

    expect(result.current).toBe(TURN_TIME_LIMIT_SECONDS);
  });

  it("se reinicia cuando turnStartedAt cambia (nuevo turno)", () => {
    const { result, rerender } = renderHook(({ startedAt }) => useTurnTimer(startedAt, 25), {
      initialProps: { startedAt: Date.now() },
    });

    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(result.current).toBeCloseTo(5, 1);

    rerender({ startedAt: Date.now() });
    expect(result.current).toBe(25);
  });
});
