import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import User from '../user.model';
import UserTable from '../user.table';

export const getUsers = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userTable = new UserTable();

  let users: User[];
  try {
    users = await userTable.getAllUsers();
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `No User found. ${err.message}`,
    };
  }

  if (!users || users.length === 0) {
    users = [];
  }

  return {
    statusCode: 200,
    body: JSON.stringify(users),
  };
};