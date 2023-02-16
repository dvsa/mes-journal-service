import { getTestCentreByID } from '../../framework/aws/DynamoTestCentreRepository';
import { TestCentreDetail } from '../../domain/TestCentreDetailRecord';
import { TestCentreIdNotFoundError } from '../../domain/errors/test-centre-not-found-error';

export async function findTestCentreDetailsByID(
  tcID: number,
): Promise<TestCentreDetail[]> {
  const testCentreDetails: TestCentreDetail[] | null = await getTestCentreByID(tcID);

  if (!testCentreDetails) {
    throw new TestCentreIdNotFoundError();
  }
  return testCentreDetails;
}
