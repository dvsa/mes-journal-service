import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { bootstrapLogging, debug, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import { getPathParam } from '@dvsa/mes-microservice-common/framework/validation/event-validation';
import { ExaminerRole } from '@dvsa/mes-microservice-common/domain/examiner-role';
import {
  getRoleFromRequestContext,
  getStaffNumberFromRequestContext,
} from '@dvsa/mes-microservice-common/framework/security/authorisation';

import { findTestCentreDetail } from '../../../common/application/test-centre/FindTestCentreByStaffNumber';
import {TestCentreDetail} from '../../../common/domain/TestCentreDetailRecord';
import {
  TestCentreIdNotFoundError,
  TestCentreNotFoundError,
} from '../../../common/domain/errors/test-centre-not-found-error';
import { getTestCentreJournalPayload } from '../../../common/application/test-centre/determine-response-payload';
import { findTestCentreDetailsByID } from '../../../common/application/test-centre/FindTestCentreByID';

export type ExaminerWorkScheduleOrEmpty = ExaminerWorkSchedule | { error: string };

export async function handler(event: APIGatewayProxyEvent) {
  try {
    bootstrapLogging('test-centre-journal', event);

    const staffNumber = getStaffNumberFromRequestContext(event.requestContext);
    if (!staffNumber) {
      error('No staff number found in request context', event.requestContext);
      return createResponse('No staff number found in request context', HttpStatus.UNAUTHORIZED);
    }

    debug('Staff number found in request context', staffNumber);

    // extract the test centre id from the path params if it exists;
    const testCentreID = getPathParam(event.pathParameters, 'testCentreId');

    // check for the existence of testCentre in path param to determine the type of request;
    const isSearchingByTestCentre = !!testCentreID;

    // check the user has sufficient permissions to search using TC id;
    const role: string | null = getRoleFromRequestContext(event.requestContext);
    if (role !== ExaminerRole.LDTM && isSearchingByTestCentre) {
      error('LDTM examiner role is required to search by TC id', role);
      return createResponse('LDTM examiner role is required to search by TC id', HttpStatus.UNAUTHORIZED);
    }

    const testCentre: TestCentreDetail = (isSearchingByTestCentre)
      ? await findTestCentreDetailsByID(+testCentreID)
      : await findTestCentreDetail(staffNumber);

    const result = await getTestCentreJournalPayload(testCentre);

    return createResponse(result);
  } catch (err) {
    if (err instanceof TestCentreNotFoundError) {
      error('TestCentreNotFoundError');
      return createResponse('User does not have a corresponding row in test centre table', HttpStatus.NOT_FOUND);
    }

    if (err instanceof TestCentreIdNotFoundError) {
      error('TestCentreIdNotFoundError');
      return createResponse('No TestCentreId found using search criteria', HttpStatus.NOT_FOUND);
    }

    error((err instanceof Error) ? err.message : `Unknown error: ${err}`);

    return createResponse('Unable to retrieve test centre journal', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
