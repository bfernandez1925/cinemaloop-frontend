// "18 ago 2026" — verificado contra la screen "06 · Mis partidas" del
// handoff (sin punto tras el mes, a diferencia de otros formatos cortos
// en es-ES).
const FORMATTER = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatFecha(iso: string): string {
  return FORMATTER.format(new Date(iso));
}
