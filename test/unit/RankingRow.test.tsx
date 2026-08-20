import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RankingRow } from "@/components/RankingRow";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

function entry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    posicion: 4,
    userId: "user-1",
    nombre_usuario: "Iván C.",
    puntuacion: 4260,
    nodos_alcanzados: 13,
    tiempo_medio_respuesta: 3.7,
    tiempo_total: 48.1,
    fecha: "2026-08-18T00:00:00.000Z",
    ...overrides,
  };
}

describe("RankingRow", () => {
  it("muestra la posición, el nombre, la cadena y la puntuación", () => {
    render(<RankingRow entry={entry()} isOwn={false} />);

    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Iván C.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4260").length).toBeGreaterThan(0);
    expect(screen.getAllByText("13 nodos").length).toBeGreaterThan(0);
  });

  it("sin nombre_usuario, muestra un nombre por defecto", () => {
    render(<RankingRow entry={entry({ nombre_usuario: null })} isOwn={false} />);

    expect(screen.getAllByText("Jugador").length).toBeGreaterThan(0);
  });

  it("la fila del usuario propio lleva el color violeta destacado", () => {
    const { container } = render(<RankingRow entry={entry()} isOwn={true} />);

    expect(container.innerHTML).toContain("bg-violet-tint-bg");
    expect(container.innerHTML).toContain("text-violet");
  });

  it("el 1er puesto siempre lleva el número en naranja, incluso si es la fila propia", () => {
    const { container } = render(<RankingRow entry={entry({ posicion: 1 })} isOwn={true} />);

    const rankSpans = Array.from(container.querySelectorAll("span")).filter(
      (span) => span.textContent === "1",
    );
    expect(rankSpans.length).toBeGreaterThan(0);
    rankSpans.forEach((span) => expect(span.className).toContain("text-orange"));
  });
});
