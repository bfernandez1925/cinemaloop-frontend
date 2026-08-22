import { render, screen } from "@testing-library/react";
import type { User } from "firebase/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth/AuthProvider";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/lib/auth/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("no renderiza el contenido protegido ni redirige mientras loading es true", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true });

    render(
      <RequireAuth>
        <p>Contenido protegido</p>
      </RequireAuth>,
    );

    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirige a / si no hay usuario autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });

    render(
      <RequireAuth>
        <p>Contenido protegido</p>
      </RequireAuth>,
    );

    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("renderiza el contenido protegido si hay usuario autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({ user: { uid: "user-1" } as User, loading: false });

    render(
      <RequireAuth>
        <p>Contenido protegido</p>
      </RequireAuth>,
    );

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("con usuario autenticado, muestra siempre la cabecera con el logo (CIN-57)", () => {
    vi.mocked(useAuth).mockReturnValue({ user: { uid: "user-1" } as User, loading: false });

    render(
      <RequireAuth>
        <p>Contenido protegido</p>
      </RequireAuth>,
    );

    expect(screen.getByText("CinemaLoop")).toBeInTheDocument();
  });
});
