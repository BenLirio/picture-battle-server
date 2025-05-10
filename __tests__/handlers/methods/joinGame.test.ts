import { joinGame } from "../../../src/handlers/methods/joinGame";
import { gameDDB, Game, Player } from "../../../src/handlers/database/game";

describe("joinGame", () => {
  const ctxt = { ddb: {} } as any;
  let mockGetGame: jest.SpyInstance;
  let mockUpdateGame: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGame = jest.spyOn(gameDDB, "getGame");
    mockUpdateGame = jest.spyOn(gameDDB, "updateGame");
  });

  it("adds a player to an empty game and keeps state WAITING_FOR_PLAYERS", async () => {
    const initialGame: Game = {
      id: "game123",
      name: "Test Game",
      state: "WAITING_FOR_PLAYERS",
      players: [],
    };
    const getGameFunc = jest.fn().mockResolvedValue(initialGame);
    mockGetGame.mockReturnValue(getGameFunc);
    const updateGameFunc = jest.fn().mockResolvedValue(undefined);
    mockUpdateGame.mockReturnValue(updateGameFunc);

    const handler = joinGame(ctxt);
    const response = await handler({
      method: "join_game",
      id: 1,
      params: { gameId: "game123", name: "Alice" },
    });
    expect(response.id).toBe(1);
    expect(response.result).toBeDefined();
    const token = response.result!.token;
    expect(typeof token).toBe("string");

    expect(mockGetGame).toHaveBeenCalledWith(ctxt);
    expect(getGameFunc).toHaveBeenCalledWith("game123");
    expect(mockUpdateGame).toHaveBeenCalledWith(ctxt);
    expect(updateGameFunc).toHaveBeenCalledWith(
      expect.objectContaining({
        players: [{ name: "Alice", token, id: expect.any(String) }],
        state: "WAITING_FOR_PLAYERS",
      } as Partial<Game>)
    );
  });

  it("adds a second player and transitions state to SELECTING_CHARACTERS when game is full", async () => {
    const existingPlayer: Player = {
      name: "Bob",
      token: "bob-token",
      id: "bob-id",
    };
    const initialGame: Game = {
      id: "game123",
      name: "Test Game",
      state: "WAITING_FOR_PLAYERS",
      players: [existingPlayer],
    };
    const getGameFunc = jest.fn().mockResolvedValue(initialGame);
    mockGetGame.mockReturnValue(getGameFunc);
    const updateGameFunc = jest.fn().mockResolvedValue(undefined);
    mockUpdateGame.mockReturnValue(updateGameFunc);

    const handler = joinGame(ctxt);
    const response = await handler({
      method: "join_game",
      id: 2,
      params: { gameId: "game123", name: "Carol" },
    });
    expect(response.id).toBe(2);
    expect(response.result).toBeDefined();
    const token = response.result!.token;
    expect(typeof token).toBe("string");

    expect(getGameFunc).toHaveBeenCalledWith("game123");
    expect(updateGameFunc).toHaveBeenCalledWith(
      expect.objectContaining({
        players: [
          existingPlayer,
          { name: "Carol", token, id: expect.any(String) },
        ],
        state: "SELECTING_CHARACTERS",
      } as Partial<Game>)
    );
  });

  it("returns an error when attempting to join a game not in WAITING_FOR_PLAYERS state", async () => {
    const initialGame: Game = {
      id: "game123",
      name: "Test Game",
      state: "SELECTING_CHARACTERS",
      players: [],
    };
    const getGameFunc = jest.fn().mockResolvedValue(initialGame);
    mockGetGame.mockReturnValue(getGameFunc);

    const handler = joinGame(ctxt);
    const response = await handler({
      method: "join_game",
      id: 3,
      params: { gameId: "game123", name: "Dave" },
    });
    expect(response.id).toBe(3);
    expect(response.error).toEqual({
      code: -32601,
      message: "Cannot join game in current state.",
    });
    expect(mockUpdateGame).not.toHaveBeenCalled();
  });

  it("returns an error when attempting to join a full game", async () => {
    const existingPlayers: Player[] = [
      { name: "Eve", token: "eve-token", id: "eve-id" },
      { name: "Frank", token: "frank-token", id: "frank-id" },
    ];
    const initialGame: Game = {
      id: "game123",
      name: "Test Game",
      state: "WAITING_FOR_PLAYERS",
      players: existingPlayers,
    };
    const getGameFunc = jest.fn().mockResolvedValue(initialGame);
    mockGetGame.mockReturnValue(getGameFunc);

    const handler = joinGame(ctxt);
    const response = await handler({
      method: "join_game",
      id: 4,
      params: { gameId: "game123", name: "Grace" },
    });
    expect(response.id).toBe(4);
    expect(response.error).toEqual({
      code: -32601,
      message: "Game is already full",
    });
    expect(mockUpdateGame).not.toHaveBeenCalled();
  });
});
