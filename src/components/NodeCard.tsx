import { EntityImage } from "@/components/EntityImage";
import { ICONS } from "@/design/icons";
import { isActorNode, type GameNode } from "@/lib/game/types";

// Verificado en la screen 03a/03b: actor 104px mobile / 150px desktop,
// película 130px mobile / 169px desktop.
const IMAGE_SIZES = {
  actor: { mobile: 104, desktop: 150 },
  pelicula: { mobile: 130, desktop: 169 },
} as const;

/** Tarjeta del nodo actual (actor o película) — badge de tipo, imagen,
 * nombre y, solo para actores, país de origen y año de nacimiento (el
 * backend no devuelve esos campos para películas, ver toActorNode en
 * cinemaloop-backend). */
export function NodeCard({ node }: { node: GameNode }) {
  const isActor = node.tipo === "actor";
  const Icon = isActor ? ICONS.actor : ICONS.movie;
  const sizes = IMAGE_SIZES[node.tipo];
  const caption =
    isActorNode(node) && (node.pais_origen || node.anio_nacimiento)
      ? [node.pais_origen, node.anio_nacimiento].filter(Boolean).join(" · ")
      : null;

  return (
    <div className="bg-surface border-border rounded-panel flex w-full flex-col items-center gap-3.5 border p-[18px] lg:gap-[14px] lg:p-7">
      <span
        className={`text-badge flex items-center gap-1.5 self-start rounded-pill px-[11px] py-[5px] uppercase ${
          isActor
            ? "bg-violet-tint-bg-strong text-violet-tint-text"
            : "bg-orange-tint-bg-strong text-orange-tint-text"
        }`}
      >
        <Icon className="h-[11px] w-[11px] lg:h-3 lg:w-3" strokeWidth={2} />
        {isActor ? "Actor" : "Película"}
      </span>

      <div className="lg:hidden">
        <EntityImage
          path={node.imagen}
          type={isActor ? "actor" : "movie"}
          alt={node.nombre}
          size={sizes.mobile}
        />
      </div>
      <div className="hidden lg:block">
        <EntityImage
          path={node.imagen}
          type={isActor ? "actor" : "movie"}
          alt={node.nombre}
          size={sizes.desktop}
        />
      </div>

      <h3 className="font-display text-node-title lg:text-node-title-lg text-text-primary text-center">
        {node.nombre}
      </h3>
      {caption && <span className="text-meta text-text-tertiary">{caption}</span>}
    </div>
  );
}
