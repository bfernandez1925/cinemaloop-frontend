// Espejo de cinemaloop-backend (src/functions/scoring.ts, getLeaderboard).

export interface LeaderboardEntry {
  posicion: number;
  userId: string;
  nombre_usuario: string | null;
  puntuacion: number;
  nodos_alcanzados: number;
  tiempo_medio_respuesta: number;
  tiempo_total: number;
  fecha: string;
}

export interface GetLeaderboardResponse {
  pagina: number;
  entradas: LeaderboardEntry[];
  propia: LeaderboardEntry | null;
}
