import redisClient from '../../utils/createRedisClient';
import createResponse from '../../utils/createResponse';
import { APIGatewayProxyEvent, Context, Callback } from  'aws-lambda';

export function handler(event: APIGatewayProxyEvent, context: Context, callback: Callback) {
    context.callbackWaitsForEmptyEventLoop = false;
    get(event.queryStringParameters.email, callback);
}

function get(email: string, callback: Callback) {
    function onGet(err, resp) {
        let message;
        let response;

        if (err) {
            message = 'Error'
            response = createResponse({
                    body: {
                        message,
                        err,
                    },
                    statusCode: 500,
            })
            callback(response);
        }

        let data = JSON.parse(resp);
        message = 'Success'
        response = createResponse({
            body: {
                message,
                data,
            }
        })
        callback(null, response);
    }
    redisClient.get(email, onGet);
}