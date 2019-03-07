import { DynamoDB } from 'aws-sdk';
import * as logger from '../../../../common/application/utils/logger';
import { JournalRecord } from '../../domain/JournalRecord';

const createDynamoClient = () => {
  return process.env.IS_OFFLINE
    ? new DynamoDB.DocumentClient({ endpoint: 'http://localhost:8000' })
    : new DynamoDB.DocumentClient();
};

const ddb = createDynamoClient();
const tableName = getJournalTableName();

export async function getJournal(staffNumber: string): Promise<JournalRecord | null> {
  const journalGetResult = await ddb.get({
    TableName: tableName,
    Key: {
      staffNumber,
    },
  }).promise();

  if (journalGetResult.Item === undefined) {
    return null;
  }

  return journalGetResult.Item as JournalRecord;
}

function getJournalTableName(): string {
  let tableName = process.env.JOURNALS_DDB_TABLE_NAME;
  if (tableName === undefined || tableName.length === 0) {
    logger.warn('No journal table name set, using the default');
    tableName = 'journal';
  }
  return tableName;
}
