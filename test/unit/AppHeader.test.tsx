import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth/AuthProvider";

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  signOut: vi.fn(),
}));

vi.mock("@/lib/auth/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

describe("AppHeader", () => {
  beforeEach(() => {
    vi.mocked(signOut).mockReset().mockResolvedValue(undefined);
  });

  it("muestra el nombre de la app y enlaza a /inicio", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });

    render(<AppHeader />);

    expect(screen.getByText("CinemaLoop")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/inicio");
  });

  it("con usuario autenticado, muestra su nombre y el botón de cerrar sesión (CIN-59)", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { displayName: "Ana" } as User,
      loading: false,
    });

    render(<AppHeader />);

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
  });

  it("sin displayName, muestra 'Jugador' como respaldo", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { displayName: null } as User,
      loading: false,
    });

    render(<AppHeader />);

    expect(screen.getByText("Jugador")).toBeInTheDocument();
  });

  it("pulsar cerrar sesión pide confirmación antes de ejecutar signOut", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { displayName: "Ana" } as User,
      loading: false,
    });

    render(<AppHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(screen.getByText("¿Cerrar sesión?")).toBeInTheDocument();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("cancelar el diálogo no cierra la sesión", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { displayName: "Ana" } as User,
      loading: false,
    });

    render(<AppHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByText("¿Cerrar sesión?")).not.toBeInTheDocument();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("confirmar cierra la sesión llamando a signOut", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { displayName: "Ana" } as User,
      loading: false,
    });

    render(<AppHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cerrar sesión" }));

    await waitFor(() => expect(signOut).toHaveBeenCalledOnce());
  });
});
