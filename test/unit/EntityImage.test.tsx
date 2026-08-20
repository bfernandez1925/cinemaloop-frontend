import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EntityImage } from "@/components/EntityImage";

describe("EntityImage", () => {
  it("actor: se muestra 1:1 (ancho == alto)", () => {
    const { container } = render(
      <EntityImage path="/x.jpg" type="actor" alt="Willem Dafoe" size={100} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe("100px");
    expect(wrapper.style.height).toBe("100px");
  });

  it("película: se muestra 2:3 vertical (alto == 1.5x ancho)", () => {
    const { container } = render(
      <EntityImage path="/x.jpg" type="movie" alt="The Lighthouse" size={100} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe("100px");
    expect(wrapper.style.height).toBe("150px");
  });

  it("usa siempre esquinas redondeadas, nunca circulares", () => {
    const { container } = render(
      <EntityImage path="/x.jpg" type="actor" alt="Willem Dafoe" size={100} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass("rounded-image");
    expect(wrapper.className).not.toMatch(/rounded-full/);
  });

  it("muestra un estado de carga (icono placeholder) antes de que la imagen cargue", () => {
    render(<EntityImage path="/x.jpg" type="actor" alt="Willem Dafoe" size={100} />);

    const img = screen.getByRole("img", { hidden: true }) as HTMLImageElement;
    expect(img).toHaveClass("opacity-0");
  });

  it("oculta el placeholder y muestra la imagen una vez carga", () => {
    render(<EntityImage path="/x.jpg" type="actor" alt="Willem Dafoe" size={100} />);

    const img = screen.getByRole("img", { hidden: true }) as HTMLImageElement;
    fireEvent.load(img);

    expect(img).toHaveClass("opacity-100");
  });

  it("cae al icono de respaldo si la imagen de TMDb falla al cargar", () => {
    render(<EntityImage path="/x.jpg" type="movie" alt="The Lighthouse" size={100} />);

    const img = screen.getByRole("img", { hidden: true }) as HTMLImageElement;
    fireEvent.error(img);

    expect(screen.getByRole("img", { name: "The Lighthouse" })).toBeInTheDocument();
  });

  it("sin path, muestra directamente el icono de respaldo sin intentar cargar nada", () => {
    const { container } = render(
      <EntityImage path={null} type="actor" alt="Sin foto" size={100} />,
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Sin foto" })).toBeInTheDocument();
  });

  it("construye la URL de TMDb según el tipo de entidad", () => {
    render(<EntityImage path="/abc.jpg" type="actor" alt="Willem Dafoe" size={100} />);

    const img = screen.getByRole("img", { hidden: true }) as HTMLImageElement;
    expect(img.src).toBe("https://image.tmdb.org/t/p/w185/abc.jpg");
  });
});
