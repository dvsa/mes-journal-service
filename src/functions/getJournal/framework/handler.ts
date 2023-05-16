import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  bootstrapLogging,
  customMetric,
  error,
  info,
  warn,
} from '@dvsa/mes-microservice-common/application/utils/logger';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { findJournal } from '../../../common/application/journal/FindJournal';
import { JournalNotFoundError } from '../../../common/domain/errors/journal-not-found-error';
import { getEmployeeIdFromRequestContext } from '../../../common/application/journal/employee-id-from-authorizer';
import { APIGatewayProxyEventHeaders, APIGatewayProxyEventPathParameters } from 'aws-lambda/trigger/api-gateway-proxy';
import { JournalDecompressionError } from '../../../common/domain/errors/journal-decompression-error';

export async function handler(event: APIGatewayProxyEvent) {
  bootstrapLogging('journal-get', event);

  const staffNumber = getStaffNumber(event.pathParameters);
  if (staffNumber === null) {
    error('No staffNumber provided');
    return createResponse('No staffNumber provided', HttpStatus.BAD_REQUEST);
  }

  if (process.env.EMPLOYEE_ID_VERIFICATION_DISABLED !== 'true') {
    const employeeId = getEmployeeIdFromRequestContext(event.requestContext);

    if (employeeId === null) {
      error('No staff number found in request context');
      return createResponse('No staff number found in request context', HttpStatus.UNAUTHORIZED);
    }

    if (employeeId !== staffNumber) {
      warn(`Invalid staff number (${staffNumber}) requested by employeeId ${employeeId}`);
      return createResponse('Invalid staffNumber', HttpStatus.FORBIDDEN);
    }
  }

  try {
    info(`Finding journal for staff number ${staffNumber}`);

    const journal = await findJournal(staffNumber, getIfModifiedSinceHeaderAsTimestamp(event.headers));
    if (journal === null) {
      customMetric('JournalUnchanged', 'Number of unchanged responses sent (HTTP 304)');
      return createResponse({}, HttpStatus.NOT_MODIFIED);
    }
    customMetric('JournalChanged', 'Number of populated responses sent (HTTP 200)');
    return createResponse(journal);
  } catch (err) {
    if (err instanceof JournalNotFoundError) {
      error('JournalNotFoundError');
      return createResponse({}, HttpStatus.NOT_FOUND);
    }

    if (err instanceof JournalDecompressionError) {
      error('JournalDecompressionError');
      return createResponse('Decompression error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    error('Unknown err', err);
    return createResponse('Unable to retrieve journal', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

function getStaffNumber(pathParams: APIGatewayProxyEventPathParameters | null): string | null {
  if (pathParams === null
    || typeof pathParams.staffNumber !== 'string'
    || pathParams.staffNumber.trim().length === 0
  ) {
    warn('No staffNumber path parameter found');
    return null;
  }
  return pathParams.staffNumber;
}

const getIfModifiedSinceHeaderAsTimestamp = (headers: APIGatewayProxyEventHeaders): number | null => {
  for (const headerName of Object.keys(headers)) {
    if (headerName.toLowerCase() === 'if-modified-since') {
      const ifModifiedSinceHeaderValue = headers[headerName] as string;
      const parsedIfModifiedSinceHeader = Date.parse(ifModifiedSinceHeaderValue);
      return Number.isNaN(parsedIfModifiedSinceHeader) ? null : parsedIfModifiedSinceHeader;
    }
  }
  return null;
};
