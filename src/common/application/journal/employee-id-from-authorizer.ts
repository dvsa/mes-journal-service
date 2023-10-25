import { APIGatewayEventRequestContext } from 'aws-lambda';

export const getRoleFromRequestContext = (requestContext: APIGatewayEventRequestContext): string | null => {
  if (requestContext.authorizer && typeof requestContext.authorizer.examinerRole === 'string') {
    return requestContext.authorizer.examinerRole;
  }
  return null;
};
