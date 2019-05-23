import { ExaminerWorkSchedule } from '../../../../common/domain/Journal';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import * as createResponse from '../../../../common/application/utils/createResponse';
import { APIGatewayEvent, Context } from 'aws-lambda';
import * as FindJournal from '../../application/service/FindJournal';
import { tokens } from '../__mocks__/authentication-token.mock';
import { Mock, It } from 'typemoq';

describe('getJournal handler', () => {
  const fakeJournal: ExaminerWorkSchedule = {
    examiner: {
      staffNumber: '123',
    },
  };
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;
  let createResponseSpy: jasmine.Spy;

  const moqFindJournal = Mock.ofInstance(FindJournal.findJournal);

  beforeEach(() => {
    createResponseSpy = spyOn(createResponse, 'default');
    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      pathParameters: {
        staffNumber: '12345678',
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_12345678,
      },
    });
    dummyContext = lambdaTestUtils.mockContextCreator(() => null);
    process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = undefined;
    process.env.EMPLOYEE_ID_EXT_KEY = 'extn.employeeId';
    spyOn(FindJournal, 'findJournal').and.callFake(moqFindJournal.object);
  });

  describe('given the FindJournal returns a journal', () => {
    it('should return a successful response with the journal', async () => {
      moqFindJournal.setup(x => x(It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
    });
  });

  describe('given the FindJournal returns null', () => {
    it('should return HTTP 404', async () => {
      moqFindJournal.setup(x => x(It.isAny())).returns(() => Promise.resolve(null));
      createResponseSpy.and.returnValue({ statusCode: 404 });

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(404);
      expect(createResponse.default).toHaveBeenCalledWith({}, 404);
    });
  });

  describe('given the FindJournal throws', () => {
    it('should respond with internal server error', async () => {
      moqFindJournal.setup(x => x(It.isAny())).throws(new Error('Unable to retrieve journal'));
      createResponseSpy.and.returnValue({ statusCode: 500 });

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(500);
      expect(createResponse.default).toHaveBeenCalledWith('Unable to retrieve journal', 500);
    });
  });

  describe('given there is no staffNumber provided', () => {
    it('should indicate a bad request', async () => {
      dummyApigwEvent.pathParameters = {};
      createResponseSpy.and.returnValue({ statusCode: 400 });

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(400);
      expect(createResponse.default).toHaveBeenCalledWith('No staffNumber provided', 400);
    });
  });

  describe('given there is no employeeId in the authorisation token', () => {
    it('should indicate a bad request', async () => {
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_null,
      };
      createResponseSpy.and.returnValue({ statusCode: 401 });

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(401);
      expect(createResponse.default).toHaveBeenCalledWith('Invalid authorisation token', 401);
    });
  });

  describe('obtaining employee ID from token with array or non-array extension attributes', () => {
    it('should get the employee ID from when the property is an array', async () => {
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_12345678,
      };
      createResponseSpy.and.returnValue({ statusCode: 200 });
      moqFindJournal.setup(x => x(It.isAny())).returns(() => Promise.resolve(fakeJournal));

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
    });
    it('should get the employee ID from when the property is a string', async () => {
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_notArray,
      };
      process.env.EMPLOYEE_ID_EXT_KEY = 'employeeid';
      createResponseSpy.and.returnValue({ statusCode: 200 });
      moqFindJournal.setup(x => x(It.isAny())).returns(() => Promise.resolve(fakeJournal));

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
    });
  });

  describe('given the staff number does not match the employeeId in the authorisation token', () => {
    it('should indicate a bad request', async () => {
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_01234567,
      };
      createResponseSpy.and.returnValue({ statusCode: 403 });

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(403);
      expect(createResponse.default).toHaveBeenCalledWith('Invalid staffNumber', 403);
    });
  });

  describe('given the enviroment variable is set to skip employee ID verification', () => {
    it('should return a successful response with the journal when the correct employee ID is sent', async () => {
      process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = 'true';
      moqFindJournal.setup(x => x(It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
    });
    it('should return a successful response with the journal when no employee ID is sent', async () => {
      process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = 'true';
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_null,
      };
      moqFindJournal.setup(x => x(It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
    });
    it('should return a successful response with the journal when a different employee ID is sent', async () => {
      process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = 'true';
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_01234567,
      };
      moqFindJournal.setup(x => x(It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
    });
  });
});
