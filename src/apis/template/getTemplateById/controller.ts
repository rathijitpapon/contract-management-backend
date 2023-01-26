import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Template from '../template.model';
import TemplateTable from '../template.table';
import validateGetTemplateById from './validation';

export const getTemplateById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.queryStringParameters || !event.queryStringParameters.templateId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Template id not provided.',
    };
  }
  
  const validationResult = validateGetTemplateById({
    templateId: event.queryStringParameters.templateId,
  });

  if (validationResult.error || !validationResult.templateData) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Failed',
        errors: validationResult.errors,
      }),
    };
  }

  const { templateId } = validationResult.templateData;

  const templateTable = new TemplateTable();

  let template: Template | null;
  try {
    template = await templateTable.getTemplateById(templateId);
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Template not found. ${err.message}`,
    };
  }

  if (!template) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Template not found.',
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(template),
  };
};