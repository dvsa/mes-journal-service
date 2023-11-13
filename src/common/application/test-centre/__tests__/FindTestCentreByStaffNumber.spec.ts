import * as DynamoTCRepository from '../../../framework/aws/DynamoTestCentreRepository';
import {TestCentreNotFoundError} from '../../../domain/errors/test-centre-not-found-error';
import {TestCentreDetail} from '../../../domain/TestCentreDetailRecord';
import {findTestCentreDetail} from '../FindTestCentreByStaffNumber';
import {MOCK_TEST_CENTRE_DETAIL_1} from '../__mocks__/test-centre-detail.mock';

describe('FindTestCentreByStaffNumber', () => {
  describe('findTestCentreDetail', () => {
    it('should throw TestCentreNotFoundError when the repo cant find the TCJ', async () => {
      spyOn(DynamoTCRepository, 'getTestCentreByStaffNumber').and.returnValue(Promise.resolve(null));

      try {
        await findTestCentreDetail('1234567');
      } catch (err) {
        expect(err instanceof TestCentreNotFoundError).toBe(true);
        return;
      }
      fail();
    });

    it('should return the TC journal embedded in the wrapper', async () => {
      spyOn(DynamoTCRepository, 'getTestCentreByStaffNumber').and.returnValue(
        Promise.resolve(MOCK_TEST_CENTRE_DETAIL_1),
      );

      try {
        const data = await findTestCentreDetail('1234567');
        expect(data).toEqual({
          staffNumber: '1234567',
          examiners: [
            { name: 'Joe Bloggs', staffNumber: '1234567', journal: {  } },
            { name: 'Other Person', staffNumber: '9876543', journal: {  } },
          ],
          testCentreIDs: [123, 456],
        } as TestCentreDetail);
      } catch (err) {
        fail();
      }
    });
  });
});
