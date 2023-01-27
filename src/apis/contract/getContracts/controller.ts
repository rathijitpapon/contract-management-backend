import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import isAuthenticated from "../../../middlewares/authVerify";
import Contract from '../contract.model';
import ContractTable from '../contract.table';

export const getContracts = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
  
  const contractTable = new ContractTable();

  let contracts: Contract[];
  try {
    contracts = await contractTable.getAllContracts();
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `No Contract found. ${err.message}`,
    };
  }

  if (!contracts || contracts.length === 0) {
    contracts = [];
  }

  return {
    statusCode: 200,
    body: JSON.stringify(contracts),
  };
};