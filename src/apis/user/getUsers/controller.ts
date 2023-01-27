import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import isAuthenticated from "../../../middlewares/authVerify";
import User from '../user.model';
import UserTable from '../user.table';

export const getUsers = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const authData = await isAuthenticated(event);
  if (authData.isError || !authData.user) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: 'Unauthorized',
        errors: authData.errors,
      }),
    };
  }
  
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

  users.forEach((_user, index) => {
    delete users[index].password;
  });

  return {
    statusCode: 200,
    body: JSON.stringify(users),
  };
};