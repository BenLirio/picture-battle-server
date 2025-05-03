import { Ctxt, JoinGameFunctionCtxt, JoinGameRequest } from "@/types";
import { gameDDB } from "../database/game";

export const joinGame: JoinGameFunctionCtxt =
  (ctxt: Ctxt) =>
  async ({ params: { gameId, name } }: JoinGameRequest) => {
    const player = await gameDDB.createPlayerInGame(ctxt)(gameId, name);
    return {
      id: 1,
      result: {
        gameId,
        ...player,
      },
    };
  };
