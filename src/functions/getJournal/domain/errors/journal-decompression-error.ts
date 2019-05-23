export class JournalDecompressionError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, JournalDecompressionError.prototype);
  }
}
