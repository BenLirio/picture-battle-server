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
  id: z.string(),
  state: z.enum(["WAITING_FOR_PLAYERS"]),
  players: z.array(PlayerSchema),
});
export type Game = z.infer<typeof GameSchema>;

const createGame =
  ({ ddb }: Ctxt) =>
  async () => {
    const game: Game = {
      id: uuidv4(),
      state: "WAITING_FOR_PLAYERS",
      players: [],
    };
    const command = new PutCommand({
      TableName: process.env.GAMES_TABLE_NAME,
      Item: game,
    });
    ddb.send(command);
    return game;
  };

const createPlayerInGame =
  ({ ddb }: Ctxt) =>
  async (gameId: string, name: string) => {
    const token = uuidv4();
    const player: Player = {
      name,
      token,
    };

    // Retrieve the game by gameId
    const getCommand = new GetCommand({
      TableName: process.env.GAMES_TABLE_NAME,
      Key: { id: gameId },
    });
    const gameResult = await ddb.send(getCommand);

    if (!gameResult.Item) {
      throw new Error(`Game with ID ${gameId} not found`);
    }

    // Validate the retrieved game using zod
    const parsedGame = GameSchema.safeParse(gameResult.Item);
    if (!parsedGame.success) {
      throw new Error(`Invalid game data: ${parsedGame.error.message}`);
    }

    const game: Game = parsedGame.data;

    // Append the player to the players array
    game.players.push(player);

    // Update the game in the database
    const updateCommand = new PutCommand({
      TableName: process.env.GAMES_TABLE_NAME,
      Item: game,
    });
    await ddb.send(updateCommand);

    return player;
  };

export const gameDDB = {
  createGame,
  createPlayerInGame,
};
