import { DynamoDBClient, DynamoDBClientConfig} from '@aws-sdk/client-dynamodb';
import { warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import { fromEnv, fromIni } from '@aws-sdk/credential-providers';
import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { TestCentreDetail } from '../../domain/TestCentreDetailRecord';

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

export async function getTestCentreByStaffNumber(staffNumber: string): Promise<TestCentreDetail | null> {
  const ddb = createDynamoClient();
  const tableName = getTestCentreTableName();

  const response = await ddb.send(
    new GetCommand({
      TableName: tableName,
      Key: { staffNumber },
    })
  );

  if (response.Item === undefined) {
    return null;
  }

  return response.Item as TestCentreDetail;
}

export async function getTestCentreByID(tcID: number): Promise<TestCentreDetail[] | null> {
  const ddb = createDynamoClient();
  const tableName = getTestCentreTableName();

  const response = await ddb.send(
    new ScanCommand({
      TableName: tableName,
      FilterExpression: 'contains (testCentreIDs, :tcID)',
      ExpressionAttributeValues : { ':tcID' : tcID },
    })
  );

  if (response?.Items === undefined || response?.Items?.length === 0) {
    return null;
  }

  return response?.Items as TestCentreDetail[];
}

function getTestCentreTableName(): string {
  let tableName = process.env.TEST_CENTRE_DDB_TABLE_NAME;
  if (tableName === undefined || tableName.length === 0) {
    warn('No test centre table name set, using the default');
    tableName = 'test-centre';
  }
  return tableName;
}
