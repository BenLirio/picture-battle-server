import { createGame } from "../../../src/handlers/methods/createGame";
import { gameDDB, Game } from "../../../src/handlers/database/game";
import { v4 as uuidv4 } from "uuid";

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

describe("createGame", () => {
  const ctxt = { ddb: {} } as any;
  let mockUpdateGame: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateGame = jest.spyOn(gameDDB, "updateGame");
  });

  it("creates a new game and returns correct gameId and updates database", async () => {
    (uuidv4 as jest.Mock).mockReturnValue("uuid-1234");
    const updateGameFunc = jest.fn().mockResolvedValue(undefined);
    mockUpdateGame.mockReturnValue(updateGameFunc);

    const handler = createGame(ctxt);
    const response = await handler({
      method: "create_game",
      id: 1,
      params: { name: "Test Game" },
    });

    expect(response.id).toBe(1);
    expect(response.result).toEqual({ gameId: "uuid-1234" });

    expect(mockUpdateGame).toHaveBeenCalledWith(ctxt);
    expect(updateGameFunc).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Game",
        id: "uuid-1234",
        state: "WAITING_FOR_PLAYERS",
        players: [],
      } as Partial<Game>)
    );
  });
});
