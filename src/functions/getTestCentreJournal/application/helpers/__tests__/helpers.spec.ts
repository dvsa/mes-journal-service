import * as moment from 'moment';
import { constructResponseArray, isNonADI2TestSlot } from '../helpers';
import {
  mockExaminerWorkSchedulesOrEmpty,
  mockTestCentreDetailFromDynamo,
} from '../__mocks__/helpers.mock';
import { TestCentreDetailResponse } from '../../../../../common/domain/TestCentreDetailRecord';
import { TestCategory } from '@dvsa/mes-test-schema/category-definitions/common/test-category';
import { TestSlot } from '@dvsa/mes-journal-schema';

describe('constructResponseArray', () => {
  // eslint-disable-next-line
  it('should filter the examiner work schedules by testCentreID and date, returning errors if journals not found', () => {
    const response: TestCentreDetailResponse = constructResponseArray(
      mockTestCentreDetailFromDynamo,
      mockExaminerWorkSchedulesOrEmpty,
    );
    const date = new Date();
    const today: string = moment(date).format('YYYY-MM-DD');
    const tomorrow: string = moment(date).add(1, 'day').format('YYYY-MM-DD');
    expect(response).toEqual({
      staffNumber: '123456',
      examiners: [
        {
          name: 'Some name',
          staffNumber: '987654',
          journal: null,
          error: 'Journal not found',
        },
        {
          name: 'User name',
          staffNumber: '123456',
          journal: {
            examiner: {
              staffNumber: '123456',
              individualId: 47328923,
            },
            testSlots: [
              {
                slotDetail: { start: `${today}T12:00:00` },
                testCentre: { centreId: 1234, centreName: 'Swansea' },
                booking: { application: { testCategory: TestCategory.BE } },
              },
              {
                slotDetail: { start: `${today}T13:00:00` },
                testCentre: { centreId: 1234, centreName: 'Swansea' },
                booking: { application: { testCategory: TestCategory.B } },
              },
              {
                slotDetail: { start: `${today}T14:00:00` },
                testCentre: { centreId: 1234, centreName: 'Swansea' },
                booking: { application: { testCategory: TestCategory.ADI2 } },
              },
              {
                slotDetail: { start: `${tomorrow}T12:00:00` },
                testCentre: { centreId: 1289, centreName: 'Neath' },
                booking: { application: { testCategory: TestCategory.C } },
              },
            ],
            personalCommitments: [],
            nonTestActivities: [],
            advanceTestSlots: [],
            deployments: [],
          },
          error: undefined,
        },
        {
          name: 'Another name',
          staffNumber: '543789',
          journal: null,
          error: 'Journal decompression error',
        },
      ],
      testCentres: [
        { name: 'Swansea', id: 1234 },
        { name: 'Neath', id: 1289 },
      ],
    } as TestCentreDetailResponse);
  });
});

describe('isNonADI2TestSlot', () => {
  it('should return true when no booking', () => {
    expect(isNonADI2TestSlot(undefined as any)).toEqual(true);
    expect(isNonADI2TestSlot(null as any)).toEqual(true);
    expect(isNonADI2TestSlot({})).toEqual(true);
    expect(isNonADI2TestSlot({ examinerVisiting: false })).toEqual(true);
  });
  it('should return true when booking but is not an ADI slot', () => {
    expect(isNonADI2TestSlot({
      booking: { application: { testCategory: TestCategory.BE } },
    } as TestSlot)).toEqual(true);
  });
  it('should return false when an ADI slot', () => {
    expect(isNonADI2TestSlot({
      booking: { application: { testCategory: TestCategory.ADI2 } },
    } as TestSlot)).toEqual(false);
  });
});
