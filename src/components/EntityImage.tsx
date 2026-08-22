"use client";

import { useState } from "react";
import { ICONS } from "@/design/icons";
import { buildTmdbImageUrl } from "@/lib/tmdb";

type EntityImageProps = {
  /** `profile_path`/`poster_path` crudo de TMDb, o null si no hay imagen. */
  path: string | null;
  type: "actor" | "movie";
  alt: string;
  /** Ancho en px — el alto se deriva del tipo (1:1 para actor, 2:3 para
   * película), nunca lo decide quien usa el componente: así no puede
   * colarse un recorte equivocado por descuido en la pantalla que lo use. */
  size: number;
  className?: string;
};

/**
 * Pipeline de imágenes de TMDb (CIN-47): actor siempre 1:1 redondeado
 * (nunca circular), película siempre 2:3 vertical redondeado — el radio
 * (~26% del lado corto) viene de `rounded-image` (ver src/design/tokens.ts).
 * "Visualmente mayor el póster que la foto de actor cuando coexisten" es
 * responsabilidad de quien use el componente, vía el prop `size` (ver
 * spec-design-fidelity.md).
 */
export function EntityImage({ path, type, alt, size, className = "" }: EntityImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(path ? "loading" : "error");
  const FallbackIcon = type === "actor" ? ICONS.actor : ICONS.movie;
  const width = size;
  const height = type === "actor" ? size : Math.round(size * 1.5);

  return (
    <div
      className={`bg-surface-elevated rounded-image relative shrink-0 overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {path && status !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element -- export estático (ADR-0007): sin next/image, la fuente es la CDN de TMDb.
        <img
          src={buildTmdbImageUrl(path, type)}
          alt={alt}
          width={width}
          height={height}
          className={`h-full w-full object-cover transition-opacity ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
      {status !== "loaded" && (
        <div
          aria-hidden={status === "loading"}
          role={status === "error" ? "img" : undefined}
          aria-label={status === "error" ? alt : undefined}
          className={`absolute inset-0 flex items-center justify-center ${
            status === "loading" ? "animate-pulse" : ""
          }`}
        >
          <FallbackIcon className="text-text-muted h-1/3 w-1/3" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
