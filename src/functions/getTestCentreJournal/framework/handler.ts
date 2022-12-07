import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { APIGatewayProxyEvent } from 'aws-lambda';

import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import * as logger from '../../../common/application/utils/logger';
import { findTestCentreDetail } from '../../../common/application/test-centre/FindTestCentreByStaffNumber';
import { TestCentreDetail } from '../../../common/domain/TestCentreDetailRecord';
import { TestCentreNotFoundError } from '../../../common/domain/errors/test-centre-not-found-error';
import { getEmployeeIdFromRequestContext } from '../../../common/application/journal/employee-id-from-authorizer';
import { getTestCentreJournalPayload } from '../../../common/application/test-centre/determine-response-payload';

export type ExaminerWorkScheduleOrEmpty = ExaminerWorkSchedule | { error: string };

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const staffNumber: string | null = getEmployeeIdFromRequestContext(event.requestContext);
    if (staffNumber === null) {
      return createResponse('No staff number found in request context', HttpStatus.UNAUTHORIZED);
    }

    logger.info(`Finding test centre detail for staff number ${staffNumber}`);
    const testCentre: TestCentreDetail | null = await findTestCentreDetail(staffNumber);
    // think this is unnecessary step, but added here for increased error handling
    if (testCentre === null) {
      logger.customMetric('TestCentreDetailNotInTable', 'Unable to find test centre (HTTP 204)');
      return createResponse({}, HttpStatus.NO_CONTENT);
    }
    const result = await getTestCentreJournalPayload(testCentre);
    return createResponse(result);
  } catch (err) {
    if (err instanceof TestCentreNotFoundError) {
      return createResponse('User does not have a corresponding row in test centre table', HttpStatus.NOT_FOUND);
    }
    logger.error(err as string);
    return createResponse('Unable to retrieve test centre journal', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
