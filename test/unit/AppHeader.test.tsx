import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppHeader } from "@/components/AppHeader";

describe("AppHeader", () => {
  it("muestra el nombre de la app y enlaza a /inicio", () => {
    render(<AppHeader />);

    expect(screen.getByText("CinemaLoop")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/inicio");
  });
});
