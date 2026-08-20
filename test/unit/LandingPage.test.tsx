import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LandingPage from "@/app/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  getAuth: vi.fn(() => ({})),
}));

describe("LandingPage", () => {
  it("muestra el wordmark y los dos botones de autenticación", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: "CinemaLoop" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeInTheDocument();
  });

  it('"Iniciar sesión" abre el modal en modo login (sin campo de nombre de usuario)', () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByLabelText("Nombre de usuario")).not.toBeInTheDocument();
  });

  it('"Crear cuenta" abre el modal en modo signup (con campo de nombre de usuario)', () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre de usuario")).toBeInTheDocument();
  });
});
