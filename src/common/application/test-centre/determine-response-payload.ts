import {Examiner, TestCentreDetail, TestCentreDetailResponse} from '../../domain/TestCentreDetailRecord';
import {findJournalWithResponse} from '../journal/FindJournal';
import * as logger from '../utils/logger';
import {constructResponseArray} from '../../../functions/getTestCentreJournal/application/helpers/helpers';
import {ExaminerWorkScheduleOrEmpty} from '../../../functions/getTestCentreJournalByID/framework/handler';

export const getTestCentreJournalPayload = async (
  testCentreDetail: TestCentreDetail,
): Promise<TestCentreDetailResponse> => {
  // get all unique staffNumbers
  const testCentreStaffNumbers: string[] = testCentreDetail.examiners
    .map((examiner: Examiner) => examiner.staffNumber)
    .filter((staffNum, index , self) => self.indexOf(staffNum) === index);
  // create promise array passing each of the staffNumbers into findJournalWithResponse;
  // using new findJournalWithResponse instead of findJournal because findJournal throws error if journal not found
  // or can't be compressed, this would mean if any of journals failed it would mean no data would be returned,
  // so instead we return an object with an error inside it
  const journals: ExaminerWorkScheduleOrEmpty[] = await Promise.all(
    testCentreStaffNumbers.map(async (staffNum: string) => await findJournalWithResponse(staffNum)),
  );
  logger.customMetric('TestCentreDetailFound', 'Number of populated responses sent (HTTP 200)');

  // last step is to merge the journals data with the testCentre object to assign journals to each examiner and
  // to filter by testCentreID
  return constructResponseArray(testCentreDetail, journals) as TestCentreDetailResponse;
};
