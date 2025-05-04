import {
  CreateGameFunctionCtxt,
  CreateGameRequest,
  CreateGameResponse,
  Ctxt,
} from "@/types";
import { gameDDB } from "../database/game";

export const createGame: CreateGameFunctionCtxt =
  (ctxt: Ctxt) =>
  async ({ params: { name }, id }: CreateGameRequest) => {
    const game = await gameDDB.createGame(ctxt)(name);
    const response: CreateGameResponse = {
      id,
      result: {
        gameId: game.id,
      },
    };
    return response;
  };
