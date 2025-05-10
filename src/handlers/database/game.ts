import { Ctxt, GAME_STATES, GameState } from "@/types";
import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import z from "zod";

const PlayerSchema = z.object({
  name: z.string(),
  id: z.string(),
  token: z.string(),
  character: z.string().optional(),
  state: z.enum([
    "SELECTING_CHARACTER",
    "SELECTED_CHARACTER",
    "THIS_PLAYERS_TURN",
    "WAITING_FOR_TURN",
    "WON",
    "LOST",
  ]),
});
export type Player = z.infer<typeof PlayerSchema>;

const GameSchema = z.object({
  name: z.string(),
  id: z.string(),
  state: z.enum(GAME_STATES),
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

const listGames =
  ({ ddb }: Ctxt) =>
  async (stateFilter?: string): Promise<{ id: string; state: GameState }[]> => {
    const params: any = {
      TableName: process.env.GAMES_TABLE_NAME,
      ProjectionExpression: "id, #s",
      ExpressionAttributeNames: { "#s": "state" },
    };
    if (stateFilter) {
      params.FilterExpression = "#s = :state";
      params.ExpressionAttributeValues = { ":state": stateFilter };
    }
    const command = new ScanCommand(params);
    const result = await ddb.send(command);
    const items = result.Items || [];
    return items.map((item) => ({
      id: item.id,
      state: item.state as GameState,
    }));
  };

export const gameDDB = {
  updateGame,
  getGame,
  listGames,
};
