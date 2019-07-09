import { APIGatewayProxyEvent, Context, APIGatewayEventRequestContext } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import * as logger from '../../../common/application/utils/logger';
import { findJournal } from '../application/service/FindJournal';
import { JournalNotFoundError } from '../domain/errors/journal-not-found-error';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context) {
  const staffNumber = getStaffNumber(event.pathParameters);
  if (staffNumber === null) {
    return createResponse('No staffNumber provided', HttpStatus.BAD_REQUEST);
  }

  if (process.env.EMPLOYEE_ID_VERIFICATION_DISABLED !== 'true') {
    const employeeId = getEmployeeIdFromRequestContext(event.requestContext);
    if (employeeId === null) {
      return createResponse('No staff number found in request context', HttpStatus.UNAUTHORIZED);
    }
    if (employeeId !== staffNumber) {
      logger.warn(`Invalid staff number (${staffNumber}) requested by employeeId ${employeeId}`);
      return createResponse('Invalid staffNumber', HttpStatus.FORBIDDEN);
    }
  }

  try {
    logger.info(`Finding journal for staff number ${staffNumber}`);
    const journal = await findJournal(staffNumber, getIfModifiedSinceHeaderAsTimestamp(event.headers));
    if (journal === null) {
      logger.customMetric('JournalUnchanged', 'Number of unchanged responses sent (HTTP 304)');
      return createResponse({}, HttpStatus.NOT_MODIFIED);
    }
    logger.customMetric('JournalChanged', 'Number of populated responses sent (HTTP 200)');
    return createResponse(journal);
  } catch (err) {
    if (err instanceof JournalNotFoundError) {
      return createResponse({}, HttpStatus.NOT_FOUND);
    }
    logger.error(err);
    return createResponse('Unable to retrieve journal', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

function getStaffNumber(pathParams: { [key: string]: string } | null): string | null {
  if (pathParams === null
    || typeof pathParams.staffNumber !== 'string'
    || pathParams.staffNumber.trim().length === 0) {
    logger.warn('No staffNumber path parameter found');
    return null;
  }
  return pathParams.staffNumber;
}

const getIfModifiedSinceHeaderAsTimestamp = (headers: { [headerName: string]: string }): number | null => {
  for (const headerName of Object.keys(headers)) {
    if (headerName.toLowerCase() === 'if-modified-since') {
      const ifModfiedSinceHeaderValue = headers[headerName];
      const parsedIfModifiedSinceHeader = Date.parse(ifModfiedSinceHeaderValue);
      return Number.isNaN(parsedIfModifiedSinceHeader) ? null : parsedIfModifiedSinceHeader;
    }
  }
  return null;
};

const getEmployeeIdFromRequestContext = (requestContext: APIGatewayEventRequestContext): string | null => {
  if (requestContext.authorizer && typeof requestContext.authorizer.staffNumber === 'string') {
    return requestContext.authorizer.staffNumber;
  }
  return null;
};
