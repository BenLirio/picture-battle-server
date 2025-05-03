import {
  CreateGameFunctionCtxt,
  CreateGameRequest,
  CreateGameResponse,
  Ctxt,
} from "@/types";
import { gameDDB } from "../database/game";

export const createGame: CreateGameFunctionCtxt =
  (ctxt: Ctxt) => async (request: CreateGameRequest) => {
    const game = await gameDDB.createGame(ctxt)();
    const response: CreateGameResponse = {
      id: request.id,
      result: {
        gameId: game.id,
      },
    };
    return response;
  };
