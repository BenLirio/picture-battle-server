import { Ctxt } from "@/types";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import z from "zod";
import { v4 as uuidv4 } from "uuid";

const PlayerSchema = z.object({
  name: z.string(),
  token: z.string(),
});
export type Player = z.infer<typeof PlayerSchema>;

const GameSchema = z.object({
  name: z.string(),
  id: z.string(),
  state: z.enum(["WAITING_FOR_PLAYERS"]),
  players: z.array(PlayerSchema),
});
export type Game = z.infer<typeof GameSchema>;

const getGame =
  ({ ddb }: Ctxt) =>
  async (gameId: string): Promise<Game> => {
    const command = new GetCommand({
      TableName: process.env.GAMES_TABLE_NAME,
      Key: { id: gameId },
    });
    const result = await ddb.send(command);
    if (!result.Item) {
      throw new Error(`Game with ID ${gameId} not found`);
    }
    const parsedGame = GameSchema.safeParse(result.Item);
    if (!parsedGame.success) {
      throw new Error(`Invalid game data: ${parsedGame.error.message}`);
    }
    return parsedGame.data;
  };

const updateGame =
  ({ ddb }: Ctxt) =>
  async (game: Game) => {
    const command = new PutCommand({
      TableName: process.env.GAMES_TABLE_NAME,
      Item: game,
    });
    await ddb.send(command);
    return game;
  };

const createGame = (ctxt: Ctxt) => async (name: string) => {
  const game: Game = {
    name,
    id: uuidv4(),
    state: "WAITING_FOR_PLAYERS",
    players: [],
  };
  await updateGame(ctxt)(game);
  return game;
};

const createPlayerInGame =
  (ctxt: Ctxt) => async (gameId: string, name: string) => {
    const token = uuidv4();
    const player: Player = {
      name,
      token,
    };
    const game: Game = await getGame(ctxt)(gameId);
    game.players.push(player);
    await updateGame(ctxt)(game);
    return player;
  };

export const gameDDB = {
  createGame,
  createPlayerInGame,
};
