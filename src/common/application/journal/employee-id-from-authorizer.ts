import { APIGatewayEventRequestContext } from 'aws-lambda';

export const getEmployeeIdFromRequestContext = (requestContext: APIGatewayEventRequestContext): string | null => {
  if (requestContext.authorizer && typeof requestContext.authorizer.staffNumber === 'string') {
    return requestContext.authorizer.staffNumber;
  }
  return null;
};

export const getRoleFromRequestContext = (requestContext: APIGatewayEventRequestContext): string | null => {
  if (requestContext.authorizer && typeof requestContext.authorizer.examinerRole === 'string') {
    return requestContext.authorizer.examinerRole;
  }
  return null;
};
