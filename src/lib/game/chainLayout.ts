export type Point = { x: number; y: number };

// Rejilla de 3 columnas en serpentina ("S"): fila 0 izquierda→derecha,
// fila 1 derecha→izquierda, fila 2 izquierda→derecha... — coordenadas
// verificadas contra la screen "04 · Fin de partida" del handoff
// (mobile: columnas en x=45/175/305, filas en y=45/185/325 — un
// espaciado de 130px entre columnas y 140px entre filas).
const COLUMNS = 3;
const COLUMN_SPACING = 130;
const ROW_SPACING = 140;
const START_X = 45;
const START_Y = 45;
// Espacio para la etiqueta con el nombre debajo de cada nodo.
const CAPTION_SPACE = 40;

export type ChainLayout = {
  canvasWidth: number;
  canvasHeight: number;
  positions: Point[];
  /** `d` de un <path> SVG — cadena vacía si hay menos de 2 nodos (nada que unir). */
  pathD: string;
};

function anchorPoint(index: number): Point {
  const row = Math.floor(index / COLUMNS);
  const posInRow = index % COLUMNS;
  const col = row % 2 === 0 ? posInRow : COLUMNS - 1 - posInRow;
  return { x: START_X + col * COLUMN_SPACING, y: START_Y + row * ROW_SPACING };
}

/** Curva Catmull-Rom convertida a una cadena de bezier cúbicas — una
 * línea continua y suave por todos los puntos, sin ángulos rectos ni
 * huecos, válida para cualquier número de puntos (incluido 0 o 1). */
export function catmullRomPath(points: Point[]): string {
  if (points.length < 2) return "";

  let d = `M ${points[0]!.x},${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/** Calcula la disposición completa (lienzo + posiciones + curva) para
 * `count` nodos. Las posiciones son coordenadas de diseño "canónicas"
 * (mismas para mobile/desktop) — el consumidor las convierte a
 * porcentaje del lienzo para que escalen con el contenedor real. */
export function computeChainLayout(count: number): ChainLayout {
  if (count <= 0) {
    return { canvasWidth: 0, canvasHeight: 0, positions: [], pathD: "" };
  }

  const positions = Array.from({ length: count }, (_, index) => anchorPoint(index));
  const rows = Math.ceil(count / COLUMNS);
  const canvasWidth = START_X * 2 + (COLUMNS - 1) * COLUMN_SPACING;
  const canvasHeight = START_Y + (rows - 1) * ROW_SPACING + START_Y + CAPTION_SPACE;

  return { canvasWidth, canvasHeight, positions, pathD: catmullRomPath(positions) };
}
