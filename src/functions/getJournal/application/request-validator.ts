import { APIGatewayProxyEventHeaders, APIGatewayProxyEventPathParameters } from 'aws-lambda/trigger/api-gateway-proxy';
import { warn } from '@dvsa/mes-microservice-common/application/utils/logger';

export function getStaffNumber(pathParams: APIGatewayProxyEventPathParameters | null): string | null {
  if (pathParams === null
        || typeof pathParams.staffNumber !== 'string'
        || pathParams.staffNumber.trim().length === 0) {
    warn('No staffNumber path parameter found');
    return null;
  }
  return pathParams.staffNumber;
}

export const getIfModifiedSinceHeaderAsTimestamp = (headers: APIGatewayProxyEventHeaders): number | null => {
  for (const headerName of Object.keys(headers)) {
    if (headerName.toLowerCase() === 'if-modified-since') {
      const ifModfiedSinceHeaderValue = headers[headerName] as string;
      const parsedIfModifiedSinceHeader = Date.parse(ifModfiedSinceHeaderValue);
      return Number.isNaN(parsedIfModifiedSinceHeader) ? null : parsedIfModifiedSinceHeader;
    }
  }
  return null;
};
