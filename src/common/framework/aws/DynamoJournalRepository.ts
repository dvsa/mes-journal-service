import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import { JournalRecord } from '../../domain/JournalRecord';

const createDynamoClient = () => {
  return process.env.IS_OFFLINE
    ? DynamoDBDocument.from(new DynamoDB({ endpoint: 'http://dynamodb-local:8000' }))
    : DynamoDBDocument.from(new DynamoDB({ region: 'eu-west-1' }));
};

const ddb = createDynamoClient();
const tableName = getJournalTableName();

export async function getJournal(staffNumber: string): Promise<JournalRecord | null> {
  const response = await ddb.get({
    TableName: tableName,
    Key: { staffNumber },
  });

  if (response.Item === undefined) {
    return null;
  }

  return response.Item as JournalRecord;
}

function getJournalTableName(): string {
  let tableName = process.env.JOURNALS_DDB_TABLE_NAME;
  if (tableName === undefined || tableName.length === 0) {
    warn('No journal table name set, using the default');
    tableName = 'journal';
  }
  return tableName;
}
