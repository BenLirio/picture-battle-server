import { Ctxt, DoActionFunctionCtxt, DoActionRequest } from "@/types";
import { gameDDB } from "../database/game";

export const doAction: DoActionFunctionCtxt =
  (ctxt: Ctxt) =>
  async ({
    id,
    params: { action, gameId, playerId, token },
  }: DoActionRequest) => {
    const game = await gameDDB.getGame(ctxt)(gameId);
    if (game.state !== "GAME_LOOP") {
      return {
        id,
        error: {
          code: -1,
          message: `Game ${gameId} is not in game loop state`,
        },
      };
    }
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
    if (player.state !== "THIS_PLAYERS_TURN") {
      return {
        id,
        error: {
          code: -1,
          message: `It's not player ${playerId}'s turn in game ${gameId}`,
        },
      };
    }
    if (action === "win") {
      game.state = "GAME_OVER";
      player.state = "WON";
      game.players
        .filter(({ id }) => id !== playerId)
        .forEach((p) => {
          p.state = "LOST";
        });
    } else {
      const indexOfPlayer = game.players.findIndex(({ id }) => id === playerId);
      game.players.forEach((p, index) => {
        if (index === indexOfPlayer) {
          p.state = "WAITING_FOR_TURN";
        } else if (index === (indexOfPlayer + 1) % game.players.length) {
          p.state = "THIS_PLAYERS_TURN";
        }
      });
    }
    return {
      id,
      result: {},
    };
  };
