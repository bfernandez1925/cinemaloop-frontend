/**
 * Fuente única de verdad para los valores de diseño transcritos del
 * handoff (ver spec-design-fidelity.md). `globals.css` expone estos
 * mismos valores como propiedades CSS dentro de `@theme inline` — Tailwind
 * v4 usa CSS como mecanismo de configuración (no `tailwind.config.ts`,
 * ver ADR-0006), así que la sincronía entre este archivo y el CSS se
 * verifica con un test (`test/unit/tokens.test.ts`) en vez de una
 * importación directa. Ningún componente debe hardcodear estos valores:
 * o los consume vía las clases de Tailwind generadas (`bg-orange`,
 * `rounded-card`, `text-h2`...) o, si necesita el valor crudo en JS,
 * importa desde aquí.
 */

export const colors = {
  bgPrimary: "#0B0D12",
  surface: "#12151D",
  surfaceElevated: "#181C26",
  textPrimary: "#F2F2F2",
  textSecondary: "#B8BECC",
  textTertiary: "#9AA1B2",
  textMuted: "#7A8095",
  border: "#3A4152",
  borderSubtle: "#232733",
  divider: "#1E212B",

  orange: "#FF5A3C",
  orangeHover: "#FF7557",
  orangeActive: "#E64B2F",
  orangeDisabled: "rgba(255, 90, 60, 0.35)",
  // La spec documenta un rango de opacidad (0.12–0.18) para el fondo del
  // tint; se fija el punto medio como valor concreto de ingeniería.
  orangeTintBg: "rgba(255, 90, 60, 0.15)",
  orangeTintText: "#FF9478",

  violet: "#7B3CFF",
  violetHover: "#9463FF",
  violetActive: "#6529E6",
  violetDisabled: "rgba(123, 60, 255, 0.35)",
  violetTintBg: "rgba(123, 60, 255, 0.15)",
  violetTintText: "#A78BFA",
  // La spec da dos valores para el texto sobre tint violeta
  // ("#A78BFA / #D9CFFF"); el segundo es la variante de mayor énfasis.
  violetTintTextStrong: "#D9CFFF",
} as const;

/** Violeta = actor, naranja = película — nunca hardcodeado por componente. */
export const entityTypeColors = {
  actor: colors.violet,
  movie: colors.orange,
} as const;

export const typography = {
  families: {
    // EB Garamond (500/600/700) — wordmark, h1-h3, números de score/stats.
    display: "display",
    // Inter Tight (400-800) — resto de la UI. Pesos cargados en layout.tsx (CIN-38).
    sans: "sans",
  },
  // Escala observada en el handoff (spec-design-fidelity.md). Los pares
  // {mobile, desktop} son los dos breakpoints del handoff (390px/1280px);
  // los pares {min, max} son variación dentro de un mismo breakpoint,
  // a precisar por componente en la comparación visual de CIN-48.
  wordmark: { mobile: "36px", desktop: "52px", weight: 500, family: "display" },
  h2: { min: "20px", max: "30px", weight: 600, family: "display" },
  h3: { min: "17px", max: "21px", weight: 600, family: "display" },
  scoreHero: {
    mobile: "46px",
    desktop: "80px",
    weight: 700,
    family: "display",
    gradient: "linear-gradient(135deg, #FF5A3C, #7B3CFF)",
  },
  body: { min: "14px", max: "17px", weight: 400, family: "sans" },
  meta: { min: "9.5px", max: "13px", weight: 400, family: "sans" },
  badge: {
    min: "10px",
    max: "13px",
    weight: 700,
    family: "sans",
    uppercase: true,
    letterSpacing: { min: "0.05em", max: "0.08em" },
  },
} as const;

export const radii = {
  // Tarjeta: 14-20px en mobile, 16-28px en frames desktop (spec).
  cardMobile: "14px",
  cardDesktop: "16px",
  // Pills/badges: la spec exige "completamente redondeado (≥20px)". Se usa
  // un valor mayor que cualquier medio-alto real para garantizar el pill
  // shape independientemente de la altura concreta del componente.
  pill: "9999px",
  // Imagen (actor/póster): ~26% del lado corto — nunca esquina recta, nunca circular.
  image: "26%",
} as const;

/** Gaps estándar del sistema — ya cubiertos por la escala de espaciado por
 * defecto de Tailwind (4px de base: 8=2, 10=2.5, 12=3, 16=4, 24=6, 32=8,
 * 36=9), documentados aquí solo como referencia, sin tokens CSS propios. */
export const spacingScale = ["8px", "10px", "12px", "16px", "24px", "32px", "36px"] as const;
