import type { UserProfile } from "@/lib/historial/types";

const CARDS = [
  { key: "mejor_puntuacion", label: "mejor puntuación", colorClass: "text-orange" },
  { key: "cadena_mas_larga", label: "cadena más larga", colorClass: "text-violet" },
  { key: "partidas_jugadas", label: "partidas jugadas", colorClass: "text-text-primary" },
] as const;

/** Las 3 tarjetas de récord de "Mis partidas" (mejor puntuación, cadena
 * más larga, partidas jugadas), leídas de `users/{uid}` vía
 * `getUserProfile` — nunca calculadas en el cliente recorriendo el
 * historial (spec-historial.md). */
export function RecordCards({ profile }: { profile: UserProfile }) {
  return (
    <div className="grid grid-cols-3 gap-2 lg:max-w-[640px] lg:gap-4">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-record-card lg:rounded-record-card-lg border-border bg-surface border px-1.5 py-3.5 text-center lg:px-3 lg:py-5"
        >
          <p
            className={`font-display text-record-number lg:text-record-number-lg ${card.colorClass}`}
          >
            {profile[card.key]}
          </p>
          <p className="text-meta text-text-muted mt-[3px] lg:mt-[5px]">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
