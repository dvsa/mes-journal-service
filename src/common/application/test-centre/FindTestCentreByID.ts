import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getTestCentreByID } from '../../framework/aws/DynamoTestCentreRepository';
import { TestCentreDetail } from '../../domain/TestCentreDetailRecord';
import { TestCentreIdNotFoundError } from '../../domain/errors/test-centre-not-found-error';
import {
  buildTestCentre,
  formatExaminers,
} from '../../../functions/getTestCentreJournal/application/helpers/search-by-test-centre';

export async function findTestCentreDetailsByID(
  tcID: number,
): Promise<TestCentreDetail> {
  info(`Finding test centre detail using TC ID ${tcID}`);

  const testCentreDetails: TestCentreDetail[] | null = await getTestCentreByID(tcID);

  if (!testCentreDetails) {
    throw new TestCentreIdNotFoundError();
  }

  // loop through dynamo results, lookup staff inside examiners array and make distinct in-case of duplicates
  const examiners = formatExaminers(testCentreDetails);

  // manufactured the shape of data we would typically get for a staff number search.
  return buildTestCentre(examiners, tcID);
}
