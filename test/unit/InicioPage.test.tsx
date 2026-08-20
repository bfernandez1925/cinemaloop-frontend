import { fireEvent, render, screen } from "@testing-library/react";
import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InicioPage from "@/app/inicio/page";
import { getUserGames, getUserProfile } from "@/lib/historial/api";
import type { GameHistoryEntry } from "@/lib/historial/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/lib/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { uid: "user-1" } as User, loading: false }),
}));

vi.mock("@/lib/historial/api", () => ({
  getUserProfile: vi.fn(),
  getUserGames: vi.fn(),
}));

const profile = {
  nombre_usuario: "Jugador Uno",
  mejor_puntuacion: 4860,
  cadena_mas_larga: 14,
  partidas_jugadas: 27,
};

function partida(overrides: Partial<GameHistoryEntry> = {}): GameHistoryEntry {
  return {
    gameId: "game-1",
    fecha: "2026-08-18T00:00:00.000Z",
    modo: "clasico",
    puntuacion_total: 2860,
    nodos_alcanzados: 9,
    estado: "Ranking",
    ...overrides,
  };
}

describe("InicioPage", () => {
  beforeEach(() => {
    vi.mocked(getUserProfile).mockReset();
    vi.mocked(getUserGames).mockReset();
  });

  it("muestra un CTA para jugar una partida nueva, las tarjetas de récord y el historial", async () => {
    vi.mocked(getUserProfile).mockResolvedValue(profile);
    vi.mocked(getUserGames).mockResolvedValue({ pagina: 0, partidas: [partida()] });

    render(<InicioPage />);

    expect(await screen.findByRole("link", { name: /Jugar partida nueva/ })).toHaveAttribute(
      "href",
      "/modos",
    );
    expect(screen.getByText("4860")).toBeInTheDocument();
    expect(screen.getByText("2860 pts")).toBeInTheDocument();
  });

  it("si falla la carga, muestra un error en vez de quedarse en Cargando…", async () => {
    vi.mocked(getUserProfile).mockRejectedValue(new Error("network"));
    vi.mocked(getUserGames).mockResolvedValue({ pagina: 0, partidas: [] });

    render(<InicioPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar tu perfil. Inténtalo de nuevo más tarde.",
    );
  });

  it('"Cargar más" pide la siguiente página y añade las partidas al historial', async () => {
    vi.mocked(getUserProfile).mockResolvedValue(profile);
    const page0 = Array.from({ length: 20 }, (_, i) => partida({ gameId: `p0-${i}` }));
    vi.mocked(getUserGames).mockImplementation((pagina: number) =>
      Promise.resolve(
        pagina === 0
          ? { pagina: 0, partidas: page0 }
          : { pagina: 1, partidas: [partida({ gameId: "p1-0", puntuacion_total: 500 })] },
      ),
    );

    render(<InicioPage />);
    const cargarMas = await screen.findByRole("button", { name: "Cargar más" });
    fireEvent.click(cargarMas);

    expect(await screen.findByText("500 pts")).toBeInTheDocument();
    expect(getUserGames).toHaveBeenCalledWith(1);
  });

  it("sin más de una página de resultados, no muestra el botón «Cargar más»", async () => {
    vi.mocked(getUserProfile).mockResolvedValue(profile);
    vi.mocked(getUserGames).mockResolvedValue({ pagina: 0, partidas: [partida()] });

    render(<InicioPage />);

    await screen.findByText("2860 pts");
    expect(screen.queryByRole("button", { name: "Cargar más" })).not.toBeInTheDocument();
  });
});
