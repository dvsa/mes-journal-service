import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { uniqBy } from 'lodash';
import { bootstrapLogging, debug, error, info } from '@dvsa/mes-microservice-common/application/utils/logger';

import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { findTestCentreDetail } from '../../../common/application/test-centre/FindTestCentreByStaffNumber';
import {TestCentreDetail} from '../../../common/domain/TestCentreDetailRecord';
import {
  TestCentreIdNotFoundError,
  TestCentreNotFoundError,
} from '../../../common/domain/errors/test-centre-not-found-error';
import {
  getRoleFromRequestContext,
} from '../../../common/application/journal/employee-id-from-authorizer';
import { getTestCentreJournalPayload } from '../../../common/application/test-centre/determine-response-payload';
import { findTestCentreDetailsByID } from '../../../common/application/test-centre/FindTestCentreByID';
import {getStaffNumberFromRequestContext} from '@dvsa/mes-microservice-common/framework/security/authorisation';
import {getTestCentreID} from '../application/request-validator';

export type ExaminerWorkScheduleOrEmpty = ExaminerWorkSchedule | { error: string };

export async function handler(event: APIGatewayProxyEvent) {
  try {
    bootstrapLogging('test-centre-journal', event);

    let testCentre: TestCentreDetail;

    const staffNumber: string | null = getStaffNumberFromRequestContext(event.requestContext);
    if (staffNumber === null) {
      error('No staff number found in request context', event.requestContext);
      return createResponse('No staff number found in request context', HttpStatus.UNAUTHORIZED);
    }

    debug('Staff number found in request context', staffNumber);

    // extract the test centre id from the path params if it exists;
    const testCentreID = getTestCentreID(event.pathParameters);

    // check for the existence of testCentre in path param to determine the type of request;
    const isSearchingByTestCentre = !!testCentreID;

    // check the user has sufficient permissions to search using TC id;
    const role: string | null = getRoleFromRequestContext(event.requestContext);
    if (role !== 'LDTM' && isSearchingByTestCentre) {
      error('LDTM examiner role is required to search by TC id', role);
      return createResponse('LDTM examiner role is required to search by TC id', HttpStatus.UNAUTHORIZED);
    }

    info(
      isSearchingByTestCentre
        ? `Finding test centre detail using TC ID ${testCentreID}`
        : `Finding test centre detail for staff number ${staffNumber}`
    );

    if (isSearchingByTestCentre) {
      const testCentreDetails: TestCentreDetail[] = await findTestCentreDetailsByID(+testCentreID);

      // loop through dynamo results, lookup staff inside examiners array and make distinct in-case of duplicates
      const examiners = uniqBy(
        testCentreDetails
          .map(({ examiners, staffNumber }) =>
            examiners?.find((exam) => exam.staffNumber?.toString() === staffNumber.toString())),
        'staffNumber'
      );
      // manufactured the shape of data we would typically get for a staff number search.
      testCentre = {
        staffNumber: '',
        examiners,
        testCentreIDs: [+testCentreID],
      } as TestCentreDetail;
    } else {
      testCentre = await findTestCentreDetail(staffNumber);
    }

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
