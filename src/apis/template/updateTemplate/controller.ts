import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import isAuthenticated from "../../../middlewares/authVerify";
import Template from '../template.model';
import TemplateTable from '../template.table';
import validateUpdateTemplate from './validation';

export const updateTemplate = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
  
  if (!event.queryStringParameters || !event.queryStringParameters.templateId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Template id not provided.',
    };
  }
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Template data not provided.',
    };
  }
  
  const data = JSON.parse(event.body);

  const validationResult = validateUpdateTemplate({
    templateId: event.queryStringParameters.templateId,
    ...data,
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

  const { templateId, content } = validationResult.templateData;

  const templateTable = new TemplateTable();
  let updatedTemplate: Template | null;

  try {
    const template = await templateTable.getTemplateById(templateId);

    if (!template) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Template not found',
        }),
      };
    }

    updatedTemplate = new Template(
      templateId,
      content || template.content,
      template.createdAt,
      new Date().toISOString(),
    );

    updatedTemplate = await templateTable.updateTemplate(updatedTemplate);
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Could not update the template. ${err.message}`,
    };
  }

  if (!updatedTemplate) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Could not update the template',
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedTemplate),
  };
};