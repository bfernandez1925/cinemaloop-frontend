import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import type { GetLeaderboardResponse } from "@/lib/leaderboard/types";

export function getLeaderboard(pagina: number): Promise<GetLeaderboardResponse> {
  return httpsCallable<{ pagina: number }, GetLeaderboardResponse>(
    functions,
    "getLeaderboard",
  )({ pagina }).then((result) => result.data);
}
