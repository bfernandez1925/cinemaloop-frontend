import { ICONS } from "@/design/icons";

/** Pills de progreso: nº de nodos alcanzados (violeta) y puntuación
 * actual (naranja) — verificado en la screen 03a/03b. El icono del pill
 * de puntuación no está en la tabla de spec-design-fidelity.md (el
 * glifo del handoff no es un icono estándar reconocible); se usa
 * ICONS.ranking (trofeo) por ser el sustituto semántico más razonable
 * para "puntuación". */
export function GameBadges({ nodeCount, score }: { nodeCount: number; score: number }) {
  const NodeIcon = ICONS.nodeCount;
  const ScoreIcon = ICONS.ranking;

  return (
    <div className="flex items-center gap-2.5 lg:gap-4">
      <span className="border-violet bg-surface flex items-center gap-1.5 rounded-pill border-[1.5px] px-[15px] py-2 lg:gap-2 lg:px-[18px] lg:py-2.5">
        <NodeIcon
          className="text-violet-tint-text h-[15px] w-[15px] lg:h-[18px] lg:w-[18px]"
          strokeWidth={2}
        />
        <span className="font-display text-badge-number lg:text-badge-number-lg text-violet-tint-text">
          {nodeCount}
        </span>
      </span>
      <span className="border-orange bg-surface flex items-center gap-1.5 rounded-pill border-[1.5px] px-4 py-2 lg:gap-2 lg:px-[18px] lg:py-2.5">
        <ScoreIcon className="text-orange h-4 w-4 lg:h-[18px] lg:w-[18px]" strokeWidth={1.8} />
        <span className="font-display text-badge-number lg:text-badge-number-lg text-orange">
          {score}
        </span>
      </span>
    </div>
  );
}
