import { APIGatewayEvent } from 'aws-lambda';
import { It, Mock } from 'typemoq';
import { gzipSync } from 'zlib';
import * as response from '@dvsa/mes-microservice-common/application/api/create-response';
const lambdaTestUtils = require('aws-lambda-test-utils');
import * as FindJournal from '../../../../common/application/journal/FindJournal';
import { tokens } from '../../../getJournal/framework/__mocks__/authentication-token.mock';
import { handler } from '../handler';
import {
  correctAppRefString,
  correctStaffNumber,
  findJournalResult,
  incorrectAppRefString,
  incorrectStaffNumber,
  resultTestSlot,
} from './handler.spec.data';

describe('searchBooking handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let createResponseSpy: jasmine.Spy;

  const moqFindJournal = Mock.ofInstance(FindJournal.findJournal);

  beforeEach(() => {
    moqFindJournal.reset();

    createResponseSpy = spyOn(response, 'createResponse');
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

  describe('given the appRef and staffNumber are correct', () => {
    it('should return a successful response with the compressed booking', async () => {
      const appRefParameter = correctAppRefString;
      const staffNumberParameter = correctStaffNumber;

      dummyApigwEvent.queryStringParameters = {
        appRef: appRefParameter,
      };
      dummyApigwEvent.pathParameters = {
        staffNumber: staffNumberParameter,
      };

      moqFindJournal
        .setup(x => x(It.isValue(staffNumberParameter), It.isAny())).returns(() => Promise.resolve(findJournalResult));
      createResponseSpy.and.returnValue({ statusCode: 404 });
      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(404);
      expect(response.createResponse)
        .toHaveBeenCalledWith(gzipSync(JSON.stringify(resultTestSlot)).toString('base64'));
    });
  });

  describe('given the appRef is incorrect but staffNumber is correct', () => {
    it('should return error no journal found for the app ref', async () => {
      const appRefParameter = incorrectAppRefString;
      const staffNumberParameter = correctStaffNumber;

      dummyApigwEvent.queryStringParameters = {
        appRef: appRefParameter,
      };
      dummyApigwEvent.pathParameters = {
        staffNumber: staffNumberParameter,
      };

      moqFindJournal
        .setup(x => x(It.isValue(staffNumberParameter), It.isAny())).returns(() => Promise.resolve(findJournalResult));
      createResponseSpy.and.returnValue({ statusCode: 404 });
      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(404);
    });
  });

  describe('given the appRef is correct but staffNumber is incorrect', () => {
    it('should return error no journal found for the staff number', async () => {
      const appRefParameter = correctAppRefString;
      const staffNumberParameter = incorrectStaffNumber;

      dummyApigwEvent.queryStringParameters = {
        appRef: appRefParameter,
      };
      dummyApigwEvent.pathParameters = {
        staffNumber: staffNumberParameter,
      };

      moqFindJournal
        .setup(x => x(It.isValue(correctStaffNumber), It.isAny())).returns(() => Promise.resolve(findJournalResult));
      createResponseSpy.and.returnValue({ statusCode: 404 });
      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(404);
    });
  });

  describe('given the appRef and staffNumber are correct, no test slot available', () => {
    it('should return an error saying no test slot available for journal', async () => {
      const appRefParameter = correctAppRefString;
      const staffNumberParameter = correctStaffNumber;

      dummyApigwEvent.queryStringParameters = {
        appRef: appRefParameter,
      };
      dummyApigwEvent.pathParameters = {
        staffNumber: staffNumberParameter,
      };

      const noTestSlotJournal = JSON.parse(JSON.stringify(findJournalResult));
      noTestSlotJournal.testSlots = [];

      moqFindJournal
        .setup(x => x(It.isValue(staffNumberParameter), It.isAny())).returns(() => Promise.resolve(noTestSlotJournal));
      createResponseSpy.and.returnValue({ statusCode: 404 });
      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(404);
    });
  });

  describe('given no appReference is provided', () => {
    it('should return an error saying query parameter app ref has to be supplied', async () => {
      const staffNumberParameter = correctStaffNumber;

      dummyApigwEvent.queryStringParameters = {};
      dummyApigwEvent.pathParameters = {
        staffNumber: staffNumberParameter,
      };

      moqFindJournal
        .setup(x => x(It.isValue(staffNumberParameter), It.isAny())).returns(() => Promise.resolve(findJournalResult));
      createResponseSpy.and.returnValue({ statusCode: 400 });
      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(400);
      expect(response.createResponse)
        .toHaveBeenCalledWith('Query parameter app reference needs to be supplied', 400);
    });
  });

  describe('given the appRef is invalid but the staffNumber are correct', () => {
    it('should return an error for failed validation', async () => {
      const appRefParameter = 'whatever';
      const staffNumberParameter = correctStaffNumber;

      dummyApigwEvent.queryStringParameters = {
        appRef: appRefParameter,
      };
      dummyApigwEvent.pathParameters = {
        staffNumber: staffNumberParameter,
      };

      const noTestSlotJournal = JSON.parse(JSON.stringify(findJournalResult));
      noTestSlotJournal.testSlots = [];

      moqFindJournal
        .setup(x => x(It.isValue(staffNumberParameter), It.isAny())).returns(() => Promise.resolve(noTestSlotJournal));
      createResponseSpy.and.returnValue({ statusCode: 400 });
      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(400);
    });
  });

  describe('given the appRef is valid but the staffNumber is invalid', () => {
    it('should return an error for failed validation', async () => {
      const appRefParameter = correctAppRefString;
      const staffNumberParameter = 'whatever';

      dummyApigwEvent.queryStringParameters = {
        appRef: appRefParameter,
      };
      dummyApigwEvent.pathParameters = {
        staffNumber: staffNumberParameter,
      };

      const noTestSlotJournal = JSON.parse(JSON.stringify(findJournalResult));
      noTestSlotJournal.testSlots = [];

      moqFindJournal
        .setup(x => x(It.isValue(staffNumberParameter), It.isAny())).returns(() => Promise.resolve(noTestSlotJournal));
      createResponseSpy.and.returnValue({ statusCode: 400 });
      const resp = await handler(dummyApigwEvent);

      expect(resp.statusCode).toBe(400);
    });
  });

});
