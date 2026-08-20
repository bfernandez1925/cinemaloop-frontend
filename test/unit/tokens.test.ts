import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { colors, entityTypeColors, radii, typography } from "@/design/tokens";

// Tailwind v4 configura su tema en CSS (@theme en globals.css, ver
// ADR-0006), así que src/design/tokens.ts no puede importarse desde ahí
// como haríamos con un tailwind.config.ts en JS. Este test parsea el
// bloque @theme y verifica que cada valor coincide exactamente con su
// homólogo en tokens.ts, para que ambos no puedan divergir en silencio.
const CSS_PATH = path.resolve(import.meta.dirname, "../../src/app/globals.css");
const css = readFileSync(CSS_PATH, "utf-8");

function cssVar(name: string): string {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(css);
  if (!match) throw new Error(`Variable CSS --${name} no encontrada en globals.css`);
  return match[1].trim();
}

function camelToKebab(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

describe("sincronía de tokens.ts con el @theme de globals.css", () => {
  it.each(Object.entries(colors))("color.%s coincide con --color-%s", (key, value) => {
    // La casing del hexadecimal no es semánticamente relevante.
    expect(cssVar(`color-${camelToKebab(key)}`).toLowerCase()).toBe(value.toLowerCase());
  });

  it("los alias semánticos --color-type-actor/--color-type-movie apuntan a violeta/naranja", () => {
    expect(cssVar("color-type-actor")).toBe("var(--color-violet)");
    expect(cssVar("color-type-movie")).toBe("var(--color-orange)");
    expect(entityTypeColors.actor).toBe(colors.violet);
    expect(entityTypeColors.movie).toBe(colors.orange);
  });

  it("radii.cardMobile/cardDesktop/pill/image coinciden con --radius-card/-lg/-pill/-image", () => {
    expect(cssVar("radius-card")).toBe(radii.cardMobile);
    expect(cssVar("radius-card-lg")).toBe(radii.cardDesktop);
    expect(cssVar("radius-pill")).toBe(radii.pill);
    expect(cssVar("radius-image")).toBe(radii.image);
  });

  it.each([
    ["wordmark", "wordmark"],
    ["screenTitle", "screen-title"],
    ["cardTitle", "card-title"],
    ["scoreHero", "score-hero"],
    ["statNumber", "stat-number"],
  ] as const)("typography.%s (mobile/desktop) coincide con --text-%s(-lg)", (key, cssName) => {
    const token = typography[key];
    expect(cssVar(`text-${cssName}`)).toBe(token.mobile);
    expect(cssVar(`text-${cssName}-lg`)).toBe(token.desktop);
  });

  it.each([
    ["cardBody", "card-body"],
    ["leadParagraph", "lead-paragraph"],
  ] as const)("typography.%s (mobile/desktop) coincide con --text-%s(-lg)", (key, cssName) => {
    const token = typography[key];
    expect(cssVar(`text-${cssName}`)).toBe(token.mobile);
    expect(cssVar(`text-${cssName}-lg`)).toBe(token.desktop);
  });

  it("radii.control coincide con --radius-control", () => {
    expect(cssVar("radius-control")).toBe(radii.control);
  });

  it("typography.button coincide con --text-button", () => {
    expect(cssVar("text-button")).toBe(typography.button.size);
  });
});
