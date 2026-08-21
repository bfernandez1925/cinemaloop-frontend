import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AmbiguityDialog } from "@/components/AmbiguityDialog";

const candidatos = [
  { tipo: "pelicula" as const, entidad_tmdb_id: 400, nombre: "Candidato A", imagen: null },
  { tipo: "pelicula" as const, entidad_tmdb_id: 401, nombre: "Candidato B", imagen: null },
];

describe("AmbiguityDialog", () => {
  it("muestra cada candidato con su nombre", () => {
    render(
      <AmbiguityDialog
        expectedType="pelicula"
        candidatos={candidatos}
        selecting={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Candidato A")).toBeInTheDocument();
    expect(screen.getByText("Candidato B")).toBeInTheDocument();
  });

  it("pulsar un candidato llama a onSelect con ese candidato", () => {
    const onSelect = vi.fn();
    render(
      <AmbiguityDialog
        expectedType="pelicula"
        candidatos={candidatos}
        selecting={false}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByText("Candidato B"));

    expect(onSelect).toHaveBeenCalledWith(candidatos[1]);
  });

  it("con selecting=true, los botones están deshabilitados", () => {
    render(
      <AmbiguityDialog
        expectedType="pelicula"
        candidatos={candidatos}
        selecting={true}
        onSelect={vi.fn()}
      />,
    );

    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });
});
