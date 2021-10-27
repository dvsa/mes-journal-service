import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import * as logger from '../../../common/application/utils/logger';
import { findTestCentreDetail } from '../../../common/application/test-centre/FindTestCentre';
import { Examiner, TestCentreDetail, TestCentreDetailResponse } from '../../../common/domain/TestCentreDetailRecord';
import { findJournalWithResponse } from '../../../common/application/journal/FindJournal';
import { TestCentreNotFoundError } from '../../../common/domain/errors/test-centre-not-found-error';
import { getEmployeeIdFromRequestContext } from '../../../common/application/journal/employee-id-from-authorizer';
import { constructResponseArray } from '../application/helpers/helpers';

export type ExaminerWorkScheduleOrEmpty = ExaminerWorkSchedule | { error: string };

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context) {
  const staffNumber: string | null = getEmployeeIdFromRequestContext(event.requestContext);
  if (staffNumber === null) {
    return createResponse('No staff number found in request context', HttpStatus.UNAUTHORIZED);
  }

  try {
    logger.info(`Finding test centre detail for staff number ${staffNumber}`);
    const testCentre: TestCentreDetail | null = await findTestCentreDetail(staffNumber);
    // think this is unnecessary step, but added here for increased error handling
    if (testCentre === null) {
      logger.customMetric('TestCentreDetailNotInTable', 'Unable to find test centre (HTTP 204)');
      return createResponse({}, HttpStatus.NO_CONTENT);
    }
    // get all staffNumbers
    const testCentreStaffNumbers: string[] = testCentre.examiners.map((examiner: Examiner) => examiner.staffNumber);
    // create promise array passing each of the staffNumbers into findJournalWithResponse;
    // using new findJournalWithResponse instead of findJournal because findJournal throws error if journal not found
    // or can't be compressed, this would mean if any of journals failed it would mean no data would be returned,
    // so instead we return an object with an error inside it
    const journals: ExaminerWorkScheduleOrEmpty[] = await Promise.all(
      testCentreStaffNumbers.map(async (staffNum: string) => await findJournalWithResponse(staffNum)),
    );
    logger.customMetric('TestCentreDetailFound', 'Number of populated responses sent (HTTP 200)');

    // last step is to merge the journals data with the testCentre object to assign journals to each examiner and
    // to filter by testCentreID
    const testCentreDetail: TestCentreDetailResponse = constructResponseArray(testCentre, journals);
    return createResponse(testCentreDetail);
  } catch (err) {
    if (err instanceof TestCentreNotFoundError) {
      return createResponse('User does not have a corresponding row in test centre table', HttpStatus.NOT_FOUND);
    }
    logger.error(err as string);
    return createResponse('Unable to retrieve test centre journal', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
