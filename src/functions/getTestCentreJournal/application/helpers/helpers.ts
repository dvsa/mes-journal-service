import { get, uniqBy } from 'lodash';
import * as moment from 'moment';
import { TestCategory } from '@dvsa/mes-test-schema/category-definitions/common/test-category';
import { AdvanceTestSlot, Deployment, ExaminerWorkSchedule, NonTestActivity, TestSlot } from '@dvsa/mes-journal-schema';
import {
  Examiner,
  TestCentre,
  TestCentreDetail,
  TestCentreDetailResponse,
} from '../../../../common/domain/TestCentreDetailRecord';
import { ExaminerWorkScheduleOrEmpty } from '../../framework/handler';

let testCentres: TestCentre[] = [];

export const constructResponseArray = (
  testCentreDetail: TestCentreDetail,
  journals: ExaminerWorkScheduleOrEmpty[],
): TestCentreDetailResponse => {
  // empty testCentres
  testCentres = [];

  return {
    staffNumber: testCentreDetail.staffNumber,
    examiners: testCentreDetail.examiners.map((examiner: Examiner, index: number) => ({
      ...examiner,
      journal: assignJournalToStaff(testCentreDetail, examiner, journals),
      error: deriveError(journals, index),
    })),
    testCentres: uniqBy(testCentres, 'id'), // make test centre list distinct by id
  };
};

const assignJournalToStaff = (
  testCentreDetail: TestCentreDetail,
  examiner: Examiner,
  journals: ExaminerWorkScheduleOrEmpty[],
): ExaminerWorkSchedule | null => {

  const journal = (journals as ExaminerWorkSchedule[])
    .find((journal: ExaminerWorkSchedule | null) =>
            get(journal, 'examiner.staffNumber') === examiner.staffNumber);

  if (!journal) {
    return null;
  }

  const {
    testSlots = [],
    nonTestActivities = [],
    deployments = [],
    advanceTestSlots = [],
  } = journal;

  return {
    ...journal,
    testSlots: filterByTestCentreAndDate(testCentreDetail, testSlots),
    nonTestActivities: filterByTestCentreAndDate(testCentreDetail, nonTestActivities),
    deployments: filterByTestCentreAndDate(testCentreDetail, deployments),
    advanceTestSlots: filterByTestCentreAndDate(testCentreDetail, advanceTestSlots),
  };
};

const isAnyOf = (
  dataValue: string | number | undefined,
  valuesToCheck: (string | number)[],
): boolean => valuesToCheck.some((value: string | number) => dataValue === value);

const filterByTestCentreAndDate = <T>(testCentreDetail: TestCentreDetail, info: T[] = []): T[] => {
  return info.filter((section: TestSlot | NonTestActivity | Deployment | AdvanceTestSlot) => {
    return (
      section.testCentre &&
      isAnyOf(section.testCentre.centreId, testCentreDetail.testCentreIDs) &&
      inNext2Days(section) &&
      testCentres.push({ name: section.testCentre.centreName, id: section.testCentre.centreId } as TestCentre)
    );
  });
};

const inNext2Days = <T>(section: T): boolean => {
  const slotDate: string = get(section, 'slotDetail.start', '');

  const today: boolean = moment(slotDate).isSame(moment(), 'day');
  const tomorrow: boolean = moment(slotDate).isSame(moment().add(1, 'day'), 'day');

  return today || tomorrow;
};

export const isNonADI2TestSlot = (section: TestSlot): boolean => {
  const booking = get(section, 'booking');
  if (!booking) return true;

  const category = get(booking, 'application.testCategory') as TestCategory;
  return category !== TestCategory.ADI2;
};

const deriveError = (journals: ExaminerWorkScheduleOrEmpty[], index: number): string | undefined => {
  // returning undefined when no error so it removes the key
  return ('error' in journals[index]) ? (journals[index] as { error: string; }).error : undefined;
};
