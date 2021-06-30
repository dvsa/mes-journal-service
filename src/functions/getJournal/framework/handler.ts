import { APIGatewayProxyEvent, Context, APIGatewayEventRequestContext } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import * as logger from '../../../common/application/utils/logger';
import { findJournal } from '../../../common/application/journal/FindJournal';
import { JournalNotFoundError } from '../../../common/domain/errors/journal-not-found-error';
import { getEmployeeIdFromRequestContext } from '../../../common/application/journal/employee-id-from-authorizer';
import axios, { AxiosError } from 'axios';
// import * as https from 'https';
import { get } from 'https';

const axiosInstance = axios.create({
});

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context) {
  await sendErrorNotification('Error Notification');
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

/** KR Test Notification function
 **/

export const sendErrorNotification = async (errorMessage: string | null) => {
  try {
    logger.info(`Calling sendErrorNotification `);
    const url = `https://restful-booker.herokuapp.com/booking/10`;
    logger.info(`calling ${url}`);
    const result1 = await get(url);
    console.log('result' , result1);
    return result1;
  } catch (e) {
    const ex = mapHTTPErrorToDomainError(e);
    const errorMessage = `Failed to send error notification for app `;
    logger.error(errorMessage + e);
    return ex;
  }
};

export const sendErrorNotificationold = async (errorMessage: string | null) => {
  logger.info(`Calling sendErrorNotification `);
  const url = `https://restful-booker.herokuapp.com/booking/10`;
  logger.info(`calling ${url}`);

  return new Promise(async (resolve, reject) => {
    const result = axiosInstance.get(url);
    console.log('result' , await result);
    result.then((response) => {
      logger.info('Notification successfully sent');
      resolve();
    }).catch((err) => {
      const ex = mapHTTPErrorToDomainError(err);
      const errorMessage = `Failed to send error notification for app `;
      logger.error(errorMessage + err);
      reject(ex);
    });
  });
};

const mapHTTPErrorToDomainError = (err: AxiosError): Error => {
  const { request, response } = err;
  if (response) {
    return new Error(JSON.stringify(response.data));
  }
  // Request was made, but no response received
  if (request) {
    return new Error(`no response received ${err.message}`);
  }
  // Failed to setup the request
  return new Error(err.message);
};
