// filepath: __tests__/handlers/methods/isTurn.test.ts
import { isTurn } from "../../../src/handlers/methods/isTurn";
import { gameDDB, Game } from "../../../src/handlers/database/game";

describe("isTurn", () => {
  const ctxt = { ddb: {} } as any;
  let mockGetGame: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGame = jest.spyOn(gameDDB, "getGame");
  });

  it("returns true when it's the player's turn", async () => {
    const initialGame: Game = {
      id: "game1",
      name: "Test Game",
      state: "GAME_LOOP",
      players: [
        {
          id: "p1",
          name: "Alice",
          token: "token1",
          state: "THIS_PLAYERS_TURN",
        },
      ],
    };
    const getGameFunc = jest.fn().mockResolvedValue(initialGame);
    mockGetGame.mockReturnValue(getGameFunc);

    const handler = isTurn(ctxt);
    const response = await handler({
      method: "is_turn",
      id: 1,
      params: { gameId: "game1", playerId: "p1", token: "token1" },
    });

    expect(response.id).toBe(1);
    expect(response.result).toEqual({ isTurn: true });
    expect(mockGetGame).toHaveBeenCalledWith(ctxt);
    expect(getGameFunc).toHaveBeenCalledWith("game1");
  });

  it("returns false when it's not the player's turn", async () => {
    const initialGame: Game = {
      id: "game2",
      name: "Test Game",
      state: "GAME_LOOP",
      players: [
        { id: "p2", name: "Bob", token: "token2", state: "WAITING_FOR_TURN" },
      ],
    };
    const getGameFunc = jest.fn().mockResolvedValue(initialGame);
    mockGetGame.mockReturnValue(getGameFunc);

    const handler = isTurn(ctxt);
    const response = await handler({
      method: "is_turn",
      id: 2,
      params: { gameId: "game2", playerId: "p2", token: "token2" },
    });

    expect(response.id).toBe(2);
    expect(response.result).toEqual({ isTurn: false });
  });

  it("returns error when player not found", async () => {
    const initialGame: Game = {
      id: "game3",
      name: "Test Game",
      state: "GAME_LOOP",
      players: [],
    };
    const getGameFunc = jest.fn().mockResolvedValue(initialGame);
    mockGetGame.mockReturnValue(getGameFunc);

    const handler = isTurn(ctxt);
    const response = await handler({
      method: "is_turn",
      id: 3,
      params: { gameId: "game3", playerId: "pX", token: "tokenX" },
    });

    expect(response.id).toBe(3);
    expect(response.error).toEqual({
      code: -1,
      message: `Player with ID pX not found in game game3`,
    });
  });

  it("returns error when token mismatches", async () => {
    const initialGame: Game = {
      id: "game4",
      name: "Test Game",
      state: "GAME_LOOP",
      players: [
        {
          id: "p4",
          name: "Carol",
          token: "correct-token",
          state: "THIS_PLAYERS_TURN",
        },
      ],
    };
    const getGameFunc = jest.fn().mockResolvedValue(initialGame);
    mockGetGame.mockReturnValue(getGameFunc);

    const handler = isTurn(ctxt);
    const response = await handler({
      method: "is_turn",
      id: 4,
      params: { gameId: "game4", playerId: "p4", token: "wrong-token" },
    });

    expect(response.id).toBe(4);
    expect(response.error).toEqual({
      code: -1,
      message: `Token mismatch for player p4 in game game4`,
    });
  });
});
