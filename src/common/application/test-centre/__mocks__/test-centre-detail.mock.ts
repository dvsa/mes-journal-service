import {ExaminerWorkSchedule} from '@dvsa/mes-journal-schema';
import {TestCentreDetail} from '../../../domain/TestCentreDetailRecord';

const MOCK_EXAMINERS = [
  {
    name: 'Joe Bloggs',
    staffNumber: '1234567',
    journal: {} as ExaminerWorkSchedule,
  },
  {
    name: 'Other Person',
    staffNumber: '9876543',
    journal: {} as ExaminerWorkSchedule,
  },
];

export const MOCK_TEST_CENTRE_DETAIL_1 = {
  staffNumber: '1234567',
  examiners: MOCK_EXAMINERS,
  testCentreIDs: [123, 456],
} as TestCentreDetail;

export const MOCK_TEST_CENTRE_DETAIL_2 = {
  staffNumber: '9876543',
  examiners: [
    ...MOCK_EXAMINERS,
    {
      name: 'Third Individual',
      staffNumber: '22445588',
      journal: {} as ExaminerWorkSchedule,
    },
  ],
  testCentreIDs: [123, 456],
} as TestCentreDetail;

export const MOCK_TEST_CENTRE_DETAIL_RESPONSES = [
  MOCK_TEST_CENTRE_DETAIL_1,
  MOCK_TEST_CENTRE_DETAIL_2,
];
