import { APIGatewayProxyEvent } from 'aws-lambda';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { getPathParam } from '@dvsa/mes-microservice-common/framework/validation/event-validation';
import { getStaffNumberFromRequestContext } from '@dvsa/mes-microservice-common/framework/security/authorisation';
import { findJournal } from '../../../common/application/journal/FindJournal';
import { JournalNotFoundError } from '../../../common/domain/errors/journal-not-found-error';
import {
  info,
  warn,
  error,
  bootstrapLogging,
  customMetric,
} from '@dvsa/mes-microservice-common/application/utils/logger';
import { getIfModifiedSinceHeaderAsTimestamp } from '../application/request-validator';

export async function handler(event: APIGatewayProxyEvent) {
  bootstrapLogging('get-journal', event);

  const staffNumber = getPathParam(event.pathParameters, 'staffNumber');
  if (!staffNumber) {
    error('No staffNumber provided');
    return createResponse('No staffNumber provided', HttpStatus.BAD_REQUEST);
  }

  const employeeId = getStaffNumberFromRequestContext(event.requestContext);
  if (!employeeId) {
    error('No staff number found in request context');
    return createResponse('No staff number found in request context', HttpStatus.UNAUTHORIZED);
  }

  if (employeeId !== staffNumber) {
    warn(`Invalid staff number (${staffNumber}) requested by employeeId ${employeeId}`);
    return createResponse('Invalid staffNumber', HttpStatus.FORBIDDEN);
  }

  try {
    info(`Finding journal for staff number ${staffNumber}`);

    const journal = await findJournal(staffNumber, getIfModifiedSinceHeaderAsTimestamp(event.headers));
    if (!journal) {
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

    error(err instanceof Error ? err.message : `Unknown err: ${err}`);

    return createResponse('Unable to retrieve journal', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
