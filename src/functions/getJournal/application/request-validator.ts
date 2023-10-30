import { APIGatewayProxyEventHeaders } from 'aws-lambda/trigger/api-gateway-proxy';

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
