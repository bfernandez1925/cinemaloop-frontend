import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsedEntitiesList } from "@/components/UsedEntitiesList";
import type { GameNode } from "@/lib/game/types";

const movies: GameNode[] = [
  { tipo: "pelicula", entidad_tmdb_id: 1, nombre: "Spider-Man: NWH", imagen: null },
  { tipo: "pelicula", entidad_tmdb_id: 2, nombre: "The Lighthouse", imagen: null },
];

describe("UsedEntitiesList", () => {
  it("muestra el encabezado y un chip por cada entidad ya usada", () => {
    render(<UsedEntitiesList type="pelicula" entities={movies} />);

    expect(screen.getByText("Películas ya usadas · no se repiten")).toBeInTheDocument();
    expect(screen.getByText("Spider-Man: NWH")).toBeInTheDocument();
    expect(screen.getByText("The Lighthouse")).toBeInTheDocument();
  });

  it("con tipo actor usa el encabezado de actores/actrices", () => {
    render(
      <UsedEntitiesList
        type="actor"
        entities={[{ tipo: "actor", entidad_tmdb_id: 7, nombre: "Willem Dafoe", imagen: null }]}
      />,
    );

    expect(screen.getByText("Actores/actrices ya usados · no se repiten")).toBeInTheDocument();
  });

  it("no renderiza nada si no hay entidades usadas todavía", () => {
    const { container } = render(<UsedEntitiesList type="pelicula" entities={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
