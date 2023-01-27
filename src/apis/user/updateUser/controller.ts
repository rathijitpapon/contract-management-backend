import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import bcrypt from 'bcryptjs';
import User from '../user.model';
import UserTable from '../user.table';
import validateUpdateUser from './validation';

export const updateUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.queryStringParameters || !event.queryStringParameters.userId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'User id not provided.',
    };
  }
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'User data not provided.',
    };
  }
  
  const data = JSON.parse(event.body);

  const validationResult = validateUpdateUser({
    userId: event.queryStringParameters.userId,
    ...data,
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

  const { userId, email, password, name } = validationResult.userData;

  const userTable = new UserTable();
  let updatedUser: User | null;

  try {
    const user = await userTable.getUserById(userId);

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'User not found',
        }),
      };
    }

    if (email && email !== user.email) {
      const userByEmail = await userTable.getUserByEmail(email);
      if (userByEmail) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Could not update the user.',
            errors: {
              email: 'Email already exists.',
            },
          }),
        };
      }
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    updatedUser = new User(
      userId,
      name || user.name,
      email || user.email,
      user.password || '',
      user.createdAt,
      new Date().toISOString(),
    );

    updatedUser = await userTable.updateUser(updatedUser);
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Could not update the user. ${err.message}`,
    };
  }

  if (!updatedUser) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Could not update the user',
      }),
    };
  }

  delete updatedUser.password;
  return {
    statusCode: 200,
    body: JSON.stringify(updatedUser),
  };
};