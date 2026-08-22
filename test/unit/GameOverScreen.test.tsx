import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameOverScreen } from "@/components/GameOverScreen";
import { discardGame, saveGame, submitToLeaderboard } from "@/lib/game/api";
import type { GameNode } from "@/lib/game/types";

vi.mock("@/lib/game/api", () => ({
  submitToLeaderboard: vi.fn(),
  saveGame: vi.fn(),
  discardGame: vi.fn(),
}));

const chain: GameNode[] = [
  { tipo: "actor", entidad_tmdb_id: 7, nombre: "Willem Dafoe", imagen: null },
  { tipo: "pelicula", entidad_tmdb_id: 100, nombre: "The Lighthouse", imagen: null },
];

const summary = {
  puntuacion_total: 230,
  nodos_alcanzados: 2,
  tiempo_total: 30,
  tiempo_medio_respuesta: 8.4,
};

describe("GameOverScreen", () => {
  beforeEach(() => {
    vi.mocked(submitToLeaderboard).mockReset();
    vi.mocked(saveGame).mockReset();
    vi.mocked(discardGame).mockReset();
  });

  it("muestra la puntuación, las estadísticas reales y la cadena completa", () => {
    render(<GameOverScreen score={230} gameId="game-1" chain={chain} summary={summary} />);

    expect(screen.getByText("Partida terminada")).toBeInTheDocument();
    expect(screen.getByText("230")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Nodos alcanzados")).toBeInTheDocument();
    expect(screen.getByText("8.4s")).toBeInTheDocument();
    expect(screen.getByText("Tiempo medio")).toBeInTheDocument();
    // No hay ninguna mención a precisión: el backend no la calcula.
    expect(screen.queryByText(/precisión/i)).not.toBeInTheDocument();
    expect(screen.getByText("Cadena completa · 2 nodos")).toBeInTheDocument();
  });

  it("sin resumen (finishGame falló), no muestra las tarjetas de estadística pero sí la cadena y el botón de jugar de nuevo tras resolver", () => {
    render(<GameOverScreen score={100} gameId="game-1" chain={chain} summary={null} />);

    expect(screen.queryByText("Nodos alcanzados")).not.toBeInTheDocument();
    expect(screen.getByText("Cadena completa · 2 nodos")).toBeInTheDocument();
  });

  it('"Enviar al ranking" llama a submitToLeaderboard y, al resolver, deja solo "Volver a jugar"', async () => {
    vi.mocked(submitToLeaderboard).mockResolvedValue({ ok: true });

    render(<GameOverScreen score={230} gameId="game-1" chain={chain} summary={summary} />);
    fireEvent.click(screen.getByRole("button", { name: /Enviar al ranking/ }));

    expect(await screen.findByRole("link", { name: "Volver a jugar" })).toBeInTheDocument();
    expect(submitToLeaderboard).toHaveBeenCalledWith("game-1");
    expect(screen.queryByRole("button", { name: /Guardar partida/ })).not.toBeInTheDocument();
  });

  it('"Guardar partida" llama a saveGame', async () => {
    vi.mocked(saveGame).mockResolvedValue({ ok: true });

    render(<GameOverScreen score={230} gameId="game-1" chain={chain} summary={summary} />);
    fireEvent.click(screen.getByRole("button", { name: /Guardar partida/ }));

    expect(await screen.findByRole("link", { name: "Volver a jugar" })).toBeInTheDocument();
    expect(saveGame).toHaveBeenCalledWith("game-1");
  });

  it('"Descartar" pide confirmación antes de llamar a discardGame', async () => {
    vi.mocked(discardGame).mockResolvedValue({ ok: true });

    render(<GameOverScreen score={230} gameId="game-1" chain={chain} summary={summary} />);
    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));

    const dialog = screen.getByRole("dialog");
    expect(discardGame).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "Descartar" }));

    expect(await screen.findByRole("link", { name: "Volver a jugar" })).toBeInTheDocument();
    expect(discardGame).toHaveBeenCalledWith("game-1");
  });

  it("cancelar la confirmación de descarte no llama a discardGame y deja seguir eligiendo", () => {
    render(<GameOverScreen score={230} gameId="game-1" chain={chain} summary={summary} />);
    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(discardGame).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Enviar al ranking/ })).toBeInTheDocument();
  });

  it("si una acción falla, muestra un error y permite reintentar", async () => {
    vi.mocked(submitToLeaderboard).mockRejectedValue(new Error("network"));

    render(<GameOverScreen score={230} gameId="game-1" chain={chain} summary={summary} />);
    fireEvent.click(screen.getByRole("button", { name: /Enviar al ranking/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo completar la acción. Inténtalo de nuevo.",
    );
    expect(screen.getByRole("button", { name: /Enviar al ranking/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Volver a jugar" })).not.toBeInTheDocument();
  });
});
