import { Ctxt, GAME_STATES } from "@/types";
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

// Define schema for listGames output
const ListGameSchema = z.object({
  id: z.string(),
  state: z.enum(GAME_STATES),
});
export type ListGame = z.infer<typeof ListGameSchema>;

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
  async (game: unknown) => {
    // Validate input game against schema
    const parsedInput = GameSchema.safeParse(game);
    if (!parsedInput.success) {
      throw new Error(`Invalid game input: ${parsedInput.error.message}`);
    }
    const validGame = parsedInput.data;
    const command = new PutCommand({
      TableName: process.env.GAMES_TABLE_NAME,
      Item: validGame,
    });
    await ddb.send(command);
    return validGame;
  };

const listGames =
  ({ ddb }: Ctxt) =>
  async (stateFilter?: unknown): Promise<ListGame[]> => {
    const params: any = {
      TableName: process.env.GAMES_TABLE_NAME,
      ProjectionExpression: "id, #s",
      ExpressionAttributeNames: { "#s": "state" },
    };
    if (stateFilter !== undefined) {
      // Validate filter value
      const parsedFilter = z.enum(GAME_STATES).safeParse(stateFilter);
      if (!parsedFilter.success) {
        throw new Error(`Invalid state filter: ${parsedFilter.error.message}`);
      }
      params.FilterExpression = "#s = :state";
      params.ExpressionAttributeValues = { ":state": parsedFilter.data };
    }
    const command = new ScanCommand(params);
    const result = await ddb.send(command);
    const items = result.Items || [];
    // Validate fetched items
    const parsedList = z.array(ListGameSchema).safeParse(items);
    if (!parsedList.success) {
      throw new Error(`Invalid game list data: ${parsedList.error.message}`);
    }
    return parsedList.data;
  };

export const gameDDB = {
  updateGame,
  getGame,
  listGames,
};
