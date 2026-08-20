import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";
import { ModeCard } from "@/components/ModeCard";
import { RequireAuth } from "@/components/RequireAuth";
import { ICONS } from "@/design/icons";

export const metadata: Metadata = {
  title: "Elige tu modo — Cinemaloop",
};

const MODES = [
  {
    key: "clasico",
    title: "Clásico",
    icon: ICONS.modeClasico,
    variant: "primary" as const,
    description: {
      mobile: "Cronómetro por respuesta, sin límite de cadena.",
      desktop: "Cronómetro por respuesta, sin límite de cadena. Ideal para empezar.",
    },
  },
  {
    key: "contrarreloj",
    title: "Contrarreloj",
    icon: ICONS.modeContrarreloj,
    variant: "comingSoon" as const,
    description: {
      mobile: "90 segundos totales para encadenar nodos.",
      desktop:
        "90 segundos totales. Encadena tantos nodos como puedas antes de que se agote el tiempo.",
    },
  },
  {
    key: "maraton",
    title: "Maratón",
    icon: ICONS.modeMaraton,
    variant: "comingSoon" as const,
    description: {
      mobile: "Cadena infinita hasta el primer fallo.",
      desktop: "Cadena infinita: termina solo cuando fallas o repites un nodo.",
    },
  },
];

export default function ModeSelectPage() {
  return (
    <RequireAuth>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pt-2 pb-10 lg:px-20 lg:py-10">
        <div className="mb-6 flex items-center gap-[14px] lg:mb-10 lg:gap-4">
          <BackButton href="/" />
          <h2 className="font-display text-screen-title lg:text-screen-title-lg text-text-primary">
            Elige tu modo
          </h2>
        </div>

        <div className="flex flex-col gap-[14px] lg:grid lg:grid-cols-3 lg:gap-6">
          {MODES.map(({ key, ...mode }) => (
            <ModeCard key={key} {...mode} />
          ))}
        </div>
      </main>
    </RequireAuth>
  );
}
