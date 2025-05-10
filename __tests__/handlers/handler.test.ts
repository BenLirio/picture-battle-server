import { APIGatewayProxyEvent } from "aws-lambda";
import { rpcHandler, handler } from "../../src/handlers/handler";
import { BadRequestError } from "../../src/handlers/errors";
import { createGame, joinGame, destroyGame } from "../../src/handlers/methods";

jest.mock("../../src/handlers/methods");
const mockCreateGame = createGame as jest.Mock;
const mockJoinGame = joinGame as jest.Mock;
const mockDestroyGame = destroyGame as jest.Mock;

beforeEach(() => {
  mockCreateGame.mockReset();
  mockJoinGame.mockReset();
  mockDestroyGame.mockReset();

  mockCreateGame.mockImplementation((_ctxt: any) => async ({ id }: any) => ({
    id,
    result: { gameId: "test-game-id" },
  }));
  mockJoinGame.mockImplementation((_ctxt: any) => async ({ id }: any) => ({
    id,
    result: { token: "test-token" },
  }));
  mockDestroyGame.mockImplementation(
    (_ctxt: any) =>
      async ({ params, id }: any) => ({
        id,
        result: { gameId: params.gameId },
      })
  );
});

describe("rpcHandler", () => {
  it("throws BadRequestError if body is missing", async () => {
    await expect(rpcHandler({} as any)).rejects.toBeInstanceOf(BadRequestError);
  });

  it("throws BadRequestError if body is invalid JSON", async () => {
    const event = { body: "invalid json" } as APIGatewayProxyEvent;
    await expect(rpcHandler(event)).rejects.toBeInstanceOf(BadRequestError);
  });

  it("throws BadRequestError if params invalid", async () => {
    const event = {
      body: JSON.stringify({ method: "foo", params: {}, id: 1 }),
    } as APIGatewayProxyEvent;
    await expect(rpcHandler(event)).rejects.toBeInstanceOf(BadRequestError);
  });

  it("calls createGame when method is create_game", async () => {
    const payload = require("../../test_data/create_game.json");
    const event = { body: JSON.stringify(payload) } as APIGatewayProxyEvent;
    const response = await rpcHandler(event);
    expect(mockCreateGame).toHaveBeenCalled();
    expect(response).toEqual({
      id: payload.id,
      result: { gameId: "test-game-id" },
    });
  });

  it("calls joinGame when method is join_game", async () => {
    const payload = require("../../test_data/join_game.json");
    const event = { body: JSON.stringify(payload) } as APIGatewayProxyEvent;
    const response = await rpcHandler(event);
    expect(mockJoinGame).toHaveBeenCalled();
    expect(response).toEqual({
      id: payload.id,
      result: { token: "test-token" },
    });
  });

  it("calls destroyGame when method is destroy_game", async () => {
    const payload = {
      method: "destroy_game",
      params: { gameId: "123" },
      id: 1,
    };
    const event = { body: JSON.stringify(payload) } as APIGatewayProxyEvent;
    const response = await rpcHandler(event);
    expect(mockDestroyGame).toHaveBeenCalled();
    expect(response).toEqual({ id: payload.id, result: { gameId: "123" } });
  });
});

describe("handler", () => {
  it("wraps rpcHandler result in successResponse", async () => {
    const payload = require("../../test_data/create_game.json");
    const event = { body: JSON.stringify(payload) } as APIGatewayProxyEvent;
    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.result.gameId).toEqual("test-game-id");
  });

  it("handles errors via withErrorHandling", async () => {
    const faultyEvent = {} as any;
    const result = await handler(faultyEvent);
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBeDefined();
  });
});
