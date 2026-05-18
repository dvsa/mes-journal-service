import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getTestCentreByCostCode } from '../../framework/aws/DynamoTestCentreRepository';
import { TestCentreDetail } from '../../domain/TestCentreDetailRecord';
import { TestCentreCostCodeNotFoundError } from '../../domain/errors/test-centre-not-found-error';
import {
  buildTestCentre,
  formatExaminers,
} from '../../../functions/getTestCentreJournal/application/helpers/search-by-test-centre';

export async function findTestCentreDetailsByCostCode(
  tcCostCode: string,
): Promise<TestCentreDetail> {
  info(`Finding test centre detail using TC Cost Code ${tcCostCode}`);

  const testCentreDetails: TestCentreDetail[] | null = await getTestCentreByCostCode(tcCostCode);

  if (!testCentreDetails) {
    throw new TestCentreCostCodeNotFoundError();
  }

  // loop through dynamo results, lookup staff inside examiners array and make distinct in-case of duplicates
  const examiners = formatExaminers(testCentreDetails);

  // manufactured the shape of data we would typically get for a staff number search.
  return buildTestCentre(examiners, tcCostCode);
}
