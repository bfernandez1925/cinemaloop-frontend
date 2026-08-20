import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChainVisualization } from "@/components/ChainVisualization";
import type { GameNode } from "@/lib/game/types";

const chain: GameNode[] = [
  { tipo: "actor", entidad_tmdb_id: 7, nombre: "Willem Dafoe", imagen: null },
  { tipo: "pelicula", entidad_tmdb_id: 100, nombre: "The Lighthouse", imagen: null },
  { tipo: "actor", entidad_tmdb_id: 8, nombre: "Tom Holland", imagen: null },
];

describe("ChainVisualization", () => {
  it("con cadena vacía, no renderiza nada", () => {
    const { container } = render(<ChainVisualization chain={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el encabezado con el número de nodos (plural)", () => {
    render(<ChainVisualization chain={chain} />);

    expect(screen.getByText("Cadena completa · 3 nodos")).toBeInTheDocument();
  });

  it("con un solo nodo, usa el singular y no dibuja curva", () => {
    const { container } = render(<ChainVisualization chain={[chain[0]!]} />);

    expect(screen.getByText("Cadena completa · 1 nodo")).toBeInTheDocument();
    const path = container.querySelector("path");
    expect(path?.getAttribute("d")).toBe("");
  });

  it("renderiza un nodo por cada entidad de la cadena, con su nombre", () => {
    render(<ChainVisualization chain={chain} />);

    expect(screen.getAllByText("Willem Dafoe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("The Lighthouse").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tom Holland").length).toBeGreaterThan(0);
  });

  it("dibuja una curva continua (path con segmentos C) cuando hay más de un nodo", () => {
    const { container } = render(<ChainVisualization chain={chain} />);

    const path = container.querySelector("path");
    expect(path?.getAttribute("d")).toMatch(/^M .+C /);
  });

  it("solo el último nodo lleva el halo distintivo", () => {
    render(<ChainVisualization chain={chain} />);

    const lastNodeName = screen.getAllByText("Tom Holland")[0]!;
    const lastNodeWrapper = lastNodeName.previousElementSibling;
    expect(lastNodeWrapper?.querySelector("div")?.className).toMatch(/shadow-/);

    const firstNodeName = screen.getAllByText("Willem Dafoe")[0]!;
    const firstNodeWrapper = firstNodeName.previousElementSibling;
    expect(firstNodeWrapper?.querySelector("div")?.className).not.toMatch(/shadow-/);
  });
});
