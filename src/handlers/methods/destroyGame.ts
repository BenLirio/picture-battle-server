import { Ctxt, DestroyGameFunctionCtxt, DestroyGameRequest } from "@/types";

export const destroyGame: DestroyGameFunctionCtxt =
  (ctxt: Ctxt) => async (request: DestroyGameRequest) => {
    return {
      id: request.id,
      error: {
        code: -32601,
        message: "not implemented",
      },
    };
  };
