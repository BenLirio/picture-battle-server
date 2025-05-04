import {
  CreateGameFunctionCtxt,
  CreateGameRequest,
  CreateGameResponse,
  Ctxt,
} from "@/types";
import { Game, gameDDB } from "../database/game";
import { v4 as uuidv4 } from "uuid";

export const createGame: CreateGameFunctionCtxt =
  (ctxt: Ctxt) =>
  async ({ params: { name }, id }: CreateGameRequest) => {
    const game: Game = {
      name,
      id: uuidv4(),
      state: "WAITING_FOR_PLAYERS",
      players: [],
    };
    await gameDDB.updateGame(ctxt)(game);
    const response: CreateGameResponse = {
      id,
      result: {
        gameId: game.id,
      },
    };
    return response;
  };
