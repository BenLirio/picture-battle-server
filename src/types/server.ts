import {
  CreateGameFunction,
  DestroyGameFunction,
  DoActionFunction,
  IsTurnFunction,
  JoinGameFunction,
  SelectCharacterFunction,
} from "./rpc";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export type Ctxt = {
  sample: string;
  ddb: DynamoDBClient;
};

export type CreateGameFunctionCtxt = (ctxt: Ctxt) => CreateGameFunction;

export type JoinGameFunctionCtxt = (ctxt: Ctxt) => JoinGameFunction;

export type DestroyGameFunctionCtxt = (ctxt: Ctxt) => DestroyGameFunction;

export type SelectCharacterFunctionCtxt = (
  ctxt: Ctxt
) => SelectCharacterFunction;

export type IsTurnFunctionCtxt = (ctxt: Ctxt) => IsTurnFunction;

export type DoActionFunctionCtxt = (ctxt: Ctxt) => DoActionFunction;
