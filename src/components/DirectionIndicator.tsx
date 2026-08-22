import { ICONS } from "@/design/icons";
import type { NodeType } from "@/lib/game/types";

const PROMPT = {
  actor: {
    label: "Actor",
    mobile: "Escribe un actor o actriz",
    desktop: "Escribe un actor o actriz que participó",
  },
  pelicula: {
    label: "Película",
    mobile: "Escribe una película",
    desktop: "Escribe una película en la que actuó",
  },
} as const satisfies Record<NodeType, { label: string; mobile: string; desktop: string }>;

/** Fila "Actor → Escribe una película" (o al revés) — verificado en la
 * screen 03a/03b. El label toma el color del nodo actual, el prompt el
 * color del tipo de respuesta esperado. */
export function DirectionIndicator({ currentType }: { currentType: NodeType }) {
  const expectedType: NodeType = currentType === "actor" ? "pelicula" : "actor";
  const ArrowIcon = ICONS.arrow;
  const current = PROMPT[currentType];
  const expected = PROMPT[expectedType];

  return (
    <div className="text-direction lg:text-direction-lg flex items-center justify-center gap-2 lg:justify-start lg:gap-2.5">
      <span
        className={
          currentType === "actor" ? "text-violet font-semibold" : "text-orange font-semibold"
        }
      >
        {current.label}
      </span>
      <ArrowIcon className="text-text-muted h-4 w-4 lg:h-[18px] lg:w-[18px]" strokeWidth={2} />
      <span
        className={`font-bold lg:hidden ${expectedType === "actor" ? "text-violet" : "text-orange"}`}
      >
        {expected.mobile}
      </span>
      <span
        className={`hidden font-bold lg:block ${expectedType === "actor" ? "text-violet" : "text-orange"}`}
      >
        {expected.desktop}
      </span>
    </div>
  );
}
