import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { BadRequestError } from "../errors";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

export const successResponse = (body: any): APIGatewayProxyResult => ({
  statusCode: 200,
  headers,
  body: JSON.stringify(body),
});

const errorResponse = (
  statusCode: number,
  message: string
): APIGatewayProxyResult => ({
  statusCode,
  headers,
  body: JSON.stringify({ message }),
});

export const withErrorHandling = (
  fn: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
): ((event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>) => {
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    try {
      return await fn(event);
    } catch (error) {
      console.error("Error in withErrorHandling:", error);
      if (error instanceof BadRequestError) {
        return errorResponse(error.statusCode, error.message);
      }
      return errorResponse(500, "Internal Server Error");
    }
  };
};
