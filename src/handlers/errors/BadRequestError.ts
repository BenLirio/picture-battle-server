export class BadRequestError extends Error {
  statusCode = 400;

  constructor(message: string = "Bad Request") {
    super(message);
    this.name = "BadRequestError";
  }
}
