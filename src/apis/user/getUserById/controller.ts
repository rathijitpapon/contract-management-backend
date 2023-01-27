import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import User from '../user.model';
import UserTable from '../user.table';
import validateGetUserById from './validation';

export const getUserById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.queryStringParameters || !event.queryStringParameters.userId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'User id not provided.',
    };
  }
  
  const validationResult = validateGetUserById({
    userId: event.queryStringParameters.userId,
  });

  if (validationResult.error || !validationResult.userData) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Failed',
        errors: validationResult.errors,
      }),
    };
  }

  const { userId } = validationResult.userData;

  const userTable = new UserTable();

  let user: User | null;
  try {
    user = await userTable.getUserById(userId);
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `User not found. ${err.message}`,
    };
  }

  if (!user) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'User not found.',
    };
  }

  delete user.password;
  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
};