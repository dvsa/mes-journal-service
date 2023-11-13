import {APIGatewayProxyEvent} from 'aws-lambda';
import {get} from 'lodash';
import {ExaminerWorkSchedule} from '@dvsa/mes-journal-schema';
import {formatApplicationReference} from '@dvsa/mes-microservice-common/domain/tars';
import {getPathParam} from '@dvsa/mes-microservice-common/framework/validation/event-validation';
import {bootstrapLogging, debug, error} from '@dvsa/mes-microservice-common/application/utils/logger';
import {HttpStatus} from '@dvsa/mes-microservice-common/application/api/http-status';
import {createResponse} from '@dvsa/mes-microservice-common/application/api/create-response';
import {findJournal} from '../../../common/application/journal/FindJournal';
import {BookingValidator} from '../application/validation/validation';
import {parseToAppRef} from '../application/helpers/parse-to-app-ref';
import {formatTestSlots} from '../application/helpers/format-test-slots';
import {compress} from '../../../common/application/service/journal-decompressor';

export async function handler(event: APIGatewayProxyEvent) {
  bootstrapLogging('search-booking', event);

  // @TODO: Consider removing error handling and controlling all via joi validator

  if (!event.queryStringParameters) {
    error('Query parameters have to be supplied');
    return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
  }

  const staffNumber = getPathParam(event.pathParameters, 'staffNumber');
  if (!staffNumber) {
    error('Path parameter staff number has to be supplied');
    return createResponse('Path parameter staff number has to be supplied', HttpStatus.BAD_REQUEST);
  }

  const applicationReference = event.queryStringParameters.appRef;
  if (!applicationReference) {
    error('Query parameter app reference needs to be supplied');
    return createResponse('Query parameter app reference needs to be supplied', HttpStatus.BAD_REQUEST);
  }

  const { error: err, value } = new BookingValidator(staffNumber, applicationReference).isValid();
  if (err) {
    error(err.name, err.message, get(err, '_original'));
    return createResponse('Invalid search criteria', HttpStatus.BAD_REQUEST);
  }

  debug('Validation passed', value);

  let journal: ExaminerWorkSchedule;

  try {
    journal = await findJournal(staffNumber, null) as ExaminerWorkSchedule;
  } catch (exception) {
    error(`Errored on getting journal for ${staffNumber}`, exception);
    return createResponse('Unable to get journal, please check the staff number', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const parameterAppRef: number = formatApplicationReference(parseToAppRef(applicationReference));

  const testSlots = formatTestSlots(journal?.testSlots, parameterAppRef);
  if (testSlots.length === 0) {
    error('Test slots are empty');
    // @TODO: Response should be changed to
    //  return createResponse('No test slot found', HttpStatus.NOT_FOUND);
    return createResponse(404);
  }

  if (testSlots.length > 1) {
    error(`Multiple test slots found for staffNumber ${staffNumber} and appRef ${applicationReference}`);
    return createResponse('Multiple test slots found', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const [slot] = testSlots;
  return createResponse(compress(slot));
}
