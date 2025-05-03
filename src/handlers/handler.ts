import {
  AllRequests,
  CreateGameRequestSchema,
  Ctxt,
  DestroyGameRequestSchema,
  JoinGameRequestSchema,
} from "@/types";
import { APIGatewayProxyEvent } from "aws-lambda";
import { BadRequestError } from "./errors";
import { formatZodError, successResponse, withErrorHandling } from "./utils";
import z from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { createGame, destroyGame, joinGame } from "./methods";

export const rpcHandler = async (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    throw new BadRequestError("Missing request body");
  }
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    throw new BadRequestError("Invalid JSON format");
  }
  try {
    AllRequests.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(`Invalid params: ${formatZodError(error)}`);
    }
    throw new BadRequestError("Internal error");
  }

  const ddb = new DynamoDBClient({});
  const ctxt: Ctxt = { sample: "context", ddb };

  if (CreateGameRequestSchema.safeParse(body).success) {
    return await createGame(ctxt)(CreateGameRequestSchema.parse(body));
  }
  if (JoinGameRequestSchema.safeParse(body).success) {
    return await joinGame(ctxt)(JoinGameRequestSchema.parse(body));
  }
  if (DestroyGameRequestSchema.safeParse(body).success) {
    return await destroyGame(ctxt)(DestroyGameRequestSchema.parse(body));
  }

  throw new Error("No matching function found");
};

export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) =>
  successResponse(await rpcHandler(event))
);
