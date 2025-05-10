import z from "zod";

const RPCErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
});
export type RPCError = z.infer<typeof RPCErrorSchema>;

const IDSchema = z.union([z.string(), z.number()]);

const CommonRequestSchema = z.object({
  id: IDSchema,
  method: z.string(),
});
export type CommonRequest = z.infer<typeof CommonRequestSchema>;

const CommonResponseSchema = z.object({
  id: IDSchema,
  error: RPCErrorSchema.optional(),
});
export type CommonResponse = z.infer<typeof CommonResponseSchema>;

const buildRequestSchema = <T extends z.AnyZodObject>(
  method: string,
  params: T
) =>
  z.intersection(
    CommonRequestSchema,
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
 * create_game
 */
export const CreateGameRequestBodyFields = {
  name: z.string(),
};
export const CreateGameRequestBodySchema = z.object(
  CreateGameRequestBodyFields
);
export type CreateGameRequestBody = z.infer<typeof CreateGameRequestBodySchema>;
export const CreateGameRequestSchema = buildRequestSchema(
  "create_game",
  CreateGameRequestBodySchema
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
 * join_game
 */
export const JoinGameRequestBodyFields = {
  gameId: z.string(),
  name: z.string(),
};
export const JoinGameRequestBodySchema = z.object(JoinGameRequestBodyFields);
export type JoinGameRequestBody = z.infer<typeof JoinGameRequestBodySchema>;
export const JoinGameRequestSchema = buildRequestSchema(
  "join_game",
  JoinGameRequestBodySchema
);
export type JoinGameRequest = z.infer<typeof JoinGameRequestSchema>;
export const JoinGameResponseSchema = buildResponseSchema(
  z.object({
    id: z.string(),
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
 * select_character
 */
export const SelectCharacterRequestBodyFields = {
  gameId: z.string(),
  token: z.string(),
  playerId: z.string(),
  character: z.string(),
};
export const SelectCharacterRequestBodySchema = z.object(
  SelectCharacterRequestBodyFields
);
export type SelectCharacterRequestBody = z.infer<
  typeof SelectCharacterRequestBodySchema
>;
export const SelectCharacterRequestSchema = buildRequestSchema(
  "select_character",
  SelectCharacterRequestBodySchema
);
export type SelectCharacterRequest = z.infer<
  typeof SelectCharacterRequestSchema
>;
export const SelectCharacterResponseSchema = buildResponseSchema(z.object({}));
export type SelectCharacterResponse = z.infer<
  typeof SelectCharacterResponseSchema
>;
export const SelectCharacterFunctionSchema = z
  .function()
  .args(SelectCharacterRequestSchema)
  .returns(z.promise(SelectCharacterResponseSchema));
export type SelectCharacterFunction = z.infer<
  typeof SelectCharacterFunctionSchema
>;

/**
 * destroy_game
 */
export const DestroyGameRequestBodyFields = {
  gameId: z.string(),
};
export const DestroyGameRequestBodySchema = z.object(
  DestroyGameRequestBodyFields
);
export type DestroyGameRequestBody = z.infer<
  typeof DestroyGameRequestBodySchema
>;
export const DestroyGameRequestSchema = buildRequestSchema(
  "destroy_game",
  DestroyGameRequestBodySchema
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
 * is_turn
 */
export const IsTurnRequestBodyFields = {
  gameId: z.string(),
  token: z.string(),
  playerId: z.string(),
};
export const IsTurnRequestBodySchema = z.object(IsTurnRequestBodyFields);
export type IsTurnRequestBody = z.infer<typeof IsTurnRequestBodySchema>;
export const IsTurnRequestSchema = buildRequestSchema(
  "is_turn",
  IsTurnRequestBodySchema
);
export type IsTurnRequest = z.infer<typeof IsTurnRequestSchema>;
export const IsTurnResponseSchema = buildResponseSchema(
  z.object({
    isTurn: z.boolean(),
  })
);
export type IsTurnResponse = z.infer<typeof IsTurnResponseSchema>;
export const IsTurnFunctionSchema = z
  .function()
  .args(IsTurnRequestSchema)
  .returns(z.promise(IsTurnResponseSchema));
export type IsTurnFunction = z.infer<typeof IsTurnFunctionSchema>;

/**
 * do_action
 */
export const DoActionRequestBodyFields = {
  gameId: z.string(),
  token: z.string(),
  playerId: z.string(),
  action: z.string(),
};
export const DoActionRequestBodySchema = z.object(DoActionRequestBodyFields);
export type DoActionRequestBody = z.infer<typeof DoActionRequestBodySchema>;
export const DoActionRequestSchema = buildRequestSchema(
  "do_action",
  DoActionRequestBodySchema
);
export type DoActionRequest = z.infer<typeof DoActionRequestSchema>;
export const DoActionResponseSchema = buildResponseSchema(z.object({}));
export type DoActionResponse = z.infer<typeof DoActionResponseSchema>;
export const DoActionFunctionSchema = z
  .function()
  .args(DoActionRequestSchema)
  .returns(z.promise(DoActionResponseSchema));
export type DoActionFunction = z.infer<typeof DoActionFunctionSchema>;

/**
 * list_games
 */
export const GAME_STATES = [
  "WAITING_FOR_PLAYERS",
  "SELECTING_CHARACTERS",
  "GAME_LOOP",
  "GAME_OVER",
] as const;
export type GameState = (typeof GAME_STATES)[number];
export const ListGamesRequestSchema = buildRequestSchema(
  "list_games",
  z.object({
    stateFilter: z.enum(GAME_STATES).optional(),
  })
);
export type ListGamesRequest = z.infer<typeof ListGamesRequestSchema>;
export const ListGamesResponseSchema = buildResponseSchema(
  z.object({
    games: z.array(z.object({ id: z.string(), state: z.enum(GAME_STATES) })),
  })
);
export type ListGamesResponse = z.infer<typeof ListGamesResponseSchema>;
export const ListGamesFunctionSchema = z
  .function()
  .args(ListGamesRequestSchema)
  .returns(z.promise(ListGamesResponseSchema));
export type ListGamesFunction = z.infer<typeof ListGamesFunctionSchema>;

/**
 * All Functions
 */
export const AllRequests = z.union([
  CreateGameRequestSchema,
  JoinGameRequestSchema,
  DestroyGameRequestSchema,
  SelectCharacterRequestSchema,
  IsTurnRequestSchema,
  ListGamesRequestSchema,
]);
