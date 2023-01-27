import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Contract from '../contract.model';
import ContractTable from '../contract.table';
import TemplateTable from '../../template/template.table';
import UserTable from "../../user/user.table";
import validateUpdateContract from './validation';
import isAuthenticated from "../../../middlewares/authVerify";

export const updateContract = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
  
  if (!event.queryStringParameters || !event.queryStringParameters.contractId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Contract id not provided.',
    };
  }
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Contract data not provided.',
    };
  }
  
  const data = JSON.parse(event.body);

  const validationResult = validateUpdateContract({
    contractId: event.queryStringParameters.contractId,
    ...data,
    userId: authenticatedUser.userId,
  });

  if (validationResult.error || !validationResult.contractData) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Failed',
        errors: validationResult.errors,
      }),
    };
  }

  const { contractId, contractName, description, userId, templateId } = validationResult.contractData;

  const contractTable = new ContractTable();
  const templateTable = new TemplateTable();
  const userTable = new UserTable();
  let updatedContract: Contract | null;

  try {
    const template = await templateTable.getTemplateById(templateId);
    if (!template) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Invalid Template ID.',
      };
    }

    const user = await userTable.getUserById(userId);
    if (!user) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Invalid User ID.',
      };
    }

    const contract = await contractTable.getContractById(contractId);
    if (!contract || contract.userId !== userId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Contract not found',
        }),
      };
    }

    updatedContract = new Contract(
      contractId,
      contractName || contract.contractName,
      description || contract.description,
      userId || contract.userId,
      templateId || contract.templateId,
      contract.createdAt,
      new Date().toISOString(),
    );

    updatedContract = await contractTable.updateContract(updatedContract);
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Could not update the contract. ${err.message}`,
    };
  }

  if (!updatedContract) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Could not update the contract',
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedContract),
  };
};