import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { APIGatewayProxyEvent, APIGatewayProxyEventPathParameters } from 'aws-lambda';
import { flatten } from 'lodash';

import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import * as logger from '../../../common/application/utils/logger';
import { TestCentreDetail } from '../../../common/domain/TestCentreDetailRecord';
import { findTestCentreDetailsByID } from '../../../common/application/test-centre/FindTestCentreByID';
import { getTestCentreJournalPayload } from '../../../common/application/test-centre/determine-response-payload';

export type ExaminerWorkScheduleOrEmpty = ExaminerWorkSchedule | { error: string };

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const testCentreID = getTestCentreID(event.pathParameters);
    if (testCentreID === null) {
      return createResponse('No testCentreID provided', HttpStatus.BAD_REQUEST);
    }

    logger.info(`Finding test centre detail using TCID ${testCentreID}`);

    const testCentreDetails: TestCentreDetail[] | null = await findTestCentreDetailsByID(+testCentreID);
    // think this is unnecessary step, but added here for increased error handling
    if (testCentreDetails === null) {
      logger.customMetric('TestCentreDetailNotInTable', 'Unable to find test centre (HTTP 204)');
      return createResponse({}, HttpStatus.NO_CONTENT);
    }

    // manufactured the shape of data we would typically get for a staff number search.
    const testCentreByIdDetails = {
      staffNumber: '',
      examiners: flatten(testCentreDetails.map((obj) => [...obj.examiners])),
      testCentreIDs: [+testCentreID],
    } as TestCentreDetail;

    const result = await getTestCentreJournalPayload(testCentreByIdDetails);
    return createResponse(result);
  } catch (err) {
    logger.error(err as string);
    return createResponse('Unable to retrieve test centre journal', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

function getTestCentreID(pathParams: APIGatewayProxyEventPathParameters | null): string | null {
  if (pathParams === null
    || typeof pathParams.testCentreID !== 'string'
    || pathParams.testCentreID.trim().length === 0) {
    logger.warn('No testCentreID path parameter found');
    return null;
  }
  return pathParams.testCentreID;
}
