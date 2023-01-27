import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import bcrypt from 'bcryptjs';
import User from '../user.model';
import UserTable from '../user.table';
import validateRegisterUser from './validation';

export const registerUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'User Info not provided.',
    };
  }
  
  const data = JSON.parse(event.body);

  const validationResult = validateRegisterUser(data);

  if (validationResult.error || !validationResult.user) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Failed',
        errors: validationResult.errors,
      }),
    };
  }

  const userTable = new UserTable();

  let newUser: User;
  try {
    const user = await userTable.getUserByEmail(validationResult.user.email);
    if (user) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Could not create the user.',
          errors: {
            email: 'Email already exists.',
          },
        }),
      };
    }

    if (validationResult.user.password) {
      validationResult.user.password = await bcrypt.hash(validationResult.user.password, 10);
    }

    newUser = await userTable.createUser(validationResult.user);
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Could not create the user. ${err.message}`,
    };
  }

  if (!newUser) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the user.',
    };
  }

  delete newUser.password;
  return {
    statusCode: 201,
    body: JSON.stringify(newUser),
  };
};