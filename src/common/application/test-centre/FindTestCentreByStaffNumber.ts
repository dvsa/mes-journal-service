import { info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { TestCentreDetail } from '../../domain/TestCentreDetailRecord';
import { TestCentreNotFoundError } from '../../domain/errors/test-centre-not-found-error';
import { getTestCentreByStaffNumber } from '../../framework/aws/DynamoTestCentreRepository';

export async function findTestCentreDetail(
  staffNumber: string,
): Promise<TestCentreDetail> {
  info(`Finding test centre detail for staff number ${staffNumber}`);

  const testCentreRecord: TestCentreDetail | null = await getTestCentreByStaffNumber(staffNumber);

  if (!testCentreRecord) {
    throw new TestCentreNotFoundError();
  }
  return testCentreRecord;
}
