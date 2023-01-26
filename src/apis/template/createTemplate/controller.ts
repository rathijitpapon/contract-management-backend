import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Template from '../template.model';
import TemplateTable from '../template.table';
import validateCreateTemplate from './validation';

export const createTemplate = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Template Info not provided.',
    };
  }
  
  const data = JSON.parse(event.body);

  const validationResult = validateCreateTemplate(data);

  if (validationResult.error || !validationResult.template) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Failed',
        errors: validationResult.errors,
      }),
    };
  }

  const templateTable = new TemplateTable();

  let newTemplate: Template;
  try {
    newTemplate = await templateTable.createTemplate(validationResult.template);
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Could not create the template. ${err.message}`,
    };
  }

  if (!newTemplate) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the template.',
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify(newTemplate),
  };
};