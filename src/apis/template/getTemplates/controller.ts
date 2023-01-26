import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Template from '../template.model';
import TemplateTable from '../template.table';

export const getTemplates = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const templateTable = new TemplateTable();

  let templates: Template[];
  try {
    templates = await templateTable.getAllTemplates();
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `No Template found. ${err.message}`,
    };
  }

  if (!templates || templates.length === 0) {
    templates = [];
  }

  return {
    statusCode: 200,
    body: JSON.stringify(templates),
  };
};