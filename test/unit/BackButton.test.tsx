import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BackButton } from "@/components/BackButton";

describe("BackButton", () => {
  it("enlaza al href recibido con una etiqueta accesible", () => {
    render(<BackButton href="/" />);

    const link = screen.getByRole("link", { name: "Volver" });
    expect(link).toHaveAttribute("href", "/");
  });
});
