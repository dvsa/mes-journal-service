import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import * as logger from '../../../common/application/utils/logger';
import { findJournal } from '../application/service/FindJournal';
import * as jwtDecode from 'jwt-decode';
import { JournalNotFoundError } from '../domain/errors/journal-not-found-error';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context) {
  const staffNumber = getStaffNumber(event.pathParameters);
  if (staffNumber === null) {
    return createResponse('No staffNumber provided', HttpStatus.BAD_REQUEST);
  }

  if (process.env.EMPLOYEE_ID_VERIFICATION_DISABLED !== 'true') {
    const employeeId = getEmployeeIdFromToken(event.headers.Authorization);
    if (employeeId === null) {
      return createResponse('Invalid authorisation token', HttpStatus.UNAUTHORIZED);
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
      return createResponse({}, HttpStatus.NOT_MODIFIED);
    }
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

function getEmployeeIdFromToken(token: string): string | null {
  if (token === null) {
    logger.warn('No authorisation token in request');
    return null;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const employeeIdKey = process.env.EMPLOYEE_ID_EXT_KEY || '';
    if (employeeIdKey.length === 0) {
      logger.error('No key specified to find employee ID from JWT');
      return null;
    }

    const employeeIdFromJwt = decodedToken[employeeIdKey];
    if (!employeeIdFromJwt) {
      logger.warn('No employeeId found in authorisation token');
      return null;
    }

    return Array.isArray(employeeIdFromJwt) ?
      getEmployeeIdFromArray(employeeIdFromJwt) : getEmployeeIdStringProperty(employeeIdFromJwt);
  } catch (err) {
    logger.error(err);
    return null;
  }
}

function getEmployeeIdFromArray(attributeArr: string[]): string | null {
  if (attributeArr.length === 0) {
    logger.warn('No employeeId found in authorisation token');
    return null;
  }
  return attributeArr[0];
}

function getEmployeeIdStringProperty(employeeId: any): string | null {
  if (typeof employeeId !== 'string' || employeeId.trim().length === 0) {
    logger.warn('No employeeId found in authorisation token');
    return null;
  }
  return employeeId;
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
