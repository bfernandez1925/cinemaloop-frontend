import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NodeCard } from "@/components/NodeCard";
import type { ActorNode, PoolEntity } from "@/lib/game/types";

const actor: ActorNode = {
  tipo: "actor",
  entidad_tmdb_id: 7,
  nombre: "Willem Dafoe",
  imagen: "/willem.jpg",
  pais_origen: "Estados Unidos",
  anio_nacimiento: 1955,
};

const movie: PoolEntity = {
  tipo: "pelicula",
  entidad_tmdb_id: 100,
  nombre: "The Lighthouse",
  imagen: "/lighthouse.jpg",
};

describe("NodeCard", () => {
  it("actor: muestra el badge Actor, el nombre y país · año de nacimiento", () => {
    render(<NodeCard node={actor} />);

    expect(screen.getByText("Actor")).toBeInTheDocument();
    expect(screen.getByText("Willem Dafoe")).toBeInTheDocument();
    expect(screen.getByText("Estados Unidos · 1955")).toBeInTheDocument();
  });

  it("película: muestra el badge Película, el nombre y no muestra país/año", () => {
    render(<NodeCard node={movie} />);

    expect(screen.getByText("Película")).toBeInTheDocument();
    expect(screen.getByText("The Lighthouse")).toBeInTheDocument();
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });
});
