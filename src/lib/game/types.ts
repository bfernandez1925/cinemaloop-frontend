// Espejo de los tipos de cinemaloop-backend (src/lib/gameEngine.ts) — no
// se puede importar directamente entre repos, así que se mantiene aquí
// la forma exacta de lo que devuelven startGame/submitAnswer/finishGame.

export type NodeType = "actor" | "pelicula";

export interface PoolEntity {
  tipo: NodeType;
  entidad_tmdb_id: number;
  nombre: string;
  imagen: string | null;
}

export interface ActorNode extends PoolEntity {
  tipo: "actor";
  pais_origen: string | null;
  anio_nacimiento: number | null;
}

export type GameNode = PoolEntity | ActorNode;

// GameNode no es un discriminated union estricto para TypeScript (el
// `tipo` de PoolEntity es el NodeType genérico, no un literal exclusivo),
// así que un simple `node.tipo === "actor"` no basta para que TS deje
// leer pais_origen/anio_nacimiento — de ahí este type guard explícito.
export function isActorNode(node: GameNode): node is ActorNode {
  return node.tipo === "actor";
}

export type GameMode = "clasico" | "contrarreloj" | "maraton";

export interface StartGameResponse {
  gameId: string;
  nodoActual: GameNode;
}

export type SubmitAnswerResponse =
  | { correcto: false; puntuacion_total: number }
  | {
      correcto: true;
      nodoActual: GameNode;
      puntos: number;
      puntuacion_total: number;
      partida_finalizada?: true;
    };

export interface FinishGameResponse {
  puntuacion_total: number;
  nodos_alcanzados: number;
  tiempo_total: number;
  tiempo_medio_respuesta: number;
}
