import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';
import { warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import { JournalRecord } from '../../domain/JournalRecord';

const createDynamoClient = (): DynamoDBDocument => {
  const opts = { region: 'eu-west-1' } as DynamoDBClientConfig;

  if (process.env.USE_CREDENTIALS === 'true') {
    warn('Using AWS credentials');
    opts.credentials = fromIni();
  } else if (process.env.IS_OFFLINE === 'true') {
    warn('Using SLS offline');
    opts.endpoint = process.env.DDB_OFFLINE_ENDPOINT;
  }

  return DynamoDBDocument.from(new DynamoDBClient(opts));
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
