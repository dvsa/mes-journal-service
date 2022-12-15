export class TestCentreNotFoundError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, TestCentreNotFoundError.prototype);
  }
}

export class TestCentreIdNotFoundError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, TestCentreIdNotFoundError.prototype);
  }
}
