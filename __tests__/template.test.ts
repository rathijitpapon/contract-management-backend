import { APIGatewayProxyEvent } from 'aws-lambda';
import * as uuid from 'uuid';
import { createTemplate } from '../src/apis/template/createTemplate/controller';
import { getTemplateById } from '../src/apis/template/getTemplateById/controller';
import { updateTemplate } from '../src/apis/template/updateTemplate/controller';
import { getTemplates } from '../src/apis/template/getTemplates/controller';
import { registerUser } from '../src/apis/user/registerUser/controller';

const user1 = {
    name: 'User 1',
    email: 'user1@gmail.com',
    password: 'password1',
};

const template1 = {
    content: 'Template 1',
};

const template2 = {
    content: 'Template 2',
};

const createTemplateForTesting = async () => {
    // Register User
    user1.email = `user${uuid.v4()}@gmail.com`;
    const requestEvent: APIGatewayProxyEvent = {
        body: JSON.stringify(user1),
    } as APIGatewayProxyEvent;

    const res = await registerUser(requestEvent);
    const body = JSON.parse(res.body);
    const authToken = body.authToken;

    // Create Template
    const templateRequestEvent: APIGatewayProxyEvent = {
        body: JSON.stringify({
            content: template1.content,
        }),
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    } as unknown as APIGatewayProxyEvent;

    const templateRes = await createTemplate(templateRequestEvent);

    return {
        authToken,
        templateRes,
    };
};

describe('Template Module Test', () => {

    // Create Template
    test('should create a template', async () => {
        // Create Template
        const createTemplateRes = await createTemplateForTesting();
        const templateRes = createTemplateRes.templateRes;
        const templateData = JSON.parse(templateRes.body);

        expect(templateRes.statusCode).toEqual(201);
        expect(templateData).toHaveProperty('templateId');
        expect(templateData).toHaveProperty('content', template1.content);
        expect(templateData).toHaveProperty('createdAt');
        expect(templateData).toHaveProperty('updatedAt');
    });

    // Get Template By Id
    test('should get a template by id', async () => {
        // Create Template
        const createTemplateRes = await createTemplateForTesting();
        const authToken = createTemplateRes.authToken;
        const createTemplateData = JSON.parse(createTemplateRes.templateRes.body);

        // Get Template By Id
        const templateRequestEvent: APIGatewayProxyEvent = {
            queryStringParameters: {
                templateId: createTemplateData.templateId,
            },
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        } as unknown as APIGatewayProxyEvent;

        const templateRes = await getTemplateById(templateRequestEvent);
        const templateData = JSON.parse(templateRes.body);

        expect(templateRes.statusCode).toEqual(200);
        expect(templateData).toHaveProperty('templateId', createTemplateData.templateId);
        expect(templateData).toHaveProperty('content', template1.content);
        expect(templateData).toHaveProperty('createdAt');
        expect(templateData).toHaveProperty('updatedAt');
    });

    // Get All Templates
    test('should get all templates', async () => {
        // Create Template
        const createTemplateRes = await createTemplateForTesting();
        const authToken = createTemplateRes.authToken;

        // Get All Templates
        const templateRequestEvent: APIGatewayProxyEvent = {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        } as unknown as APIGatewayProxyEvent;

        const templateRes = await getTemplates(templateRequestEvent);
        const templateData = JSON.parse(templateRes.body);

        expect(templateRes.statusCode).toEqual(200);
        expect(templateData).toBeInstanceOf(Array);
    });

    // Update Template
    test('should update a template', async () => {
        // Create Template
        const createTemplateRes = await createTemplateForTesting();
        const authToken = createTemplateRes.authToken;
        const createTemplateData = JSON.parse(createTemplateRes.templateRes.body);

        // Update Template
        const templateRequestEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                content: template2.content,
            }),
            queryStringParameters: {
                templateId: createTemplateData.templateId,
            },
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        } as unknown as APIGatewayProxyEvent;

        const templateRes = await updateTemplate(templateRequestEvent);
        const templateData = JSON.parse(templateRes.body);

        expect(templateRes.statusCode).toEqual(200);
        expect(templateData).toHaveProperty('templateId', createTemplateData.templateId);
        expect(templateData).toHaveProperty('content', template2.content);
        expect(templateData).toHaveProperty('createdAt');
        expect(templateData).toHaveProperty('updatedAt');
    });
});