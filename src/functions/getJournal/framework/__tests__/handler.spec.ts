import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import * as createResponse from '../../../../common/application/utils/createResponse';
import { APIGatewayEvent, Context } from 'aws-lambda';
import * as FindJournal from '../../../../common/application/journal/FindJournal';
import { tokens } from '../__mocks__/authentication-token.mock';
import { Mock, It, Times } from 'typemoq';
import { JournalNotFoundError } from '../../../../common/domain/errors/journal-not-found-error';

describe('getJournal handler', () => {
  const fakeJournal: ExaminerWorkSchedule = {
    examiner: {
      staffNumber: '123',
    },
  };
  let dummyApigwEvent: APIGatewayEvent;
  let createResponseSpy: jasmine.Spy;

  const moqFindJournal = Mock.ofInstance(FindJournal.findJournal);

  beforeEach(() => {
    moqFindJournal.reset();

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
    dummyApigwEvent.requestContext.authorizer = { staffNumber: '12345678' };
    process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = undefined;
    spyOn(FindJournal, 'findJournal').and.callFake(moqFindJournal.object);
  });

  describe('given the FindJournal returns a journal', () => {
    it('should return a successful response with the journal', async () => {
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
    });
  });

  describe('given FindJournal throws a JournalNotFound error', () => {
    it('should return HTTP 404 NOT_FOUND', async () => {
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).throws(new JournalNotFoundError());
      createResponseSpy.and.returnValue({ statusCode: 404 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(404);
      expect(createResponse.default).toHaveBeenCalledWith({}, 404);
    });
  });

  describe('given FindJournal returns null', () => {
    it('should return HTTP 304 NOT_MODIFIED', async () => {
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve(null));
      createResponseSpy.and.returnValue({ statusCode: 304 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(304);
      expect(createResponse.default).toHaveBeenCalledWith({}, 304);
    });
  });

  describe('given the FindJournal throws', () => {
    it('should respond with internal server error', async () => {
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).throws(new Error('Unable to retrieve journal'));
      createResponseSpy.and.returnValue({ statusCode: 500 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(500);
      expect(createResponse.default).toHaveBeenCalledWith('Unable to retrieve journal', 500);
    });
  });

  describe('given there is no staffNumber provided', () => {
    it('should indicate a bad request', async () => {
      dummyApigwEvent.pathParameters = {};
      createResponseSpy.and.returnValue({ statusCode: 400 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(400);
      expect(createResponse.default).toHaveBeenCalledWith('No staffNumber provided', 400);
    });
  });

  describe('obtaining employee ID from request context', () => {
    it('should obtain a the employee ID from the request context, not the JWT', async () => {
      dummyApigwEvent.requestContext.authorizer = {
        staffNumber: '999999',
      };
      dummyApigwEvent.pathParameters = { staffNumber: '999999' };
      createResponseSpy.and.returnValue({ statusCode: 200 });
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve(fakeJournal));

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
      moqFindJournal.verify(x => x(It.isValue('999999'), It.isAny()), Times.once());
    });
    describe('given there is no employeeId in the request context', () => {
      it('should indicate a bad request', async () => {
        dummyApigwEvent.headers = {
          'Content-Type': 'application/json',
          Authorization: tokens.employeeId_12345678,
        };
        dummyApigwEvent.requestContext.authorizer = null;
        createResponseSpy.and.returnValue({ statusCode: 401 });

        const resp = await handler(dummyApigwEvent);

        expect(resp.statusCode).toBe(401);
        expect(createResponse.default).toHaveBeenCalledWith('No staff number found in request context', 401);
      });
    });
  });

  describe('given the staff number does not match the employeeId in the authorisation token', () => {
    it('should indicate a bad request', async () => {
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_01234567,
      };
      dummyApigwEvent.requestContext.authorizer = { staffNumber: '999999' };
      createResponseSpy.and.returnValue({ statusCode: 403 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(403);
      expect(createResponse.default).toHaveBeenCalledWith('Invalid staffNumber', 403);
    });
  });

  describe('given the enviroment variable is set to skip employee ID verification', () => {
    it('should return a successful response with the journal when the correct employee ID is sent', async () => {
      process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = 'true';
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
    });
    it('should return a successful response with the journal when no employee ID is sent', async () => {
      process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = 'true';
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_null,
      };
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
    });
    it('should return a successful response with the journal when a different employee ID is sent', async () => {
      process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = 'true';
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_01234567,
      };
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
    });
  });

  describe('accepting If-Modified-Since header', () => {
    it('should parse a valid If-Modified-Since and pass it to findJournal as a timestamp', async () => {
      process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = 'true';
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_01234567,
        'If-Modified-Since': 'Thu, 23 May 2019 15:09:17 GMT',
      };
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
      moqFindJournal.verify(x => x(It.isValue('12345678'), It.isValue(1558624157000)), Times.once());
    });
    it('should parse If-Modified-Since header in any casing', async () => {
      process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = 'true';
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_01234567,
        'If-MoDiFiEd-SiNce': 'Thu, 23 May 2019 15:09:17 GMT',
      };
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      await handler(dummyApigwEvent);

      moqFindJournal.verify(x => x(It.isValue('12345678'), It.isValue(1558624157000)), Times.once());
    });
    it('should not error on a non-parsable If-Modified-Since header and pass instead of a timestamp', async () => {
      process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = 'true';
      dummyApigwEvent.headers = {
        'Content-Type': 'application/json',
        Authorization: tokens.employeeId_01234567,
        'If-Modified-Since': 'nonesense',
      };
      moqFindJournal.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve(fakeJournal));
      createResponseSpy.and.returnValue({ statusCode: 200 });

      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(200);
      expect(createResponse.default).toHaveBeenCalledWith(fakeJournal);
      moqFindJournal.verify(x => x(It.isValue('12345678'), It.isValue(null)), Times.once());
    });
  });
});
