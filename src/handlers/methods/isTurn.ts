import { Ctxt, IsTurnFunctionCtxt, IsTurnRequest } from "@/types";
import { gameDDB } from "../database/game";

export const isTurn: IsTurnFunctionCtxt =
  (ctxt: Ctxt) =>
  async ({ params: { gameId, playerId, token }, id }: IsTurnRequest) => {
    const game = await gameDDB.getGame(ctxt)(gameId);
    const player = game.players.find(({ id }) => playerId === id);
    if (!player) {
      return {
        id,
        error: {
          code: -1,
          message: `Player with ID ${playerId} not found in game ${gameId}`,
        },
      };
    }
    if (player.token !== token) {
      return {
        id,
        error: {
          code: -1,
          message: `Token mismatch for player ${playerId} in game ${gameId}`,
        },
      };
    }
    const isTurn = player.state === "THIS_PLAYERS_TURN";
    return {
      id,
      result: {
        isTurn,
      },
    };
  };
