import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { findJournal } from '../../../common/application/journal/FindJournal';
import { ExaminerWorkSchedule } from '@dvsa/mes-journal-schema';
import { formatApplicationReference } from '@dvsa/mes-microservice-common/domain/tars';
import { ApplicationReference } from '@dvsa/mes-test-schema/categories/common';
import { gzipSync } from 'zlib';
import { get } from 'lodash';
import joi = require('joi');

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context) {
  if (!event.queryStringParameters) {
    return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
  }

  if (!event.pathParameters) {
    return createResponse('Path parameter staff number has to be supplied', HttpStatus.BAD_REQUEST);
  }

  if (!event.queryStringParameters.appRef) {
    return createResponse('Query parameter app reference needs to be supplied', HttpStatus.BAD_REQUEST);
  }

  const applicationReference: string = event.queryStringParameters.appRef;

  const staffNumber = event.pathParameters['staffNumber'];

  const parametersSchema = joi.object().keys({
    staffNumberValidator: joi.number().max(100000000).optional(),
    appRefValidator: joi.number().max(1000000000000).optional(),
  });

  const validationResult = parametersSchema.validate(
    {
      staffNumberValidator: staffNumber,
      appRefValidator: applicationReference,
    });

  if (validationResult.error) {
    return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
  }

  const appRef: ApplicationReference = {
    applicationId: parseInt(applicationReference.substring(0, applicationReference.length - 3), 10),
    checkDigit: parseInt(applicationReference.charAt(applicationReference.length - 1), 10),
    bookingSequence:
      parseInt(applicationReference.substring(applicationReference.length - 3, applicationReference.length - 1), 10),
  };

  const parameterAppRef: number = formatApplicationReference(appRef);
  let journal: ExaminerWorkSchedule | null;

  try {
    journal = await findJournal(staffNumber, null);
  } catch (exception) {
    console.log(`Errored on getting journal for ${staffNumber}`);
    return createResponse('Unable to get journal, please check the staff number', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!journal) {
    return createResponse(404);
  }

  if (!journal.testSlots || journal.testSlots.length === 0) {
    return createResponse(404);
  }

  const testSlots = journal.testSlots
    .map((testSlot) => {
      if (get(testSlot, 'booking.application', null)) {
        const application = get(testSlot, 'booking.application', null);
        const currentAppRef: ApplicationReference = {
          applicationId: application.applicationId,
          checkDigit: application.checkDigit,
          bookingSequence: application.bookingSequence,
        };

        const formattedSlotAppRef = formatApplicationReference(currentAppRef);
        if (parameterAppRef === formattedSlotAppRef) {
          return testSlot;
        }
      }
    })
    .filter(testSlot => testSlot);

  if (testSlots.length === 0) {
    return createResponse(404);
  }

  if (testSlots.length > 1) {
    console.log(`Multiple test slots found for staffNumber ${staffNumber} and appRef ${applicationReference}`);
    return createResponse('Internal error', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const compressedPayload = gzipSync(JSON.stringify(testSlots[0])).toString('base64');
  return createResponse(compressedPayload);
}
