export class ClaimsUnavailableError extends Error {
  constructor() {
    super("Claims are temporarily unavailable");
  }
}
