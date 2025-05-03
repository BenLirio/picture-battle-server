import z from "zod";

export const RPCResult = z.any();
export type RPCResult = z.infer<typeof RPCResult>;

export const RPCError = z.object({
  code: z.number(),
  message: z.string(),
});
export type RPCError = z.infer<typeof RPCError>;

export const RPCMethod = z.enum(["none"]);
export type RPCMethod = z.infer<typeof RPCMethod>;

export const RPCParams = z.any();
export type RPCParams = z.infer<typeof RPCParams>;

export const RPCId = z.number();
export type RPCId = z.infer<typeof RPCId>;

export const RPCRequest = z.object({
  method: RPCMethod,
  params: RPCParams,
  id: RPCId,
});
export type RPCRequest = z.infer<typeof RPCRequest>;

export const RPCResponse = z.object({
  id: RPCId,
  result: RPCResult.optional(),
  error: RPCError.optional(),
});
export type RPCResponse = z.infer<typeof RPCResponse>;
