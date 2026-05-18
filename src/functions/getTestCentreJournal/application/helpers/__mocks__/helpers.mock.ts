import {
  ExaminerWorkSchedule,
} from '@dvsa/mes-journal-schema';
import { TestCentreDetail } from '../../../../../common/domain/TestCentreDetailRecord';
import { ExaminerWorkScheduleOrEmpty } from '../../../framework/handler';
import * as moment from 'moment';
import { TestCategory } from '@dvsa/mes-test-schema/category-definitions/common/test-category';

export const mockTestCentreDetailFromDynamo = {
  staffNumber: '123456',
  examiners: [
    { name: 'Some name', staffNumber: '987654' },
    { name: 'User name', staffNumber: '123456' },
    { name: 'Another name', staffNumber: '543789' },
  ],
  testCentreCostCodes: ['1234', '1289'],
} as TestCentreDetail;

// date needs to be passed in YYYY-MM-DD
export const mockExaminerWorkSchedule = (date: string) => {
  const today: moment.Moment = moment(date);
  const tomorrow: moment.Moment = moment(date).add(1, 'day');
  const dayAfterTomorrow: moment.Moment = moment(date).add(2, 'day');
  const todayFormatted: string = today.format('YYYY-MM-DD');
  const tomorrowFormatted: string = tomorrow.format('YYYY-MM-DD');
  const dayAfterTomorrowFormatted: string = dayAfterTomorrow.format('YYYY-MM-DD');

  return {
    examiner: {
      staffNumber: '123456',
      individualId: 47328923,
    },
    testSlots: [
      {
        slotDetail: { start: `${todayFormatted}T12:00:00` },
        testCentre: { costCode: '2435', centreName: 'Neath' },
      },
      {
        slotDetail: { start: `${todayFormatted}T12:00:00` },
        testCentre: { costCode: '1234', centreName: 'Swansea' },
        booking: { application: { testCategory: TestCategory.BE } },
      },
      {
        slotDetail: { start: `${todayFormatted}T13:00:00` },
        testCentre: { costCode: '1234', centreName: 'Swansea' },
        booking: { application: { testCategory: TestCategory.B } },
      },
      {
        slotDetail: { start: `${todayFormatted}T14:00:00` },
        testCentre: { costCode: '1234', centreName: 'Swansea' },
        booking: { application: { testCategory: TestCategory.ADI2 } },
      },
      {
        slotDetail: { start: `${dayAfterTomorrowFormatted}T12:00:00` },
        testCentre: { costCode: '1234', centreName: 'Swansea' },
        booking: { application: { testCategory: TestCategory.C } },
      },
      {
        slotDetail: { start: `${tomorrowFormatted}T12:00:00` },
        testCentre: null,
      },
      {
        slotDetail: { start: `${todayFormatted}T12:00:00` },
        testCentre: { costCode: '5323', centreName: 'Cardiff' },
      },
      {
        slotDetail: { start: `${tomorrowFormatted}T12:00:00` },
        testCentre: { costCode: '1289', centreName: 'Neath' },
        booking: { application: { testCategory: TestCategory.C } },
      },
    ],
    personalCommitments: [],
    nonTestActivities: [],
    advanceTestSlots: [],
    deployments: [],
  } as ExaminerWorkSchedule;
};

export const mockExaminerWorkSchedulesOrEmpty = [
  { error: 'Journal not found' },
  { ...mockExaminerWorkSchedule(moment().format('YYYY-MM-DD')) },
  { error: 'Journal decompression error' },
] as ExaminerWorkScheduleOrEmpty[];
