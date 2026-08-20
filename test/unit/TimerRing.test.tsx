import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TimerRing } from "@/components/TimerRing";

function progressCircle(container: HTMLElement) {
  return container.querySelectorAll("circle")[1]!;
}

describe("TimerRing", () => {
  it("por encima del 30% restante se pinta violeta, no naranja", () => {
    const { container } = render(<TimerRing remainingSeconds={15} totalSeconds={25} />);

    expect(progressCircle(container)).toHaveClass("text-violet");
    expect(progressCircle(container)).not.toHaveClass("text-orange");
  });

  it("en el último 30% del turno pasa a naranja", () => {
    // 7s de 25s = 28% restante, dentro del último 30%.
    const { container } = render(<TimerRing remainingSeconds={7} totalSeconds={25} />);

    expect(progressCircle(container)).toHaveClass("text-orange");
    expect(progressCircle(container)).not.toHaveClass("text-violet");
  });

  it("el límite exacto del 30% ya cuenta como urgente", () => {
    const { container } = render(<TimerRing remainingSeconds={7.5} totalSeconds={25} />);

    expect(progressCircle(container)).toHaveClass("text-orange");
  });

  it("el número mostrado es el techo de los segundos restantes", () => {
    render(<TimerRing remainingSeconds={4.2} totalSeconds={25} />);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("nunca muestra un número negativo aunque remainingSeconds sea negativo", () => {
    render(<TimerRing remainingSeconds={-3} totalSeconds={25} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("stroke-dashoffset del anillo de progreso refleja la fracción de tiempo transcurrido", () => {
    // La mitad del tiempo restante (12.5 de 25s) deja visible medio anillo:
    // dashoffset = 264 * (1 - 0.5) = 132.
    const { container } = render(<TimerRing remainingSeconds={12.5} totalSeconds={25} />);

    expect(progressCircle(container).getAttribute("stroke-dashoffset")).toBe("132");
  });

  it('expone role="timer" con una etiqueta accesible de los segundos restantes', () => {
    render(<TimerRing remainingSeconds={10} totalSeconds={25} />);

    expect(screen.getByRole("timer", { name: "10 segundos restantes" })).toBeInTheDocument();
  });
});
