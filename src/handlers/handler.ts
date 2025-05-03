import { APIGatewayProxyEvent } from "aws-lambda";
import { formatZodError, successResponse, withErrorHandling } from "./utils";
import { BadRequestError } from "./errors";
import { z } from "zod";
import { RPCRequest, RPCResponse } from "@/types";

export interface Ctxt {
  rpcRequest: RPCRequest;
}

const buildRPCRequest = (event: APIGatewayProxyEvent): RPCRequest => {
  if (!event.body) {
    throw new BadRequestError("Missing request body");
  }
  let body: any;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    throw new BadRequestError("Invalid JSON body");
  }
  try {
    const rpcRequest: RPCRequest = RPCRequest.parse(body);
    return rpcRequest;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(
        `Invalid RPC request: ${formatZodError(error)}`
      );
    }
    throw new BadRequestError("Invalid RPC request");
  }
};

const buildContext = (event: APIGatewayProxyEvent) => {
  const rpcRequest = buildRPCRequest(event);
  return { rpcRequest };
};

export const rpcHandler = async (ctxt: Ctxt): Promise<RPCResponse> => {
  return {
    id: ctxt.rpcRequest.id,
    error: {
      code: 500,
      message: "Not implemented",
    },
  };
};

export const handler = withErrorHandling(async (event: APIGatewayProxyEvent) =>
  successResponse(await rpcHandler(buildContext(event)))
);
