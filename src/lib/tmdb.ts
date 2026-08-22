// El backend (cinemaloop-backend) devuelve el `profile_path`/`poster_path`
// crudo de TMDb (p. ej. "/abc123.jpg"), no una URL completa — construirla
// es responsabilidad del cliente. Tamaños fijos por tipo: suficientes
// para el rango de tamaños en pantalla del handoff (64-254px), sin
// necesidad de srcset responsive para el MVP.
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const PROFILE_SIZE = "w185";
const POSTER_SIZE = "w342";

export function buildTmdbImageUrl(path: string, type: "actor" | "movie"): string {
  const size = type === "actor" ? PROFILE_SIZE : POSTER_SIZE;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}
