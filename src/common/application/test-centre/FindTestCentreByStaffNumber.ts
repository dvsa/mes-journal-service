import { TestCentreDetail } from '../../domain/TestCentreDetailRecord';
import { TestCentreNotFoundError } from '../../domain/errors/test-centre-not-found-error';
import { getTestCentreByStaffNumber } from '../../framework/aws/DynamoTestCentreRepository';

export async function findTestCentreDetail(
  staffNumber: string,
): Promise<TestCentreDetail | null> {
  const testCentreRecord: TestCentreDetail | null = await getTestCentreByStaffNumber(staffNumber);

  if (!testCentreRecord) {
    throw new TestCentreNotFoundError();
  }
  return testCentreRecord;
}
