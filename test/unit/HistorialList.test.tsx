import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HistorialList } from "@/components/HistorialList";
import type { GameHistoryEntry } from "@/lib/historial/types";

const partidas: GameHistoryEntry[] = [
  {
    gameId: "game-1",
    fecha: "2026-08-18T00:00:00.000Z",
    modo: "clasico",
    puntuacion_total: 2860,
    nodos_alcanzados: 9,
    estado: "Ranking",
  },
  {
    gameId: "game-2",
    fecha: "2026-08-12T00:00:00.000Z",
    modo: "clasico",
    puntuacion_total: 1910,
    nodos_alcanzados: 7,
    estado: "Guardada",
  },
];

describe("HistorialList", () => {
  it("sin partidas, muestra un mensaje en vez de una lista vacía", () => {
    render(<HistorialList partidas={[]} />);

    expect(screen.getByText("Todavía no has jugado ninguna partida.")).toBeInTheDocument();
  });

  it("muestra cada partida con su puntuación, fecha, nodos y pill de estado", () => {
    render(<HistorialList partidas={partidas} />);

    expect(screen.getByText("2860 pts")).toBeInTheDocument();
    expect(screen.getByText("1910 pts")).toBeInTheDocument();
    expect(screen.getAllByText("Ranking").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Guardada").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/18 ago 2026/).length).toBeGreaterThan(0);
  });
});
