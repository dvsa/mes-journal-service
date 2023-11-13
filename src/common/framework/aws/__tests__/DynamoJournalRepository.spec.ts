import * as repository from '../DynamoJournalRepository';
import {mockClient} from 'aws-sdk-client-mock';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {GetCommand, GetCommandOutput} from '@aws-sdk/lib-dynamodb';
import {JournalRecord} from '../../../domain/JournalRecord';

describe('DynamoJournalRepository', () => {
  const mockDynamo = mockClient(DynamoDBClient);
  const dynamoRecord = {
    staffNumber: '1234567',
  } as JournalRecord;

  beforeEach(() => {
    mockDynamo.reset();
    process.env.IS_OFFLINE = 'false';
    process.env.USE_CREDENTIALS = 'false';
  });

  describe('getJournal', () => {
    ['true', 'false'].forEach((value) => {
      it(`should return item from DynamoDB when found & IS_OFFLINE is ${value}`, async () => {
        process.env.IS_OFFLINE = value;
        mockDynamo.on(GetCommand).resolves({ $metadata: {}, Item: dynamoRecord } as GetCommandOutput);
        const record = await repository.getJournal('1234567');
        expect(record).toEqual(dynamoRecord);
      });
    });

    ['true', 'false'].forEach((value) => {
      it(`should return item from DynamoDB when found & USE_CREDENTIALS is ${value}`, async () => {
        process.env.USE_CREDENTIALS = value;
        mockDynamo.on(GetCommand).resolves({ $metadata: {}, Item: dynamoRecord } as GetCommandOutput);
        const record = await repository.getJournal('1234567');
        expect(record).toEqual(dynamoRecord);
      });
    });

    it('should return null when not found in DynamoDB', async () => {
      mockDynamo.on(GetCommand).resolves({ $metadata: {}, Item: undefined } as GetCommandOutput);
      const record = await repository.getJournal('1234567');
      expect(record).toEqual(null);
    });
  });
});
