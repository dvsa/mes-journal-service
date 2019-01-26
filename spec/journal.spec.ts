import { startSlsOffline, stopSlsOffline } from './helpers/integration-test-lifecycle';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe('integration test', () => {
  beforeAll((done) => {
    startSlsOffline((err: any) => {
      if (err) {
        console.error(err);
      }
      done();
    });
  });
  afterAll(() => {
    stopSlsOffline();
  });

  it('should run', () => {
    expect(true).toBe(true);
  });
});
