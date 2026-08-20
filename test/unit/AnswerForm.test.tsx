import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnswerForm } from "@/components/AnswerForm";

describe("AnswerForm", () => {
  it("el input no tiene autocompletado ni sugerencias en ningún caso", () => {
    render(<AnswerForm expectedType="pelicula" submitting={false} onSubmit={vi.fn()} />);

    const input = screen.getByPlaceholderText("Nombre de la película…");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("autocapitalize", "off");
    expect(input).toHaveAttribute("spellcheck", "false");
  });

  it("al enviar, llama a onSubmit con el texto recortado y limpia el input", () => {
    const onSubmit = vi.fn();
    render(<AnswerForm expectedType="pelicula" submitting={false} onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("Nombre de la película…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  The Lighthouse  " } });
    fireEvent.submit(input.closest("form")!);

    expect(onSubmit).toHaveBeenCalledWith("The Lighthouse");
    expect(input.value).toBe("");
  });

  it("no envía si el input está vacío o solo tiene espacios", () => {
    const onSubmit = vi.fn();
    render(<AnswerForm expectedType="actor" submitting={false} onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("Nombre del actor o actriz…");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(input.closest("form")!);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra "Comprobando…" mientras submitting es true, y deshabilita el input', () => {
    render(<AnswerForm expectedType="actor" submitting={true} onSubmit={vi.fn()} />);

    expect(screen.getByText("Comprobando…")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre del actor o actriz…")).toBeDisabled();
  });

  it("el botón de micrófono está siempre deshabilitado (voz llega en fase 3)", () => {
    render(<AnswerForm expectedType="actor" submitting={false} onSubmit={vi.fn()} />);

    expect(screen.getByRole("button", { name: /entrada por voz/i })).toBeDisabled();
  });
});
