import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { fromEnv, fromIni } from '@aws-sdk/credential-providers';
import { warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { JournalRecord } from '../../domain/JournalRecord';

const createDynamoClient = () => {
  const opts = { region: 'eu-west-1' } as DynamoDBClientConfig;

  if (process.env.USE_CREDENTIALS === 'true') {
    warn('Using AWS credentials');
    opts.credentials = fromIni();
  } else if (process.env.IS_OFFLINE === 'true') {
    warn('Using SLS offline');
    opts.credentials = fromEnv();
    opts.endpoint = process.env.DDB_OFFLINE_ENDPOINT;
  }

  return new DynamoDBClient(opts);
};

export async function getJournal(staffNumber: string): Promise<JournalRecord | null> {
  const ddb = createDynamoClient();
  const tableName = getJournalTableName();

  const response = await ddb.send(
    new GetCommand({
      TableName: tableName,
      Key: { staffNumber },
    })
  );

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
