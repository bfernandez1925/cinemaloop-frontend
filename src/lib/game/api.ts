import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import type {
  FinishGameResponse,
  GameMode,
  StartGameResponse,
  SubmitAnswerResponse,
} from "@/lib/game/types";

export function startGame(modo: GameMode): Promise<StartGameResponse> {
  return httpsCallable<{ modo: GameMode }, StartGameResponse>(
    functions,
    "startGame",
  )({ modo }).then((result) => result.data);
}

export function submitAnswer(
  gameId: string,
  respuesta: string,
  tiempoRespuestaSegundos: number,
): Promise<SubmitAnswerResponse> {
  return httpsCallable<
    { gameId: string; respuesta: string; tiempo_respuesta_segundos: number },
    SubmitAnswerResponse
  >(
    functions,
    "submitAnswer",
  )({ gameId, respuesta, tiempo_respuesta_segundos: tiempoRespuestaSegundos }).then(
    (result) => result.data,
  );
}

export function finishGame(gameId: string): Promise<FinishGameResponse> {
  return httpsCallable<{ gameId: string }, FinishGameResponse>(
    functions,
    "finishGame",
  )({ gameId }).then((result) => result.data);
}
