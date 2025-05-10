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
    player.state = "SELECTED_CHARACTER";
    if (
      game.players.find(({ state }) => state !== "SELECTED_CHARACTER") ===
      undefined
    ) {
      game.state = "GAME_LOOP";
      game.players.forEach((player) => {
        player.state = "WAITING_FOR_TURN";
      });
      const numPlayers = game.players.length;
      const randomPlayerIndex = Math.floor(Math.random() * numPlayers);
      game.players[randomPlayerIndex].state = "THIS_PLAYERS_TURN";
    }
    await gameDDB.updateGame(ctxt)(game);

    return {
      id,
      result: {},
    };
  };
