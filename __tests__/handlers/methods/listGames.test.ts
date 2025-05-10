import { listGames } from "../../../src/handlers/methods/listGames";
import { gameDDB } from "../../../src/handlers/database/game";

describe("listGames", () => {
  const ctxt = { ddb: {} } as any;
  let mockListGames: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockListGames = jest.spyOn(gameDDB, "listGames");
  });

  it("returns all games when no filter is specified", async () => {
    const games = [
      { id: "g1", state: "WAITING_FOR_PLAYERS" },
      { id: "g2", state: "GAME_LOOP" },
    ];
    const listFunc = jest.fn().mockResolvedValue(games);
    mockListGames.mockReturnValue(listFunc);

    const handler = listGames(ctxt);
    const response = await handler({
      method: "list_games",
      id: 1,
      params: {},
    });

    expect(response.id).toBe(1);
    expect(response.result).toEqual({ games });
    expect(mockListGames).toHaveBeenCalledWith(ctxt);
    expect(listFunc).toHaveBeenCalledWith(undefined);
  });

  it("returns filtered games when stateFilter is specified", async () => {
    const filteredGames = [{ id: "g2", state: "GAME_LOOP" }];
    const listFunc = jest.fn().mockResolvedValue(filteredGames);
    mockListGames.mockReturnValue(listFunc);

    const handler = listGames(ctxt);
    const response = await handler({
      method: "list_games",
      id: 2,
      params: { stateFilter: "GAME_LOOP" },
    });

    expect(response.id).toBe(2);
    expect(response.result).toEqual({ games: filteredGames });
    expect(mockListGames).toHaveBeenCalledWith(ctxt);
    expect(listFunc).toHaveBeenCalledWith("GAME_LOOP");
  });
});
