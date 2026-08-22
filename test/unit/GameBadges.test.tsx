import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GameBadges } from "@/components/GameBadges";

describe("GameBadges", () => {
  it("muestra el número de nodos y la puntuación actual", () => {
    render(<GameBadges nodeCount={5} score={1240} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("1240")).toBeInTheDocument();
  });
});
