import { EntityImage } from "@/components/EntityImage";
import { ICONS } from "@/design/icons";
import type { GameNode, NodeType } from "@/lib/game/types";

// Verificado en la screen 03a/03b: chip de actor 80px mobile/108px
// desktop, chip de película 94px mobile/125px desktop.
const CHIP_IMAGE_SIZES = {
  actor: { mobile: 80, desktop: 108 },
  pelicula: { mobile: 94, desktop: 125 },
} as const;

const LABEL: Record<NodeType, string> = {
  actor: "Actores/actrices ya usados · no se repiten",
  pelicula: "Películas ya usadas · no se repiten",
};

/** Lista de "ya usados": muestra las entidades del tipo que el jugador
 * está a punto de responder (`type` = tipo esperado), no del tipo del
 * nodo actual — así el jugador ve justo lo que no puede repetir en su
 * próxima respuesta (spec-frontend-ux.md). */
export function UsedEntitiesList({ type, entities }: { type: NodeType; entities: GameNode[] }) {
  const LockIcon = ICONS.lock;
  const sizes = CHIP_IMAGE_SIZES[type];
  const isActor = type === "actor";

  if (entities.length === 0) return null;

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-1.5 lg:mb-3 lg:gap-2">
        <LockIcon className="text-orange h-3.5 w-3.5 lg:h-4 lg:w-4" strokeWidth={2} />
        <span className="text-section-label lg:text-section-label-lg text-text-primary uppercase">
          {LABEL[type]}
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5 lg:gap-4">
        {entities.map((entity) => (
          <div
            key={entity.entidad_tmdb_id}
            className="flex w-24 flex-col items-center gap-1.5 lg:w-32 lg:gap-2"
          >
            <div className="relative">
              <div className="lg:hidden">
                <EntityImage
                  path={entity.imagen}
                  type={isActor ? "actor" : "movie"}
                  alt={entity.nombre}
                  size={sizes.mobile}
                  className="border-border border"
                />
              </div>
              <div className="hidden lg:block">
                <EntityImage
                  path={entity.imagen}
                  type={isActor ? "actor" : "movie"}
                  alt={entity.nombre}
                  size={sizes.desktop}
                  className="border-border border"
                />
              </div>
              <span
                className={`bg-bg-primary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border lg:-top-1.5 lg:-right-1.5 lg:h-5 lg:w-5 ${
                  isActor ? "border-violet" : "border-orange"
                }`}
              >
                <LockIcon
                  className={`h-2 w-2 lg:h-2.5 lg:w-2.5 ${isActor ? "text-violet" : "text-orange"}`}
                  strokeWidth={3}
                />
              </span>
            </div>
            <span className="text-meta text-text-tertiary text-center leading-tight">
              {entity.nombre}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
