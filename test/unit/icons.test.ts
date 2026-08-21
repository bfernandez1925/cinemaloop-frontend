import { describe, expect, it } from "vitest";
import { ICONS } from "@/design/icons";

describe("ICONS", () => {
  it("mapea 1:1 los nombres semánticos del handoff a un icono de Lucide", () => {
    expect(Object.keys(ICONS).sort()).toEqual(
      [
        "actor",
        "aiCorrection",
        "arrow",
        "back",
        "clock",
        "close",
        "gameModes",
        "hidePassword",
        "historial",
        "lock",
        "logout",
        "mic",
        "modeClasico",
        "modeContrarreloj",
        "modeInfantil",
        "modeMaraton",
        "movie",
        "nodeCount",
        "ranking",
        "save",
        "search",
        "showPassword",
      ].sort(),
    );
  });

  it("no incluye un icono de librería para el anillo de temporizador (es un SVG custom, ver CIN-40)", () => {
    expect(Object.keys(ICONS)).not.toContain("timer");
    expect(Object.keys(ICONS)).not.toContain("timerRing");
  });

  it("no incluye un icono para descartar (el handoff usa solo texto)", () => {
    expect(Object.keys(ICONS)).not.toContain("discard");
  });
});
