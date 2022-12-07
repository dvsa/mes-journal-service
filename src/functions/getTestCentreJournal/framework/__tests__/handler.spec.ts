import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { handler } from '../handler';

const lambdaTestUtils = require('aws-lambda-test-utils');
import * as createResponse from '../../../../common/application/utils/createResponse';
import { APIGatewayEvent, APIGatewayProxyEvent, Context } from 'aws-lambda';
import * as FindTestCentreJournal from '../../../../common/application/journal/FindJournal';
import * as FindTestCentre from '../../../../common/application/test-centre/FindTestCentreByStaffNumber';
import { Mock, It } from 'typemoq';
import { tokens } from '../../../getJournal/framework/__mocks__/authentication-token.mock';
import { TestCentreDetail } from '../../../../common/domain/TestCentreDetailRecord';
import { TestCentreNotFoundError } from '../../../../common/domain/errors/test-centre-not-found-error';

describe('getTestCentreJournal handler', () => {
  const fakeTestCentre: TestCentreDetail = {
    staffNumber: '123',
    examiners: [
      { staffNumber: '123', name: 'Some User' },
    ],
    testCentreIDs: [1234],
  };

  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;
  let createResponseSpy: jasmine.Spy;

  const moqFindTestCentreDetail = Mock.ofInstance(FindTestCentre.findTestCentreDetail);

  beforeEach(() => {
    moqFindTestCentreDetail.reset();

    createResponseSpy = spyOn(createResponse, 'default');
    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      headers: {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_01234567,
      },
    });
    dummyApigwEvent.requestContext.authorizer = { staffNumber: '12345677' };
    dummyContext = lambdaTestUtils.mockContextCreator(() => null);
    spyOn(FindTestCentre, 'findTestCentreDetail').and.callFake(moqFindTestCentreDetail.object);
  });

  describe('given there is no staffNumber in authorizer response', () => {
    it('should indicate an UNAUTHORIZED request', async () => {
      createResponseSpy.and.returnValue({ statusCode: 401 });
      const resp = await handler({ requestContext: { authorizer: {} } } as APIGatewayProxyEvent);
      expect(resp.statusCode).toEqual(401);
      expect(createResponse.default).toHaveBeenCalledWith('No staff number found in request context', 401);
    });
  });

  describe('given the FindTestCentreJournal returns a test centre row', () => {
    it('should return a successful response with the test centre detail', async () => {
      spyOn(FindTestCentreJournal, 'findJournalWithResponse')
        .and.returnValue(Promise.resolve({} as ExaminerWorkSchedule));
      moqFindTestCentreDetail.setup(x => x(It.isAny())).returns(() => Promise.resolve(fakeTestCentre));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith({
        staffNumber: '123',
        examiners: [
          {
            staffNumber: '123',
            name: 'Some User',
            journal: null,
            error: undefined,
          },
        ],
        testCentres: [],
      });
    });
  });

  describe('given FindTestCentreJournal throws a TestCentreNotFoundError error', () => {
    it('should return HTTP 404 NOT_FOUND', async () => {
      moqFindTestCentreDetail.setup(x => x(It.isAny())).throws(new TestCentreNotFoundError());
      createResponseSpy.and.returnValue({ statusCode: 404 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(404);
      expect(createResponse.default)
        .toHaveBeenCalledWith('User does not have a corresponding row in test centre table', 404);
    });
  });

  describe('given the FindTestCentreJournal throws', () => {
    it('should respond with internal server error', async () => {
      moqFindTestCentreDetail.setup(x => x(It.isAny())).throws(new Error('Unable to retrieve test centre journal'));
      createResponseSpy.and.returnValue({ statusCode: 500 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(500);
      expect(createResponse.default).toHaveBeenCalledWith('Unable to retrieve test centre journal', 500);
    });
  });

  describe('given the FindTestCentreJournal returns null', () => {
    it('should respond with no content status code', async () => {
      moqFindTestCentreDetail.setup(x => x(It.isAny())).returns(() => Promise.resolve(null));
      createResponseSpy.and.returnValue({ statusCode: 204 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(204);
      expect(createResponse.default).toHaveBeenCalledWith({}, 204);
    });
  });
});
