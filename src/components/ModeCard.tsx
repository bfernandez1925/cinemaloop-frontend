import type { ComponentType } from "react";

type ModeCardProps = {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: { mobile: string; desktop: string };
  variant: "primary" | "comingSoon";
};

export function ModeCard({ icon: Icon, title, description, variant }: ModeCardProps) {
  const isComingSoon = variant === "comingSoon";

  return (
    <button
      type="button"
      disabled={isComingSoon}
      aria-disabled={isComingSoon}
      className={`bg-surface relative flex flex-col items-start rounded-card border-[1.5px] p-[22px] text-left lg:rounded-card-lg lg:p-8 ${
        isComingSoon ? "border-border cursor-not-allowed" : "border-orange cursor-pointer"
      }`}
    >
      <span
        className={`text-badge absolute top-[14px] right-[14px] rounded-pill px-[9px] py-1 uppercase lg:top-5 lg:right-5 lg:px-2.5 lg:py-[5px] ${
          isComingSoon ? "bg-surface-elevated text-text-muted" : "bg-orange-tint-bg text-orange"
        }`}
      >
        {isComingSoon ? "Próximamente" : "Popular"}
      </span>

      <Icon
        className={`mb-[14px] h-6 w-6 lg:mb-5 lg:h-[30px] lg:w-[30px] ${
          isComingSoon ? "text-violet" : "text-orange"
        }`}
        strokeWidth={1.6}
      />

      <h3
        className={`font-display text-card-title mb-1.5 lg:text-card-title-lg lg:mb-2.5 ${
          isComingSoon ? "text-text-secondary" : "text-text-primary"
        }`}
      >
        {title}
      </h3>

      {/* La copy del handoff difiere entre mobile y desktop (la versión de
          escritorio añade una frase), no es un acortamiento responsive. */}
      <p className="text-card-body text-text-tertiary leading-relaxed lg:hidden">
        {description.mobile}
      </p>
      <p className="text-card-body-lg text-text-tertiary hidden leading-relaxed lg:block">
        {description.desktop}
      </p>
    </button>
  );
}
