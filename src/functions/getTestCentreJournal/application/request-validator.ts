import {APIGatewayProxyEventPathParameters} from 'aws-lambda';

export function getTestCentreID(pathParams: APIGatewayProxyEventPathParameters | null): string | null {
  if (pathParams === null
        || typeof pathParams.testCentreId !== 'string'
        || pathParams.testCentreId.trim().length === 0
  ) {
    return null;
  }
  return pathParams.testCentreId;
}
