import { selectCharacter } from "../../../src/handlers/methods/selectCharacter";
import { gameDDB, Game } from "../../../src/handlers/database/game";

describe("selectCharacter", () => {
  const ctxt = { ddb: {} } as any;
  let mockGetGame: jest.SpyInstance;
  let mockUpdateGame: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGame = jest.spyOn(gameDDB, "getGame");
    mockUpdateGame = jest.spyOn(gameDDB, "updateGame");
  });

  it("successfully selects character without completing all selections", async () => {
    const initialGame: Game = {
      id: "game1",
      name: "Test Game",
      state: "SELECTING_CHARACTERS",
      players: [
        {
          id: "p1",
          name: "Alice",
          token: "token1",
          state: "SELECTING_CHARACTER",
        },
        {
          id: "p2",
          name: "Bob",
          token: "token2",
          state: "SELECTING_CHARACTER",
        },
      ],
    };
    const getGameFunc = jest.fn().mockResolvedValue(initialGame);
    mockGetGame.mockReturnValue(getGameFunc);
    const updateGameFunc = jest.fn().mockResolvedValue(undefined);
    mockUpdateGame.mockReturnValue(updateGameFunc);

    const handler = selectCharacter(ctxt);
    const response = await handler({
      method: "select_character",
      id: 1,
      params: {
        character: "X",
        gameId: "game1",
        playerId: "p1",
        token: "token1",
      },
    });

    expect(response.id).toBe(1);
    expect(response.result).toEqual({});
    expect(mockGetGame).toHaveBeenCalledWith(ctxt);
    expect(getGameFunc).toHaveBeenCalledWith("game1");
    expect(mockUpdateGame).toHaveBeenCalledWith(ctxt);
    expect(updateGameFunc).toHaveBeenCalledWith(
      expect.objectContaining({
        state: "SELECTING_CHARACTERS",
        players: expect.arrayContaining([
          expect.objectContaining({
            id: "p1",
            character: "X",
            state: "SELECTED_CHARACTER",
          }),
        ]),
      })
    );
  });

  it("completes selection and transitions to GAME_LOOP when last player selects", async () => {
    const initialGame: Game = {
      id: "game2",
      name: "Test Game",
      state: "SELECTING_CHARACTERS",
      players: [
        {
          id: "p1",
          name: "Alice",
          token: "token1",
          state: "SELECTING_CHARACTER",
        },
      ],
    };
    const getGameFunc = jest.fn().mockResolvedValue(initialGame);
    mockGetGame.mockReturnValue(getGameFunc);
    const updateGameFunc = jest.fn().mockResolvedValue(undefined);
    mockUpdateGame.mockReturnValue(updateGameFunc);

    const handler = selectCharacter(ctxt);
    const response = await handler({
      method: "select_character",
      id: 2,
      params: {
        character: "Y",
        gameId: "game2",
        playerId: "p1",
        token: "token1",
      },
    });

    expect(response.id).toBe(2);
    expect(response.result).toEqual({});
    expect(updateGameFunc).toHaveBeenCalledWith(
      expect.objectContaining({
        state: "GAME_LOOP",
        players: expect.arrayContaining([
          expect.objectContaining({
            id: "p1",
            character: "Y",
            state: "THIS_PLAYERS_TURN",
          }),
        ]),
      })
    );
  });

  it("returns error when player not found", async () => {
    const initialGame: Game = {
      id: "game3",
      name: "Test Game",
      state: "SELECTING_CHARACTERS",
      players: [],
    };
    mockGetGame.mockReturnValue(jest.fn().mockResolvedValue(initialGame));

    const handler = selectCharacter(ctxt);
    const response = await handler({
      method: "select_character",
      id: 3,
      params: { character: "Z", gameId: "game3", playerId: "pX", token: "tok" },
    });

    expect(response.id).toBe(3);
    expect(response.error).toEqual({
      code: -1,
      message: `Player with ID pX not found in game game3`,
    });
    expect(mockUpdateGame).not.toHaveBeenCalled();
  });

  it("returns error when token mismatches", async () => {
    const initialGame: Game = {
      id: "game4",
      name: "Test Game",
      state: "SELECTING_CHARACTERS",
      players: [
        {
          id: "p1",
          name: "Alice",
          token: "good-token",
          state: "SELECTING_CHARACTER",
        },
      ],
    };
    mockGetGame.mockReturnValue(jest.fn().mockResolvedValue(initialGame));

    const handler = selectCharacter(ctxt);
    const response = await handler({
      method: "select_character",
      id: 4,
      params: {
        character: "A",
        gameId: "game4",
        playerId: "p1",
        token: "bad-token",
      },
    });

    expect(response.id).toBe(4);
    expect(response.error).toEqual({
      code: -1,
      message: `Token mismatch for player p1 in game game4`,
    });
    expect(mockUpdateGame).not.toHaveBeenCalled();
  });

  it("returns error when character already selected", async () => {
    const initialGame: Game = {
      id: "game5",
      name: "Test Game",
      state: "SELECTING_CHARACTERS",
      players: [{ id: "p1", name: "Alice", token: "tok", character: "pre" }],
    } as any;
    mockGetGame.mockReturnValue(jest.fn().mockResolvedValue(initialGame));

    const handler = selectCharacter(ctxt);
    const response = await handler({
      method: "select_character",
      id: 5,
      params: { character: "B", gameId: "game5", playerId: "p1", token: "tok" },
    });

    expect(response.id).toBe(5);
    expect(response.error).toEqual({
      code: -1,
      message: `Player p1 has already selected a character`,
    });
    expect(mockUpdateGame).not.toHaveBeenCalled();
  });

  it("transitions with multiple players, sets all to WAITING_FOR_TURN and one to THIS_PLAYERS_TURN", async () => {
    const initialGame: Game = {
      id: "game6",
      name: "Test Game",
      state: "SELECTING_CHARACTERS",
      players: [
        {
          id: "p1",
          name: "Alice",
          token: "t1",
          state: "SELECTED_CHARACTER",
          character: "X",
        },
        {
          id: "p2",
          name: "Bob",
          token: "t2",
          state: "SELECTED_CHARACTER",
          character: "Y",
        },
        { id: "p3", name: "Carol", token: "t3", state: "SELECTING_CHARACTER" },
      ],
    } as any;
    mockGetGame.mockReturnValue(jest.fn().mockResolvedValue(initialGame));
    const updateGameFunc = jest.fn().mockResolvedValue(undefined);
    mockUpdateGame.mockReturnValue(updateGameFunc);
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);

    const handler = selectCharacter(ctxt);
    const response = await handler({
      method: "select_character",
      id: 6,
      params: { character: "Z", gameId: "game6", playerId: "p3", token: "t3" },
    });

    expect(response.id).toBe(6);
    expect(response.result).toEqual({});
    expect(updateGameFunc).toHaveBeenCalledWith(
      expect.objectContaining({ state: "GAME_LOOP" })
    );

    const updatedGameArg = updateGameFunc.mock.calls[0][0];
    expect(
      updatedGameArg.players.filter((p: any) => p.state === "THIS_PLAYERS_TURN")
    ).toHaveLength(1);
    expect(
      updatedGameArg.players.filter((p: any) => p.state === "WAITING_FOR_TURN")
    ).toHaveLength(2);
    randomSpy.mockRestore();
  });
});
