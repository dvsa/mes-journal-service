export class JournalNotFoundError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, JournalNotFoundError.prototype);
  }
}
