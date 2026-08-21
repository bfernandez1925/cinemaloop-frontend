import type { GameMode } from "@/lib/game/types";

const TABS: Array<{ key: GameMode; label: string }> = [
  { key: "clasico", label: "Clásico" },
  { key: "contrarreloj", label: "Contrarreloj" },
  { key: "maraton", label: "Maratón" },
  { key: "infantil", label: "Infantil" },
];

/**
 * Pestañas de modo en /ranking (CIN-63): cada modo premia algo
 * distinto, así que el ranking siempre se consulta filtrado por uno —
 * no existe una pestaña "todos". Cambiar de pestaña no navega a otra
 * URL, solo relanza la consulta con el modo elegido.
 */
export function RankingModeTabs({
  value,
  onChange,
}: {
  value: GameMode;
  onChange: (modo: GameMode) => void;
}) {
  return (
    <div role="tablist" className="mb-5 flex gap-2 overflow-x-auto lg:mb-6">
      {TABS.map((tab) => {
        const selected = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`text-button shrink-0 rounded-pill px-4 py-2 ${
              selected
                ? "bg-orange text-bg-primary"
                : "bg-surface-elevated text-text-secondary border-border border"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
