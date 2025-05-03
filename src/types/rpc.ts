import z from "zod";

const RPCErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
});
export type RPCError = z.infer<typeof RPCErrorSchema>;

const CommonRPCRequestSchema = z.object({
  id: z.number(),
  method: z.string(),
});

const CommonResponseSchema = z.object({
  id: z.number(),
  error: RPCErrorSchema.optional(),
});

const buildRequestSchema = <T extends z.AnyZodObject>(
  method: string,
  params: T
) =>
  z.intersection(
    CommonRPCRequestSchema,
    z.object({
      method: z.literal(method),
      params,
    })
  );
const buildResponseSchema = <T extends z.AnyZodObject>(result: T) =>
  z.intersection(
    CommonResponseSchema,
    z.object({
      result: result.optional(),
    })
  );

/**
 * init_game
 */
export const CreateGameRequestSchema = buildRequestSchema(
  "create_game",
  z.object({})
);
export type CreateGameRequest = z.infer<typeof CreateGameRequestSchema>;
export const CreateGameResponseSchema = buildResponseSchema(
  z.object({
    gameId: z.string(),
  })
);
export type CreateGameResponse = z.infer<typeof CreateGameResponseSchema>;
export const CreateGameFunctionSchema = z
  .function()
  .args(CreateGameRequestSchema)
  .returns(z.promise(CreateGameResponseSchema));
export type CreateGameFunction = z.infer<typeof CreateGameFunctionSchema>;

/**
 * init_game
 */
export const JoinGameRequestSchema = buildRequestSchema(
  "join_game",
  z.object({
    gameId: z.string(),
    name: z.string(),
  })
);
export type JoinGameRequest = z.infer<typeof JoinGameRequestSchema>;
export const JoinGameResponseSchema = buildResponseSchema(
  z.object({
    gameId: z.string(),
    name: z.string(),
    token: z.string(),
  })
);
export type JoinGameResponse = z.infer<typeof JoinGameResponseSchema>;
export const JoinGameFunctionSchema = z
  .function()
  .args(JoinGameRequestSchema)
  .returns(z.promise(JoinGameResponseSchema));
export type JoinGameFunction = z.infer<typeof JoinGameFunctionSchema>;

/**
 * destroy_game
 */
export const DestroyGameRequestSchema = buildRequestSchema(
  "destroy_game",
  z.object({
    gameId: z.string(),
  })
);

export type DestroyGameRequest = z.infer<typeof DestroyGameRequestSchema>;
export const DestroyGameResponseSchema = buildResponseSchema(
  z.object({
    gameId: z.string(),
  })
);
export type DestroyGameResponse = z.infer<typeof DestroyGameResponseSchema>;
export const DestroyGameFunctionSchema = z
  .function()
  .args(DestroyGameRequestSchema)
  .returns(z.promise(DestroyGameResponseSchema));
export type DestroyGameFunction = z.infer<typeof DestroyGameFunctionSchema>;

/**
 * All Functions
 */
export const AllRequests = z.union([
  CreateGameRequestSchema,
  JoinGameRequestSchema,
  DestroyGameRequestSchema,
]);
