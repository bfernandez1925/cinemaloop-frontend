import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import type { GetUserGamesResponse, UserProfile } from "@/lib/historial/types";

export function getUserGames(pagina: number): Promise<GetUserGamesResponse> {
  return httpsCallable<{ pagina: number }, GetUserGamesResponse>(
    functions,
    "getUserGames",
  )({ pagina }).then((result) => result.data);
}

export function getUserProfile(): Promise<UserProfile> {
  return httpsCallable<Record<string, never>, UserProfile>(
    functions,
    "getUserProfile",
  )({}).then((result) => result.data);
}
