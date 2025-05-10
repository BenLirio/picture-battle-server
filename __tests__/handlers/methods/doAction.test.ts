import { doAction } from "../../../src/handlers/methods/doAction";
import { gameDDB } from "../../../src/handlers/database/game";

jest.mock("../../../src/handlers/database/game", () => ({
  gameDDB: {
    getGame: jest.fn(),
  },
}));

describe("doAction", () => {
  const ctxt = {} as any;

  beforeEach(() => {
    (gameDDB.getGame as jest.Mock).mockReset();
  });

  it("returns error if game state is not GAME_LOOP", async () => {
    const fakeGame = { state: "NOT_LOOP", players: [] };
    (gameDDB.getGame as jest.Mock).mockReturnValueOnce(() =>
      Promise.resolve(fakeGame)
    );
    const response = await doAction(ctxt)({
      id: "1",
      method: "do_action",
      params: { action: "noop", gameId: "g1", playerId: "p1", token: "t" },
    });
    expect(response).toEqual({
      id: "1",
      error: { code: -1, message: "Game g1 is not in game loop state" },
    });
  });

  it("returns error if player not found", async () => {
    const fakeGame = { state: "GAME_LOOP", players: [] };
    (gameDDB.getGame as jest.Mock).mockReturnValueOnce(() =>
      Promise.resolve(fakeGame)
    );
    const response = await doAction(ctxt)({
      id: "2",
      method: "do_action",
      params: { action: "noop", gameId: "g2", playerId: "pX", token: "t" },
    });
    expect(response).toEqual({
      id: "2",
      error: { code: -1, message: "Player with ID pX not found in game g2" },
    });
  });

  it("returns error on token mismatch", async () => {
    const fakeGame = {
      state: "GAME_LOOP",
      players: [{ id: "p1", token: "wrong", state: "THIS_PLAYERS_TURN" }],
    };
    (gameDDB.getGame as jest.Mock).mockReturnValueOnce(() =>
      Promise.resolve(fakeGame)
    );
    const response = await doAction(ctxt)({
      id: "3",
      method: "do_action",
      params: {
        action: "noop",
        gameId: "g3",
        playerId: "p1",
        token: "correct",
      },
    });
    expect(response).toEqual({
      id: "3",
      error: { code: -1, message: "Token mismatch for player p1 in game g3" },
    });
  });

  it("returns error when it's not the player's turn", async () => {
    const fakeGame = {
      state: "GAME_LOOP",
      players: [{ id: "p1", token: "token1", state: "WAITING" }],
    };
    (gameDDB.getGame as jest.Mock).mockReturnValueOnce(() =>
      Promise.resolve(fakeGame)
    );
    const response = await doAction(ctxt)({
      id: "4",
      method: "do_action",
      params: { action: "noop", gameId: "g4", playerId: "p1", token: "token1" },
    });
    expect(response).toEqual({
      id: "4",
      error: { code: -1, message: "It's not player p1's turn in game g4" },
    });
  });

  it("returns success for non-win action without changing game", async () => {
    const fakeGame = {
      state: "GAME_LOOP",
      players: [{ id: "p1", token: "token1", state: "THIS_PLAYERS_TURN" }],
    };
    (gameDDB.getGame as jest.Mock).mockReturnValueOnce(() =>
      Promise.resolve(fakeGame)
    );
    const response = await doAction(ctxt)({
      id: "5",
      method: "do_action",
      params: { action: "noop", gameId: "g5", playerId: "p1", token: "token1" },
    });
    expect(response).toEqual({ id: "5", result: {} });
    expect(fakeGame.state).toBe("GAME_LOOP");
    expect(fakeGame.players[0].state).toBe("THIS_PLAYERS_TURN");
  });

  it("handles 'win' action correctly", async () => {
    const fakeGame = {
      state: "GAME_LOOP",
      players: [
        { id: "p1", token: "token1", state: "THIS_PLAYERS_TURN" },
        { id: "p2", token: "token2", state: "WAITING" },
      ],
    };
    (gameDDB.getGame as jest.Mock).mockReturnValueOnce(() =>
      Promise.resolve(fakeGame)
    );
    const response = await doAction(ctxt)({
      id: "6",
      method: "do_action",
      params: { action: "win", gameId: "g6", playerId: "p1", token: "token1" },
    });
    expect(response).toEqual({ id: "6", result: {} });
    expect(fakeGame.state).toBe("GAME_OVER");
    const p1 = fakeGame.players.find((p) => p.id === "p1");
    const p2 = fakeGame.players.find((p) => p.id === "p2");
    expect(p1?.state).toBe("WON");
    expect(p2?.state).toBe("LOST");
  });
});
