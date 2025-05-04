import { Ctxt, JoinGameFunctionCtxt, JoinGameRequest } from "@/types";
import { gameDDB } from "../database/game";

export const joinGame: JoinGameFunctionCtxt =
  (ctxt: Ctxt) =>
  async ({ params: { gameId, name }, id }: JoinGameRequest) => {
    const { token } = await gameDDB.createPlayerInGame(ctxt)(gameId, name);
    return {
      id,
      result: {
        token,
      },
    };
  };
