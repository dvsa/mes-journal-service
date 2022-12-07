import { getTestCentreByID } from '../../framework/aws/DynamoTestCentreRepository';
import { TestCentreDetail } from '../../domain/TestCentreDetailRecord';

export async function findTestCentreDetailsByID(
  tcID: number,
): Promise<TestCentreDetail[]> {
  const testCentreDetails: TestCentreDetail[] | null = await getTestCentreByID(tcID);

  if (!testCentreDetails) {
    // throw new TestCentreNotFoundError();
    throw new Error('not found');
  }
  return testCentreDetails;
}
