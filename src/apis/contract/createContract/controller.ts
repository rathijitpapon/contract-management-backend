import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Contract from '../contract.model';
import ContractTable from '../contract.table';
import TemplateTable from '../../template/template.table';
import UserTable from "../../user/user.table";
import validateCreateContract from './validation';
import isAuthenticated from "../../../middlewares/authVerify";

export const createContract = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

  const authenticatedUser = authData.user;
  
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Contract Info not provided.',
    };
  }
  
  const data = JSON.parse(event.body);

  const validationResult = validateCreateContract({
    ...data,
    userId: authenticatedUser.userId,
  });

  if (validationResult.error || !validationResult.contract) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Failed',
        errors: validationResult.errors,
      }),
    };
  }

  const contractTable = new ContractTable();
  const templateTable = new TemplateTable();
  const userTable = new UserTable();
  const contract = validationResult.contract;

  let newContract: Contract;
  try {
    const template = await templateTable.getTemplateById(contract.templateId);
    if (!template) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Invalid Template ID.',
      };
    }

    const user = await userTable.getUserById(contract.userId);
    if (!user) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Invalid User ID.',
      };
    }

    newContract = await contractTable.createContract(validationResult.contract);
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Could not create the contract. ${err.message}`,
    };
  }

  if (!newContract) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the contract.',
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify(newContract),
  };
};