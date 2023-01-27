import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import isAuthenticated from "../../../middlewares/authVerify";
import Contract from '../contract.model';
import ContractTable from '../contract.table';
import validateGetContractById from './validation';

export const getContractById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
  
  if (!event.queryStringParameters || !event.queryStringParameters.contractId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Contract id not provided.',
    };
  }
  
  const validationResult = validateGetContractById({
    contractId: event.queryStringParameters.contractId,
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

  const { contractId } = validationResult.contractData;

  const contractTable = new ContractTable();

  let contract: Contract | null;
  try {
    contract = await contractTable.getContractById(contractId);
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Contract not found. ${err.message}`,
    };
  }

  if (!contract) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Contract not found.',
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(contract),
  };
};