import { EntityImage } from "@/components/EntityImage";
import { computeChainLayout } from "@/lib/game/chainLayout";
import type { GameNode } from "@/lib/game/types";

// Verificado en la screen "04 · Fin de partida": actor 64px mobile/88px
// desktop; película 48px mobile/64px desktop de ancho (el handoff usa un
// 4:3 real para este nodo pequeño, pero se mantiene el 2:3 que exige la
// spec — EntityImage deriva el alto siempre, nunca un ratio distinto).
const NODE_SIZE = {
  actor: { mobile: 64, desktop: 88 },
  pelicula: { mobile: 48, desktop: 64 },
} as const;

/** Todos los nodos de la partida sobre una curva continua en serpentina
 * (CIN-44) — funciona con cualquier longitud de cadena, incluida 1. El
 * nodo final lleva un halo extra del color de su propio tipo (el
 * handoff muestra ese halo en naranja en su único ejemplo aunque el
 * nodo es un actor — se trata como una inconsistencia del mockup, no
 * como regla: aquí el halo siempre respeta violeta=actor/naranja=película). */
export function ChainVisualization({ chain }: { chain: GameNode[] }) {
  if (chain.length === 0) return null;

  const layout = computeChainLayout(chain.length);

  return (
    <div className="w-full">
      <span className="text-section-label lg:text-section-label-lg text-text-muted uppercase">
        Cadena completa · {chain.length} {chain.length === 1 ? "nodo" : "nodos"}
      </span>
      <div
        className="relative mx-auto mt-3.5 w-full lg:mt-[18px]"
        style={{
          maxWidth: layout.canvasWidth,
          aspectRatio: `${layout.canvasWidth} / ${layout.canvasHeight}`,
        }}
      >
        <svg
          viewBox={`0 0 ${layout.canvasWidth} ${layout.canvasHeight}`}
          preserveAspectRatio="none"
          className="text-border-subtle absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d={layout.pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            strokeLinecap="round"
          />
        </svg>

        {chain.map((node, index) => {
          const point = layout.positions[index]!;
          const isLast = index === chain.length - 1;
          const isActor = node.tipo === "actor";
          const sizes = NODE_SIZE[node.tipo];
          const borderClass = isActor ? "border-violet" : "border-orange";
          const haloClass = isLast
            ? isActor
              ? "shadow-[0_0_0_4px_var(--color-violet-halo)]"
              : "shadow-[0_0_0_4px_var(--color-orange-halo)]"
            : "";

          return (
            <div
              key={node.entidad_tmdb_id}
              className="absolute flex flex-col items-center gap-1"
              style={{
                left: `${(point.x / layout.canvasWidth) * 100}%`,
                top: `${(point.y / layout.canvasHeight) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="lg:hidden">
                <EntityImage
                  path={node.imagen}
                  type={isActor ? "actor" : "movie"}
                  alt={node.nombre}
                  size={sizes.mobile}
                  className={`border-2 ${borderClass} ${haloClass}`}
                />
              </div>
              <div className="hidden lg:block">
                <EntityImage
                  path={node.imagen}
                  type={isActor ? "actor" : "movie"}
                  alt={node.nombre}
                  size={sizes.desktop}
                  className={`border-2 ${borderClass} ${haloClass}`}
                />
              </div>
              <span
                className={`text-meta max-w-20 text-center leading-tight ${
                  isLast ? "text-text-primary font-semibold" : "text-text-tertiary"
                }`}
              >
                {node.nombre}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
