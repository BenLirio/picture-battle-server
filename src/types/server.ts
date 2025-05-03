import {
  CreateGameFunction,
  DestroyGameFunction,
  JoinGameFunction,
} from "./rpc";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export type Ctxt = {
  sample: string;
  ddb: DynamoDBClient;
};

export type CreateGameFunctionCtxt = (ctxt: Ctxt) => CreateGameFunction;

export type JoinGameFunctionCtxt = (ctxt: Ctxt) => JoinGameFunction;

export type DestroyGameFunctionCtxt = (ctxt: Ctxt) => DestroyGameFunction;
