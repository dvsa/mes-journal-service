export class TestCentreNotFoundError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, TestCentreNotFoundError.prototype);
  }
}

export class TestCentreCostCodeNotFoundError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, TestCentreCostCodeNotFoundError.prototype);
  }
}
