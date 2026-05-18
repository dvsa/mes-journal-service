import * as DynamoTCRepository from '../../../framework/aws/DynamoTestCentreRepository';
import {findTestCentreDetailsByCostCode} from '../FindTestCentreByCostCode';
import {TestCentreCostCodeNotFoundError} from '../../../domain/errors/test-centre-not-found-error';
import {TestCentreDetail} from '../../../domain/TestCentreDetailRecord';
import {MOCK_TEST_CENTRE_DETAIL_RESPONSES} from '../__mocks__/test-centre-detail.mock';

describe('FindTestCentreByCostCode', () => {
  describe('findTestCentreDetailsByCostCode', () => {
    it('should throw TestCentreCostCodeNotFoundError when the repo cant find the TCJ', async () => {
      spyOn(DynamoTCRepository, 'getTestCentreByCostCode').and.returnValue(Promise.resolve(null));

      try {
        await findTestCentreDetailsByCostCode('1234');
      } catch (err) {
        expect(err instanceof TestCentreCostCodeNotFoundError).toBe(true);
        return;
      }
      fail();
    });

    it('should return the TC journal embedded in the wrapper', async () => {
      spyOn(DynamoTCRepository, 'getTestCentreByCostCode').and.returnValue(
        Promise.resolve(MOCK_TEST_CENTRE_DETAIL_RESPONSES),
      );

      try {
        const data = await findTestCentreDetailsByCostCode('1234');
        expect(data).toEqual({
          staffNumber: '',
          examiners: [
            { name: 'Joe Bloggs', staffNumber: '1234567', journal: {  } },
            { name: 'Other Person', staffNumber: '9876543', journal: {  } },
          ],
          testCentreCostCodes: ['1234'],
        } as TestCentreDetail);
      } catch (err) {
        fail();
      }
    });
  });
});
