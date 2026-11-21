export class InvalidCoaError extends Error {}

export class RequestLimitError extends Error {
  constructor(
    message: string,
    public status: 413 | 414
  ) {
    super(message);
  }
}
