import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import * as logger from '../../../common/application/utils/logger';
import { findJournal } from '../application/service/FindJournal';
import * as jwtDecode from 'jwt-decode';

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
    const journal = await findJournal(staffNumber);
    if (journal === null) {
      return createResponse({}, HttpStatus.NOT_FOUND);
    }
    return createResponse(journal);
  } catch (err) {
    logger.error(err);
    return createResponse('Unable to retrieve journal', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

function getStaffNumber(pathParams: { [key: string]: string } | null) : string | null {
  if (pathParams === null
        || typeof pathParams.staffNumber !== 'string'
        || pathParams.staffNumber.trim().length === 0) {
    logger.warn('No staffNumber path parameter found');
    return null;
  }
  return pathParams.staffNumber;
}

function getEmployeeIdFromToken(token: string) : string | null {
  if (token === null) {
    logger.warn('No authorisation token in request');
    return null;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    if (!decodedToken['extn.employeeId']
          || typeof decodedToken['extn.employeeId'][0] !== 'string'
          || decodedToken['extn.employeeId'][0].length === 0) {
      logger.warn('No employeeId found in authorisation token');
      return null;
    }
    return decodedToken['extn.employeeId'][0];
  } catch (err) {
    logger.error(err);
    return null;
  }
}
