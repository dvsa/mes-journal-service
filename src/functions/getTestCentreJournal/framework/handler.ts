import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import {APIGatewayProxyEvent, APIGatewayProxyEventPathParameters} from 'aws-lambda';
import { flatten, uniqBy } from 'lodash';

import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import * as logger from '../../../common/application/utils/logger';
import { findTestCentreDetail } from '../../../common/application/test-centre/FindTestCentreByStaffNumber';
import { TestCentreDetail } from '../../../common/domain/TestCentreDetailRecord';
import { TestCentreNotFoundError } from '../../../common/domain/errors/test-centre-not-found-error';
import {
  getEmployeeIdFromRequestContext,
  getRoleFromRequestContext,
} from '../../../common/application/journal/employee-id-from-authorizer';
import { getTestCentreJournalPayload } from '../../../common/application/test-centre/determine-response-payload';
import { findTestCentreDetailsByID } from '../../../common/application/test-centre/FindTestCentreByID';

export type ExaminerWorkScheduleOrEmpty = ExaminerWorkSchedule | { error: string };

export async function handler(event: APIGatewayProxyEvent) {
  try {
    let testCentre: TestCentreDetail | null = null;

    const staffNumber: string | null = getEmployeeIdFromRequestContext(event.requestContext);
    if (staffNumber === null) {
      return createResponse('No staff number found in request context', HttpStatus.UNAUTHORIZED);
    }

    // extract the test centre id from the path params if it exists;
    const testCentreID = getTestCentreID(event.pathParameters);

    // check for the existence of testCentre in path param to determine the type of request;
    const isSearchingByTestCentre = !!testCentreID;

    // check the user has sufficient permissions to search using TC id;
    const role: string | null = getRoleFromRequestContext(event.requestContext);
    if (role !== 'LDTM' && isSearchingByTestCentre) {
      return createResponse('LDTM examiner role is required to search by TC id', HttpStatus.UNAUTHORIZED);
    }

    logger.info(
      isSearchingByTestCentre
        ? `Finding test centre detail using TC ID ${testCentreID}`
        : `Finding test centre detail for staff number ${staffNumber}`
    );

    if (isSearchingByTestCentre) {
      const testCentreDetails: TestCentreDetail[] | null = await findTestCentreDetailsByID(+testCentreID);

      if (testCentreDetails === null) {
        logger.customMetric('TestCentreDetailNotInTable', 'Unable to find test centre using TCID (HTTP 204)');
        return createResponse({}, HttpStatus.NO_CONTENT);
      }
      // manufactured the shape of data we would typically get for a staff number search.
      testCentre = {
        staffNumber: '',
        examiners: uniqBy(flatten(testCentreDetails.map((obj) => [...obj.examiners])), 'staffNumber'),
        testCentreIDs: [+testCentreID],
      } as TestCentreDetail;

    } else {
      testCentre = await findTestCentreDetail(staffNumber);
      if (testCentre === null) {
        logger.customMetric('TestCentreDetailNotInTable', 'Unable to find test centre using staff number (HTTP 204)');
        return createResponse({}, HttpStatus.NO_CONTENT);
      }
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

function getTestCentreID(pathParams: APIGatewayProxyEventPathParameters | null): string | null {
  if (pathParams === null
    || typeof pathParams.testCentreId !== 'string'
    || pathParams.testCentreId.trim().length === 0
  ) {
    return null;
  }
  return pathParams.testCentreId;
}
