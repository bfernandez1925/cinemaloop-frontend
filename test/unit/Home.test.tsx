import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

// Plantilla de test de componente: renderiza con React Testing Library,
// sin navegador real. Los tests de las pantallas de juego llegan con su
// propia issue (selección de modo: CIN-39; pantalla de partida: CIN-41).
describe("Home", () => {
  it("muestra el título Cinemaloop", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Cinemaloop" })).toBeInTheDocument();
  });
});
