import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage from "@/app/page";
import { useAuth } from "@/lib/auth/AuthProvider";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  getAuth: vi.fn(() => ({})),
}));

vi.mock("@/lib/auth/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

describe("LandingPage", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });
  });

  it("con sesión activa, no muestra la landing y redirige a /inicio (CIN-50)", () => {
    vi.mocked(useAuth).mockReturnValue({ user: { uid: "user-1" } as never, loading: false });

    render(<LandingPage />);

    expect(screen.queryByRole("heading", { name: "CinemaLoop" })).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/inicio");
  });

  it("mientras Firebase Auth no ha resuelto el estado, no muestra la landing", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true });

    render(<LandingPage />);

    expect(screen.queryByRole("heading", { name: "CinemaLoop" })).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("muestra el wordmark y los botones de autenticación (hero + CTA final)", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: "CinemaLoop" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Iniciar sesión" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Crear cuenta" }).length).toBeGreaterThan(0);
  });

  it('"Iniciar sesión" abre el modal en modo login (sin campo de nombre de usuario)', () => {
    render(<LandingPage />);

    fireEvent.click(screen.getAllByRole("button", { name: "Iniciar sesión" })[0]!);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByLabelText("Nombre de usuario")).not.toBeInTheDocument();
  });

  it('"Crear cuenta" abre el modal en modo signup (con campo de nombre de usuario)', () => {
    render(<LandingPage />);

    fireEvent.click(screen.getAllByRole("button", { name: "Crear cuenta" })[0]!);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre de usuario")).toBeInTheDocument();
  });

  it('nombra siempre actor y actriz juntos, nunca "actor" en solitario (CIN-51)', () => {
    const { container } = render(<LandingPage />);
    const text = (container.textContent ?? "").toLowerCase();

    // Cada mención de "actor" en la copy va acompañada de "actriz" (mismo
    // "renglón" de contenido) — no hay ninguna mención aislada.
    const actorMatches = text.match(/actor(?!iz)\w*/g) ?? [];
    expect(actorMatches.length).toBeGreaterThan(0);
    expect(text).toContain("actriz");
    expect(text.match(/actriz\w*/g)?.length).toBeGreaterThanOrEqual(1);
  });
});
