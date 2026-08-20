import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModeGrid } from "@/components/ModeGrid";
import { startGame } from "@/lib/game/api";
import { ACTIVE_GAME_SESSION_KEY } from "@/lib/game/session";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/game/api", () => ({
  startGame: vi.fn(),
}));

describe("ModeGrid", () => {
  beforeEach(() => {
    pushMock.mockClear();
    vi.mocked(startGame).mockReset();
    sessionStorage.clear();
  });

  it("al elegir Clásico, inicia la partida, guarda la sesión y navega a /partida", async () => {
    const nodoActual = {
      tipo: "actor" as const,
      entidad_tmdb_id: 7,
      nombre: "Willem Dafoe",
      imagen: null,
      pais_origen: "Estados Unidos",
      anio_nacimiento: 1955,
    };
    vi.mocked(startGame).mockResolvedValue({ gameId: "game-1", nodoActual });

    render(<ModeGrid />);
    fireEvent.click(screen.getByRole("button", { name: /clásico/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/partida"));
    expect(startGame).toHaveBeenCalledWith("clasico");
    expect(JSON.parse(sessionStorage.getItem(ACTIVE_GAME_SESSION_KEY)!)).toEqual({
      gameId: "game-1",
      nodoActual,
    });
  });

  it("si startGame falla, muestra un error y no navega", async () => {
    vi.mocked(startGame).mockRejectedValue(new Error("boom"));

    render(<ModeGrid />);
    fireEvent.click(screen.getByRole("button", { name: /clásico/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo iniciar la partida. Inténtalo de nuevo.",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("Contrarreloj y Maratón siguen deshabilitados, sin disparar startGame", () => {
    render(<ModeGrid />);

    fireEvent.click(screen.getByRole("button", { name: /contrarreloj/i }));
    fireEvent.click(screen.getByRole("button", { name: /maratón/i }));

    expect(startGame).not.toHaveBeenCalled();
  });
});
