// Espejo de los tipos de cinemaloop-backend (src/functions/historial.ts,
// src/functions/auth.ts) — no se puede importar directamente entre
// repos, así que se mantiene aquí la forma exacta de lo que devuelven
// getUserGames/getUserProfile.

export type GameHistoryStatus = "Ranking" | "Guardada";

export interface GameHistoryEntry {
  gameId: string;
  fecha: string;
  modo: string;
  puntuacion_total: number;
  nodos_alcanzados: number;
  estado: GameHistoryStatus;
}

export interface GetUserGamesResponse {
  pagina: number;
  partidas: GameHistoryEntry[];
}

export interface UserProfile {
  nombre_usuario: string | null;
  mejor_puntuacion: number;
  cadena_mas_larga: number;
  partidas_jugadas: number;
}
