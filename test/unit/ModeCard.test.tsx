import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModeCard } from "@/components/ModeCard";
import { ICONS } from "@/design/icons";

const description = { mobile: "Copy mobile.", desktop: "Copy desktop." };

describe("ModeCard", () => {
  it("la variante primary está habilitada y muestra el badge indicado", () => {
    render(
      <ModeCard
        icon={ICONS.modeClasico}
        title="Clásico"
        description={description}
        variant="primary"
        badge="Popular"
      />,
    );

    const button = screen.getByRole("button", { name: /clásico/i });
    expect(button).toBeEnabled();
    expect(screen.getByText("Popular")).toBeInTheDocument();
    expect(screen.queryByText("Próximamente")).not.toBeInTheDocument();
  });

  it("la variante primary sin badge no muestra ningún pill (CIN-62: Contrarreloj/Maratón sin badge propio)", () => {
    render(
      <ModeCard
        icon={ICONS.modeContrarreloj}
        title="Contrarreloj"
        description={description}
        variant="primary"
      />,
    );

    expect(screen.queryByText("Popular")).not.toBeInTheDocument();
    expect(screen.queryByText("Próximamente")).not.toBeInTheDocument();
  });

  it("con disabled (otra tarjeta cargando), se deshabilita sin cambiar el badge", () => {
    render(
      <ModeCard
        icon={ICONS.modeClasico}
        title="Clásico"
        description={description}
        variant="primary"
        badge="Popular"
        disabled
      />,
    );

    expect(screen.getByRole("button", { name: /clásico/i })).toBeDisabled();
    expect(screen.getByText("Popular")).toBeInTheDocument();
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

  it("al pulsarla llama a onClick", () => {
    const onClick = vi.fn();
    render(
      <ModeCard
        icon={ICONS.modeClasico}
        title="Clásico"
        description={description}
        variant="primary"
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /clásico/i }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("con loading, se deshabilita y muestra Un momento… en vez de Popular", () => {
    render(
      <ModeCard
        icon={ICONS.modeClasico}
        title="Clásico"
        description={description}
        variant="primary"
        badge="Popular"
        loading
      />,
    );

    expect(screen.getByRole("button", { name: /clásico/i })).toBeDisabled();
    expect(screen.getByText("Un momento…")).toBeInTheDocument();
    expect(screen.queryByText("Popular")).not.toBeInTheDocument();
  });
});
