import { gameDDB } from "../database/game";
import {
  Ctxt,
  ListGamesFunctionCtxt,
  ListGamesRequest,
  ListGamesResponse,
} from "@/types";

export const listGames: ListGamesFunctionCtxt =
  (ctxt: Ctxt) =>
  async ({ id, params: { stateFilter } }: ListGamesRequest) => {
    const gamesList = await gameDDB.listGames(ctxt)(stateFilter);
    const response: ListGamesResponse = {
      id,
      result: { games: gamesList },
    };
    return response;
  };
