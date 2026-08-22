import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { User } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PartidaPage from "@/app/partida/page";
import { finishGame, submitAnswer } from "@/lib/game/api";
import type { SubmitAnswerResponse } from "@/lib/game/types";
import { clearActiveGameSession, readActiveGameSession } from "@/lib/game/session";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/lib/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { uid: "user-1" } as User, loading: false }),
}));

vi.mock("@/lib/game/api", () => ({
  submitAnswer: vi.fn(),
  finishGame: vi.fn(),
  submitToLeaderboard: vi.fn(),
  saveGame: vi.fn(),
  discardGame: vi.fn(),
}));

vi.mock("@/lib/game/session", () => ({
  readActiveGameSession: vi.fn(),
  clearActiveGameSession: vi.fn(),
}));

const actorNode = {
  tipo: "actor" as const,
  entidad_tmdb_id: 7,
  nombre: "Willem Dafoe",
  imagen: null,
  pais_origen: "Estados Unidos",
  anio_nacimiento: 1955,
};

const movieNode = {
  tipo: "pelicula" as const,
  entidad_tmdb_id: 100,
  nombre: "The Lighthouse",
  imagen: null,
};

describe("PartidaPage", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    vi.mocked(submitAnswer).mockReset();
    vi.mocked(finishGame).mockReset();
    vi.mocked(clearActiveGameSession).mockReset();
    vi.mocked(readActiveGameSession).mockReturnValue({
      gameId: "game-1",
      modo: "clasico",
      nodoActual: actorNode,
    });
  });

  it("sin sesión activa, redirige a /modos y no muestra la partida", () => {
    vi.mocked(readActiveGameSession).mockReturnValue(null);

    render(<PartidaPage />);

    expect(replaceMock).toHaveBeenCalledWith("/modos");
    expect(screen.queryByText("Willem Dafoe")).not.toBeInTheDocument();
  });

  it("muestra el nodo inicial y pide una película (dirección actor → película)", () => {
    render(<PartidaPage />);

    expect(screen.getByText("Willem Dafoe")).toBeInTheDocument();
    expect(screen.getByText("Escribe una película")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre de la película…")).toBeInTheDocument();
  });

  it('al enviar, muestra "Comprobando…" mientras submitAnswer resuelve', async () => {
    let resolveSubmit!: (value: SubmitAnswerResponse) => void;
    vi.mocked(submitAnswer).mockReturnValue(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      }),
    );

    render(<PartidaPage />);
    fireEvent.change(screen.getByPlaceholderText("Nombre de la película…"), {
      target: { value: "The Lighthouse" },
    });
    fireEvent.submit(screen.getByPlaceholderText("Nombre de la película…").closest("form")!);

    expect(await screen.findByText("Comprobando…")).toBeInTheDocument();

    resolveSubmit({ correcto: true, nodoActual: movieNode, puntos: 130, puntuacion_total: 130 });
    expect(await screen.findByText("The Lighthouse")).toBeInTheDocument();
  });

  it("respuesta correcta: avanza al nuevo nodo, actualiza puntuación y pasa a pedir un actor", async () => {
    vi.mocked(submitAnswer).mockResolvedValue({
      correcto: true,
      nodoActual: movieNode,
      puntos: 130,
      puntuacion_total: 130,
    });

    render(<PartidaPage />);
    fireEvent.change(screen.getByPlaceholderText("Nombre de la película…"), {
      target: { value: "The Lighthouse" },
    });
    fireEvent.submit(screen.getByPlaceholderText("Nombre de la película…").closest("form")!);

    expect(await screen.findByText("The Lighthouse")).toBeInTheDocument();
    expect(screen.getByText("130")).toBeInTheDocument();
    expect(screen.getByText("Escribe un actor o actriz")).toBeInTheDocument();
    // La lista de "ya usados" (actores) ya incluye a Willem Dafoe.
    expect(screen.getByText("Actores/actrices ya usados · no se repiten")).toBeInTheDocument();
  });

  it("respuesta incorrecta: termina la partida y pide el resumen con finishGame", async () => {
    vi.mocked(submitAnswer).mockResolvedValue({ correcto: false, puntuacion_total: 100 });
    vi.mocked(finishGame).mockResolvedValue({
      puntuacion_total: 100,
      nodos_alcanzados: 3,
      tiempo_total: 45,
      tiempo_medio_respuesta: 15,
    });

    render(<PartidaPage />);
    fireEvent.change(screen.getByPlaceholderText("Nombre de la película…"), {
      target: { value: "Película que no existe" },
    });
    fireEvent.submit(screen.getByPlaceholderText("Nombre de la película…").closest("form")!);

    expect(await screen.findByText("Partida terminada")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(await screen.findByText("3")).toBeInTheDocument();
    expect(screen.getByText("Nodos alcanzados")).toBeInTheDocument();
    expect(finishGame).toHaveBeenCalledWith("game-1");
  });

  it("si submitAnswer falla por red, muestra un error y deja seguir jugando", async () => {
    vi.mocked(submitAnswer).mockRejectedValue(new Error("network"));

    render(<PartidaPage />);
    fireEvent.change(screen.getByPlaceholderText("Nombre de la película…"), {
      target: { value: "The Lighthouse" },
    });
    fireEvent.submit(screen.getByPlaceholderText("Nombre de la película…").closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo comprobar la respuesta. Inténtalo de nuevo.",
    );
    // Sigue en la misma partida, no ha terminado.
    expect(screen.queryByText("Partida terminada")).not.toBeInTheDocument();
    expect(screen.getByText("Willem Dafoe")).toBeInTheDocument();
  });

  describe("retirada voluntaria (CIN-42)", () => {
    it("pulsar el botón de cerrar pide confirmación antes de terminar", () => {
      render(<PartidaPage />);

      fireEvent.click(screen.getByRole("button", { name: "Terminar partida" }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(finishGame).not.toHaveBeenCalled();
    });

    it("cancelar la confirmación no termina la partida", () => {
      render(<PartidaPage />);

      fireEvent.click(screen.getByRole("button", { name: "Terminar partida" }));
      fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByText("Willem Dafoe")).toBeInTheDocument();
      expect(finishGame).not.toHaveBeenCalled();
    });

    it("confirmar termina la partida conservando la puntuación acumulada y llama a finishGame", async () => {
      vi.mocked(finishGame).mockResolvedValue({
        puntuacion_total: 0,
        nodos_alcanzados: 1,
        tiempo_total: 5,
        tiempo_medio_respuesta: 5,
      });

      render(<PartidaPage />);
      fireEvent.click(screen.getByRole("button", { name: "Terminar partida" }));
      const dialog = screen.getByRole("dialog");
      fireEvent.click(within(dialog).getByRole("button", { name: "Terminar partida" }));

      expect(await screen.findByText("Partida terminada")).toBeInTheDocument();
      expect(finishGame).toHaveBeenCalledWith("game-1");
      expect(clearActiveGameSession).toHaveBeenCalledOnce();
    });
  });

  describe("confirmación manual de ambigüedad (CIN-23)", () => {
    const candidatos = [
      { tipo: "pelicula" as const, entidad_tmdb_id: 400, nombre: "Candidato A", imagen: null },
      { tipo: "pelicula" as const, entidad_tmdb_id: 401, nombre: "Candidato B", imagen: null },
    ];

    it("respuesta ambigua: muestra el diálogo con los candidatos y no termina la partida", async () => {
      vi.mocked(submitAnswer).mockResolvedValue({ ambiguo: true, candidatos });

      render(<PartidaPage />);
      fireEvent.change(screen.getByPlaceholderText("Nombre de la película…"), {
        target: { value: "Ambigua" },
      });
      fireEvent.submit(screen.getByPlaceholderText("Nombre de la película…").closest("form")!);

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Candidato A")).toBeInTheDocument();
      expect(screen.getByText("Candidato B")).toBeInTheDocument();
      expect(screen.queryByText("Partida terminada")).not.toBeInTheDocument();
    });

    it("elegir un candidato reenvía submitAnswer con el mismo tiempo de respuesta y el candidato_id elegido", async () => {
      vi.mocked(submitAnswer).mockResolvedValueOnce({ ambiguo: true, candidatos });
      vi.mocked(submitAnswer).mockResolvedValueOnce({
        correcto: true,
        nodoActual: candidatos[1]!,
        puntos: 130,
        puntuacion_total: 130,
      });

      render(<PartidaPage />);
      fireEvent.change(screen.getByPlaceholderText("Nombre de la película…"), {
        target: { value: "Ambigua" },
      });
      fireEvent.submit(screen.getByPlaceholderText("Nombre de la película…").closest("form")!);
      await screen.findByRole("dialog");

      fireEvent.click(screen.getByText("Candidato B"));

      expect(await screen.findByText("130")).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(submitAnswer).toHaveBeenCalledTimes(2);
      const [, , , candidatoId] = vi.mocked(submitAnswer).mock.calls[1]!;
      expect(candidatoId).toBe(401);
      // El tiempo de respuesta es el mismo en ambas llamadas: no penaliza
      // el tiempo que tarda el jugador en elegir entre los candidatos.
      const tiempoOriginal = vi.mocked(submitAnswer).mock.calls[0]![2];
      const tiempoConfirmacion = vi.mocked(submitAnswer).mock.calls[1]![2];
      expect(tiempoConfirmacion).toBe(tiempoOriginal);
    });

    it("si la confirmación falla por red, muestra un error y mantiene el diálogo abierto", async () => {
      vi.mocked(submitAnswer).mockResolvedValueOnce({ ambiguo: true, candidatos });
      vi.mocked(submitAnswer).mockRejectedValueOnce(new Error("network"));

      render(<PartidaPage />);
      fireEvent.change(screen.getByPlaceholderText("Nombre de la película…"), {
        target: { value: "Ambigua" },
      });
      fireEvent.submit(screen.getByPlaceholderText("Nombre de la película…").closest("form")!);
      await screen.findByRole("dialog");

      fireEvent.click(screen.getByText("Candidato A"));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "No se pudo comprobar la respuesta. Inténtalo de nuevo.",
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("temporizador por modo (CIN-62)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("Contrarreloj: el temporizador es de partida completa (90s) y no se resetea entre turnos", async () => {
      vi.mocked(readActiveGameSession).mockReturnValue({
        gameId: "game-1",
        modo: "contrarreloj",
        nodoActual: actorNode,
      });
      vi.mocked(submitAnswer).mockResolvedValue({
        correcto: true,
        nodoActual: movieNode,
        puntos: 100,
        puntuacion_total: 100,
      });

      render(<PartidaPage />);
      // Mobile y desktop renderizan cada uno su propio TimerRing
      // (ocultos entre sí solo por CSS, ambos presentes en el DOM) —
      // basta con comprobar el primero, están sincronizados.
      expect(screen.getAllByRole("timer")[0]).toHaveAccessibleName("90 segundos restantes");

      await act(async () => {
        vi.advanceTimersByTime(10_000);
      });
      expect(screen.getAllByRole("timer")[0]).toHaveAccessibleName("80 segundos restantes");

      fireEvent.change(screen.getByPlaceholderText("Nombre de la película…"), {
        target: { value: "The Lighthouse" },
      });
      await act(async () => {
        fireEvent.submit(screen.getByPlaceholderText("Nombre de la película…").closest("form")!);
      });
      // findByText (con su polling real vía waitFor) se queda colgado
      // bajo fake timers — tras el act async de arriba, la actualización
      // ya se ha aplicado, así que basta con una comprobación síncrona.
      expect(screen.getByText("The Lighthouse")).toBeInTheDocument();

      // Si se hubiera reseteado como el timer por turno de Clásico,
      // volvería a mostrar 90 (o cerca) tras el turno superado — en vez
      // de eso, sigue contando la partida completa desde donde iba.
      await act(async () => {
        vi.advanceTimersByTime(10_000);
      });
      expect(screen.getAllByRole("timer")[0]).toHaveAccessibleName("70 segundos restantes");
    });

    it("Maratón: no muestra ningún temporizador y no se auto-envía timeout aunque pase mucho tiempo", async () => {
      vi.mocked(readActiveGameSession).mockReturnValue({
        gameId: "game-1",
        modo: "maraton",
        nodoActual: actorNode,
      });

      render(<PartidaPage />);
      expect(screen.queryByRole("timer")).not.toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(40_000);
      });

      // 40s supera el límite de turno de Clásico/Contrarreloj (25s) —
      // en Maratón no debe disparar ningún envío automático.
      expect(submitAnswer).not.toHaveBeenCalled();
      expect(screen.getByPlaceholderText("Nombre de la película…")).toBeInTheDocument();
    });
  });

  it("Maratón: si el servidor cerró la partida por inactividad, termina la partida en vez de mostrar el error genérico", async () => {
    vi.mocked(readActiveGameSession).mockReturnValue({
      gameId: "game-1",
      modo: "maraton",
      nodoActual: actorNode,
    });
    vi.mocked(submitAnswer).mockRejectedValue(new Error("La partida se cerró por inactividad."));
    vi.mocked(finishGame).mockResolvedValue({
      puntuacion_total: 0,
      nodos_alcanzados: 0,
      tiempo_total: 0,
      tiempo_medio_respuesta: 0,
    });

    render(<PartidaPage />);
    fireEvent.change(screen.getByPlaceholderText("Nombre de la película…"), {
      target: { value: "The Lighthouse" },
    });
    fireEvent.submit(screen.getByPlaceholderText("Nombre de la película…").closest("form")!);

    expect(await screen.findByText("Partida terminada")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
