import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecordCards } from "@/components/RecordCards";

describe("RecordCards", () => {
  it("muestra las 3 tarjetas de récord con los agregados reales del perfil", () => {
    render(
      <RecordCards
        profile={{
          nombre_usuario: "Jugador Uno",
          mejor_puntuacion: 4860,
          cadena_mas_larga: 14,
          partidas_jugadas: 27,
        }}
      />,
    );

    expect(screen.getByText("4860")).toBeInTheDocument();
    expect(screen.getByText("mejor puntuación")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("cadena más larga")).toBeInTheDocument();
    expect(screen.getByText("27")).toBeInTheDocument();
    expect(screen.getByText("partidas jugadas")).toBeInTheDocument();
  });

  it("con un usuario sin partidas, muestra los 3 agregados a 0", () => {
    render(
      <RecordCards
        profile={{
          nombre_usuario: null,
          mejor_puntuacion: 0,
          cadena_mas_larga: 0,
          partidas_jugadas: 0,
        }}
      />,
    );

    expect(screen.getAllByText("0")).toHaveLength(3);
  });
});
