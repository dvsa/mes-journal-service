import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { warn } from '@dvsa/mes-microservice-common/application/utils/logger';
import { TestCentreDetail } from '../../domain/TestCentreDetailRecord';

const createDynamoClient = () => {
  return process.env.IS_OFFLINE
    ? DynamoDBDocument.from(new DynamoDB({ endpoint: 'http://dynamodb-local:8000' }))
    : DynamoDBDocument.from(new DynamoDB({ region: 'eu-west-1' }));
};

const ddb = createDynamoClient();
const tableName = getTestCentreTableName();

export async function getTestCentreByStaffNumber(staffNumber: string): Promise<TestCentreDetail | null> {
  const response = await ddb.get({
    TableName: tableName,
    Key: { staffNumber },
  });

  if (response.Item === undefined) {
    return null;
  }

  return response.Item as TestCentreDetail;
}

export async function getTestCentreByID(tcID: number): Promise<TestCentreDetail[] | null> {
  const response = await ddb.scan({
    TableName: tableName,
    FilterExpression: 'contains (testCentreIDs, :tcID)',
    ExpressionAttributeValues : { ':tcID' : tcID },
  });

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
