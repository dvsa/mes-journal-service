import {uniqBy} from 'lodash';
import {Examiner, TestCentreDetail} from '../../../../common/domain/TestCentreDetailRecord';

export const formatExaminers = (testCentreDetails: TestCentreDetail[]) => uniqBy(
  testCentreDetails
    .map(({ examiners, staffNumber }) =>
      examiners?.find((exam) => exam.staffNumber?.toString() === staffNumber.toString())),
  'staffNumber'
) as Examiner[];

export const buildTestCentre = (examiners: Examiner[], testCentreID: number): TestCentreDetail => ({
  staffNumber: '',
  examiners,
  testCentreIDs: [+testCentreID],
});
