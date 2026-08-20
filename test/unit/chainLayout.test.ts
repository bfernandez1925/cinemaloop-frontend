import { describe, expect, it } from "vitest";
import { catmullRomPath, computeChainLayout } from "@/lib/game/chainLayout";

describe("computeChainLayout", () => {
  it("con 0 nodos, no hay nada que dibujar", () => {
    const layout = computeChainLayout(0);

    expect(layout.positions).toEqual([]);
    expect(layout.pathD).toBe("");
  });

  it("con 1 nodo, coloca el nodo pero no dibuja curva (nada que unir)", () => {
    const layout = computeChainLayout(1);

    expect(layout.positions).toEqual([{ x: 45, y: 45 }]);
    expect(layout.pathD).toBe("");
  });

  it("con 9 nodos, reproduce exactamente la rejilla en serpentina 3×3 del handoff", () => {
    const layout = computeChainLayout(9);

    expect(layout.positions).toEqual([
      { x: 45, y: 45 },
      { x: 175, y: 45 },
      { x: 305, y: 45 },
      { x: 305, y: 185 },
      { x: 175, y: 185 },
      { x: 45, y: 185 },
      { x: 45, y: 325 },
      { x: 175, y: 325 },
      { x: 305, y: 325 },
    ]);
  });

  it("la cuarta fila (nodo 10, índice 9) sigue la serpentina: fila impar → empieza a la derecha", () => {
    const layout = computeChainLayout(10);

    expect(layout.positions[9]).toEqual({ x: 305, y: 465 });
  });

  it("el lienzo crece con el número de filas, no con el número exacto de nodos", () => {
    const threeRows = computeChainLayout(9);
    const fourRows = computeChainLayout(10);

    expect(fourRows.canvasHeight).toBeGreaterThan(threeRows.canvasHeight);
    // 4 y 5 nodos caben en las mismas 2 filas → mismo alto.
    expect(computeChainLayout(4).canvasHeight).toBe(computeChainLayout(5).canvasHeight);
  });

  it("el ancho del lienzo es siempre el mismo (3 columnas fijas)", () => {
    expect(computeChainLayout(1).canvasWidth).toBe(computeChainLayout(20).canvasWidth);
  });
});

describe("catmullRomPath", () => {
  it("con menos de 2 puntos, no hay curva", () => {
    expect(catmullRomPath([])).toBe("");
    expect(catmullRomPath([{ x: 0, y: 0 }])).toBe("");
  });

  it("empieza en el primer punto y tiene un segmento C por cada tramo", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    const path = catmullRomPath(points);

    expect(path.startsWith("M 0,0")).toBe(true);
    expect(path.match(/C /g)).toHaveLength(2);
    // Termina exactamente en el último punto.
    expect(path.endsWith("10,10")).toBe(true);
  });
});
