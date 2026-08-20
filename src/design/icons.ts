import {
  ArrowRight,
  ChevronLeft,
  Clapperboard,
  Clock,
  Gamepad2,
  History,
  Infinity as InfinityIcon,
  Link as LinkIcon,
  Mic,
  Save,
  Search,
  Sparkles,
  Trophy,
  User,
  X,
  Zap,
} from "lucide-react";

/**
 * Mapeo 1:1 de los SVG dibujados a mano del handoff a iconos de Lucide
 * (ver tabla de iconos en spec-design-fidelity.md). Los componentes
 * importan desde aquí, no directamente desde "lucide-react", para que
 * el mapeo quede centralizado y sea fácil auditar contra la spec.
 *
 * Dos casos deliberadamente fuera de este mapeo:
 * - "Descartar" no lleva icono en el handoff, solo texto.
 * - El anillo de temporizador es un componente SVG custom (CIN-40),
 *   nunca un icono de librería.
 *
 * `modeClasico`/`modeContrarreloj`/`modeMaraton` (screen "Selección de
 * modo", CIN-39) no están en la tabla de spec-design-fidelity.md — son
 * glifos propios del handoff sin fila dedicada; se eligen los Lucide más
 * cercanos semánticamente (reloj, rayo, infinito).
 *
 * `clock`/`aiCorrection`/`gameModes` (secciones "Cómo se juega"/"Por qué
 * jugar" de la landing, CIN-51) tampoco están en la spec — esas secciones
 * son contenido comercial inventado, sin frame de handoff.
 */
export const ICONS = {
  back: ChevronLeft,
  close: X,
  search: Search,
  actor: User,
  movie: Clapperboard,
  ranking: Trophy,
  mic: Mic,
  nodeCount: LinkIcon,
  arrow: ArrowRight,
  save: Save,
  historial: History,
  modeClasico: Clock,
  modeContrarreloj: Zap,
  modeMaraton: InfinityIcon,
  clock: Clock,
  aiCorrection: Sparkles,
  gameModes: Gamepad2,
} as const;

export type IconName = keyof typeof ICONS;
