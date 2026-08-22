import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import type { GameMode } from "@/lib/game/types";
import type { GetLeaderboardResponse } from "@/lib/leaderboard/types";

export function getLeaderboard(pagina: number, modo: GameMode): Promise<GetLeaderboardResponse> {
  return httpsCallable<{ pagina: number; modo: GameMode }, GetLeaderboardResponse>(
    functions,
    "getLeaderboard",
  )({ pagina, modo }).then((result) => result.data);
}
