import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/components/Avatar";

describe("Avatar", () => {
  it("muestra la inicial en mayúscula del nombre de usuario", () => {
    render(<Avatar nombre="marta" size={34} />);

    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("sin nombre de usuario, muestra un signo de interrogación", () => {
    render(<Avatar nombre={null} size={34} />);

    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
