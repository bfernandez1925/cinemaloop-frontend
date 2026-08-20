import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModeCard } from "@/components/ModeCard";
import { ICONS } from "@/design/icons";

const description = { mobile: "Copy mobile.", desktop: "Copy desktop." };

describe("ModeCard", () => {
  it("la variante primary está habilitada y muestra la insignia Popular", () => {
    render(
      <ModeCard
        icon={ICONS.modeClasico}
        title="Clásico"
        description={description}
        variant="primary"
      />,
    );

    const button = screen.getByRole("button", { name: /clásico/i });
    expect(button).toBeEnabled();
    expect(screen.getByText("Popular")).toBeInTheDocument();
    expect(screen.queryByText("Próximamente")).not.toBeInTheDocument();
  });

  it("la variante comingSoon está deshabilitada y muestra la insignia Próximamente", () => {
    render(
      <ModeCard
        icon={ICONS.modeContrarreloj}
        title="Contrarreloj"
        description={description}
        variant="comingSoon"
      />,
    );

    const button = screen.getByRole("button", { name: /contrarreloj/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Próximamente")).toBeInTheDocument();
    expect(screen.queryByText("Popular")).not.toBeInTheDocument();
  });

  it("renderiza tanto la copy de mobile como la de desktop (difieren, no es un acortamiento responsive)", () => {
    render(
      <ModeCard
        icon={ICONS.modeClasico}
        title="Clásico"
        description={description}
        variant="primary"
      />,
    );

    expect(screen.getByText(description.mobile)).toBeInTheDocument();
    expect(screen.getByText(description.desktop)).toBeInTheDocument();
  });
});
