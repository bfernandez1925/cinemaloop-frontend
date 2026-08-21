import { fireEvent, render, screen } from "@testing-library/react";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { describe, expect, it, vi } from "vitest";
import { AuthModal } from "@/components/AuthModal";
import { updateUsername } from "@/lib/auth/api";

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  getAuth: vi.fn(() => ({})),
}));

vi.mock("@/lib/auth/api", () => ({
  updateUsername: vi.fn(),
}));

function fillAndSubmit({ username }: { username?: string } = {}) {
  if (username !== undefined) {
    fireEvent.change(screen.getByLabelText("Nombre de usuario"), { target: { value: username } });
  }
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "supersecreto" } });
  fireEvent.click(screen.getByRole("button", { name: /iniciar sesión|crear cuenta/i }));
}

describe("AuthModal", () => {
  it("modo login: llama a signInWithEmailAndPassword y a onSuccess si resuelve", async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as never);
    const onSuccess = vi.fn();

    render(<AuthModal initialMode="login" onClose={vi.fn()} onSuccess={onSuccess} />);
    fillAndSubmit();

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "user@example.com",
      "supersecreto",
    );
  });

  it("modo signup: crea la cuenta y actualiza el displayName con el nombre de usuario", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: { uid: "user-1" },
    } as never);
    vi.mocked(updateProfile).mockResolvedValue(undefined as never);
    const onSuccess = vi.fn();

    render(<AuthModal initialMode="signup" onClose={vi.fn()} onSuccess={onSuccess} />);
    fillAndSubmit({ username: "borja" });

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(updateProfile).toHaveBeenCalledWith({ uid: "user-1" }, { displayName: "borja" });
  });

  it("modo signup: llama a updateUsername tras updateProfile, para no depender de la carrera con onUserCreated (CIN-64)", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: { uid: "user-1" },
    } as never);
    vi.mocked(updateProfile).mockResolvedValue(undefined as never);
    vi.mocked(updateUsername).mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    render(<AuthModal initialMode="signup" onClose={vi.fn()} onSuccess={onSuccess} />);
    fillAndSubmit({ username: "borja" });

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(updateUsername).toHaveBeenCalledWith("borja");
  });

  it("muestra el mensaje de error mapeado cuando Firebase Auth rechaza el login", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
      new FirebaseError("auth/invalid-credential", "interno"),
    );

    render(<AuthModal initialMode="login" onClose={vi.fn()} onSuccess={vi.fn()} />);
    fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent("Email o contraseña incorrectos.");
  });

  it("muestra el mensaje de error mapeado cuando el email ya está en uso al crear cuenta", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(
      new FirebaseError("auth/email-already-in-use", "interno"),
    );

    render(<AuthModal initialMode="signup" onClose={vi.fn()} onSuccess={vi.fn()} />);
    fillAndSubmit({ username: "borja" });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ya existe una cuenta con ese email.",
    );
  });

  it("el botón de ojo alterna la visibilidad de la contraseña (CIN-65)", () => {
    render(<AuthModal initialMode="login" onClose={vi.fn()} onSuccess={vi.fn()} />);

    const passwordInput = screen.getByLabelText("Contraseña");
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("alterna entre login y signup y llama a onClose al pulsar la X", () => {
    const onClose = vi.fn();
    render(<AuthModal initialMode="login" onClose={onClose} onSuccess={vi.fn()} />);

    fireEvent.click(screen.getByText("¿No tienes cuenta? Crear una"));
    expect(screen.getByLabelText("Nombre de usuario")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });
});
