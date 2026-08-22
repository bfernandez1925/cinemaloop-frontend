import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DirectionIndicator } from "@/components/DirectionIndicator";

describe("DirectionIndicator", () => {
  it("actor → pide una película", () => {
    render(<DirectionIndicator currentType="actor" />);

    expect(screen.getByText("Actor")).toBeInTheDocument();
    expect(screen.getByText("Escribe una película")).toBeInTheDocument();
  });

  it("película → pide un actor o actriz", () => {
    render(<DirectionIndicator currentType="pelicula" />);

    expect(screen.getByText("Película")).toBeInTheDocument();
    expect(screen.getByText("Escribe un actor o actriz")).toBeInTheDocument();
  });
});
