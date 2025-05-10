import { Ctxt, JoinGameFunctionCtxt, JoinGameRequest, RPCError } from "@/types";
import { Game, gameDDB, Player } from "../database/game";
import { v4 as uuidv4 } from "uuid";

const MAX_PLAYERS_PER_GAME = 2;

const validatePlayerCanJoinGame = (game: Game): RPCError | null => {
  if (game.state !== "WAITING_FOR_PLAYERS") {
    return {
      code: -32601,
      message: "Cannot join game in current state.",
    };
  }
  const numPlayersAfterNewPlayer = game.players.length + 1;
  if (numPlayersAfterNewPlayer > MAX_PLAYERS_PER_GAME) {
    return {
      code: -32601,
      message: "Game is already full",
    };
  }
  return null;
};

const addPlayerToGame = (existingGame: Game, player: Player): Game => {
  const game = structuredClone(existingGame);
  game.players.push(player);
  if (game.players.length === MAX_PLAYERS_PER_GAME) {
    game.state = "SELECTING_CHARACTERS";
  }
  return game;
};

export const joinGame: JoinGameFunctionCtxt =
  (ctxt: Ctxt) =>
  async ({ params: { gameId, name }, id }: JoinGameRequest) => {
    const token = uuidv4();
    const playerId = uuidv4();
    const player: Player = {
      name,
      token,
      id: playerId,
      state: "SELECTING_CHARACTER",
    };
    const existingGame: Game = await gameDDB.getGame(ctxt)(gameId);
    const error = validatePlayerCanJoinGame(existingGame);
    if (error !== null) {
      return {
        id,
        error,
      };
    }
    const game = addPlayerToGame(existingGame, player);

    await gameDDB.updateGame(ctxt)(game);
    return {
      id,
      result: {
        token,
        id: playerId,
      },
    };
  };
