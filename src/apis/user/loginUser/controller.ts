import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
const jwt = require('jsonwebtoken');
import User from '../user.model';
import UserTable from '../user.table';
import validateLoginUser from './validation';

const jwtSecret = process.env.JWT_SECRET || 'defaultsecret';

export const loginUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Email or password not provided.',
    };
  }
  
  const data = JSON.parse(event.body);

  const validationResult = validateLoginUser(data);

  if (validationResult.error || !validationResult.loginData) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Failed',
        errors: validationResult.errors,
      }),
    };
  }

  const { email, password } = validationResult.loginData;

  const userTable = new UserTable();

  let user: User | null;
  try {
    user = await userTable.getUserByEmailAndPassword(email, password);
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Invalid email or password. ${err.message}`,
    };
  }

  if (!user) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Invalid email or password',
    };
  }

  delete user.password;

  const authToken = jwt.sign({ id: user.userId }, jwtSecret, { expiresIn: '1h' });
  return {
    statusCode: 200,
    body: JSON.stringify({
      user,
      authToken,
    }),
  };
};