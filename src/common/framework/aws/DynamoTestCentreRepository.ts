import { DynamoDBClient, DynamoDBClientConfig} from '@aws-sdk/client-dynamodb';
import { error, info, warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import { fromEnv, fromIni } from '@aws-sdk/credential-providers';
import { GetCommand, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import { TestCentreDetail } from '../../domain/TestCentreDetailRecord';
import { AttributeValue } from 'aws-lambda';

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

/**
 * Performs a full scan of a DynamoDB table and retrieves all items before filtering for test centre.
 * @param tcID - Test Centre Id to filter results.
 */
export const getTestCentreByID = async <T>(
  tcID: number,
): Promise<null | T[]> => {
  const ddb = createDynamoClient();
  const tableName = getTestCentreTableName();

  const rows: T[] = [];
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined = undefined;

  const params = {
    TableName: tableName,
    FilterExpression: 'contains(testCentreIDs, :tcID)',
    ExpressionAttributeValues: { ':tcID': tcID },
    ExclusiveStartKey: lastEvaluatedKey,
  } as ScanCommandInput;

  do {
    try {
      const response = await ddb.send(
        new ScanCommand(params)
      );

      if (response.Items) {
        info(`Found ${response.Items.length} items in DynamoDB`);
        rows.push(...response.Items as T[]);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
      params.ExclusiveStartKey = response.LastEvaluatedKey;
    } catch (err) {
      error('`ScanCommand` has thrown an error.', err);
      throw err;
    }
  } while (!!lastEvaluatedKey);

  return rows.length === 0 ? null : rows;
};

function getTestCentreTableName(): string {
  let tableName = process.env.TEST_CENTRE_DDB_TABLE_NAME;
  if (tableName === undefined || tableName.length === 0) {
    warn('No test centre table name set, using the default');
    tableName = 'test-centre';
  }
  return tableName;
}
