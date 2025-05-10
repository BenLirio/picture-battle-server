import {
  Ctxt,
  SelectCharacterFunctionCtxt,
  SelectCharacterRequest,
} from "@/types";
import { gameDDB } from "../database/game";

export const selectCharacter: SelectCharacterFunctionCtxt =
  (ctxt: Ctxt) =>
  async ({
    params: { character, gameId, playerId, token },
    id,
  }: SelectCharacterRequest) => {
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
    if (player.character) {
      return {
        id,
        error: {
          code: -1,
          message: `Player ${playerId} has already selected a character`,
        },
      };
    }
    player.character = character;
    if (
      game.players.length ===
      game.players.filter(({ character }) => character !== undefined).length
    ) {
      game.state = "GAME_LOOP";
    }
    await gameDDB.updateGame(ctxt)(game);

    return {
      id,
      result: {},
    };
  };
