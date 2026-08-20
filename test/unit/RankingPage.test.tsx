import { fireEvent, render, screen } from "@testing-library/react";
import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RankingPage from "@/app/ranking/page";
import { getLeaderboard } from "@/lib/leaderboard/api";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/lib/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { uid: "user-4" } as User, loading: false }),
}));

vi.mock("@/lib/leaderboard/api", () => ({
  getLeaderboard: vi.fn(),
}));

function entry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    posicion: 1,
    userId: "user-1",
    nombre_usuario: "Marta R.",
    puntuacion: 4820,
    nodos_alcanzados: 15,
    tiempo_medio_respuesta: 3.1,
    tiempo_total: 46.5,
    fecha: "2026-08-18T00:00:00.000Z",
    ...overrides,
  };
}

describe("RankingPage", () => {
  beforeEach(() => {
    vi.mocked(getLeaderboard).mockReset();
  });

  it("muestra las filas del ranking, destacando la del usuario autenticado", async () => {
    vi.mocked(getLeaderboard).mockResolvedValue({
      pagina: 0,
      entradas: [
        entry(),
        entry({ posicion: 4, userId: "user-4", nombre_usuario: "Tú", puntuacion: 4260 }),
      ],
      propia: entry({ posicion: 4, userId: "user-4", nombre_usuario: "Tú", puntuacion: 4260 }),
    });

    render(<RankingPage />);

    expect(await screen.findByRole("heading", { name: "Ranking global" })).toBeInTheDocument();
    expect(screen.getAllByText("Marta R.").length).toBeGreaterThan(0);
    // La fila propia ya está visible en la página: no se repite en un bloque aparte.
    expect(screen.queryByText("Tu posición")).not.toBeInTheDocument();
  });

  it("si la posición propia no está en la página visible, muestra un bloque fijo aparte", async () => {
    vi.mocked(getLeaderboard).mockResolvedValue({
      pagina: 0,
      entradas: [entry()],
      propia: entry({ posicion: 87, userId: "user-4", nombre_usuario: "Tú", puntuacion: 900 }),
    });

    render(<RankingPage />);

    expect(await screen.findByText("Tu posición")).toBeInTheDocument();
    expect(screen.getAllByText("Tú").length).toBeGreaterThan(0);
  });

  it("sin ninguna partida enviada al ranking, no muestra el bloque de posición propia", async () => {
    vi.mocked(getLeaderboard).mockResolvedValue({ pagina: 0, entradas: [entry()], propia: null });

    render(<RankingPage />);

    await screen.findByRole("heading", { name: "Ranking global" });
    expect(screen.queryByText("Tu posición")).not.toBeInTheDocument();
  });

  it('"Cargar más" pide la siguiente página y añade filas', async () => {
    const page0 = Array.from({ length: 50 }, (_, i) =>
      entry({ userId: `p0-${i}`, posicion: i + 1 }),
    );
    vi.mocked(getLeaderboard).mockImplementation((pagina: number) =>
      Promise.resolve(
        pagina === 0
          ? { pagina: 0, entradas: page0, propia: null }
          : {
              pagina: 1,
              entradas: [entry({ userId: "p1-0", posicion: 51, nombre_usuario: "Página 2" })],
              propia: null,
            },
      ),
    );

    render(<RankingPage />);
    const cargarMas = await screen.findByRole("button", { name: "Cargar más" });
    fireEvent.click(cargarMas);

    expect(await screen.findAllByText("Página 2")).not.toHaveLength(0);
    expect(getLeaderboard).toHaveBeenCalledWith(1);
  });

  it("si falla la carga, muestra un error", async () => {
    vi.mocked(getLeaderboard).mockRejectedValue(new Error("network"));

    render(<RankingPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar el ranking. Inténtalo de nuevo más tarde.",
    );
  });
});
