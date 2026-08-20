import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "@/components/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("muestra el título, la descripción y llama a onConfirm/onClose", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        title="¿Terminar la partida?"
        description="Tu puntuación se guardará."
        confirmLabel="Terminar partida"
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    expect(screen.getByText("¿Terminar la partida?")).toBeInTheDocument();
    expect(screen.getByText("Tu puntuación se guardará.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Terminar partida" }));
    expect(onConfirm).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("con confirming, deshabilita ambos botones y cambia la etiqueta de confirmar", () => {
    render(
      <ConfirmDialog
        title="t"
        description="d"
        confirmLabel="Confirmar"
        confirming
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Un momento…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });
});
