import * as repository from '../DynamoTestCentreRepository';
import {mockClient} from 'aws-sdk-client-mock';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {GetCommand, GetCommandOutput, ScanCommand, ScanCommandOutput} from '@aws-sdk/lib-dynamodb';
import {TestCentreDetail} from '../../../domain/TestCentreDetailRecord';

describe('DynamoTestCentreRepository', () => {
  const mockDynamo = mockClient(DynamoDBClient);
  const dynamoRecord = {
    staffNumber: '1234567',
    testCentreIDs: [897],
  } as TestCentreDetail;

  beforeEach(() => {
    mockDynamo.reset();
    process.env.IS_OFFLINE = 'false';
    process.env.USE_CREDENTIALS = 'false';
  });

  describe('getTestCentreByStaffNumber', () => {
    ['true', 'false'].forEach((value) => {
      it(`should return item from DynamoDB when found & IS_OFFLINE is ${value}`, async () => {
        process.env.IS_OFFLINE = value;
        mockDynamo.on(GetCommand).resolves({ $metadata: {}, Item: dynamoRecord } as GetCommandOutput);
        const record = await repository.getTestCentreByStaffNumber('1234567');
        expect(record).toEqual(dynamoRecord);
      });
    });

    ['true', 'false'].forEach((value) => {
      it(`should return item from DynamoDB when found & USE_CREDENTIALS is ${value}`, async () => {
        process.env.USE_CREDENTIALS = value;
        mockDynamo.on(GetCommand).resolves({ $metadata: {}, Item: dynamoRecord } as GetCommandOutput);
        const record = await repository.getTestCentreByStaffNumber('1234567');
        expect(record).toEqual(dynamoRecord);
      });
    });

    it('should return null when not found in DynamoDB', async () => {
      mockDynamo.on(GetCommand).resolves({ $metadata: {}, Item: undefined } as GetCommandOutput);
      const record = await repository.getTestCentreByStaffNumber('1234567');
      expect(record).toEqual(null);
    });
  });

  describe('getTestCentreByID', () => {
    ['true', 'false'].forEach((value) => {
      it(`should return item from DynamoDB when found & IS_OFFLINE is ${value}`, async () => {
        process.env.IS_OFFLINE = value;
        mockDynamo.on(ScanCommand).resolves({ $metadata: {}, Items: [dynamoRecord] } as ScanCommandOutput);
        const record = await repository.getTestCentreByID(123);
        expect(record).toEqual([dynamoRecord]);
      });
    });

    ['true', 'false'].forEach((value) => {
      it(`should return item from DynamoDB when found & USE_CREDENTIALS is ${value}`, async () => {
        process.env.USE_CREDENTIALS = value;
        mockDynamo.on(ScanCommand).resolves({ $metadata: {}, Items: [dynamoRecord] } as ScanCommandOutput);
        const record = await repository.getTestCentreByID(123);
        expect(record).toEqual([dynamoRecord]);
      });
    });

    it('should return null when not found in DynamoDB', async () => {
      mockDynamo.on(ScanCommand).resolves({ Items: undefined } as ScanCommandOutput);
      const record = await repository.getTestCentreByID(123);
      expect(record).toEqual(null);
    });
  });
});
