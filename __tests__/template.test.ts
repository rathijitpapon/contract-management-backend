import {APIGatewayProxyEvent} from 'aws-lambda';
import { createTemplate } from '../src/apis/template/createTemplate/controller';
import { getTemplateById } from '../src/apis/template/getTemplateById/controller';
import { updateTemplate } from '../src/apis/template/updateTemplate/controller';
import { getTemplates } from '../src/apis/template/getTemplates/controller';
import { loginUser } from '../src/apis/user/loginUser/controller';

describe('Template Module Test', () => {
    const user1 = {
        name: 'User 1',
        email: 'user1@gmail.com',
        password: 'password1',
    };

    const template1 = {
        content: 'Template 1',
        templateId: '',
    };

    const template2 = {
        content: 'Template 2',
        templateId: '',
    };

    // Create Template
    test('should create a template', async () => {
        const requestEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                email: user1.email,
                password: user1.password,
            }),
        } as APIGatewayProxyEvent;

        const res = await loginUser(requestEvent);
        const body = JSON.parse(res.body);
        const authToken = body.authToken;

        const templateRequestEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                content: template1.content,
            }),
            headers: {
                Authorization: authToken,
            },
        } as unknown as APIGatewayProxyEvent;

        const templateRes = await createTemplate(templateRequestEvent);
        const templateData = JSON.parse(templateRes.body);

        expect(templateRes.statusCode).toEqual(201);
        expect(templateData).toHaveProperty('templateId');
        expect(templateData).toHaveProperty('content', template1.content);
        expect(templateData).toHaveProperty('createdAt');
        expect(templateData).toHaveProperty('updatedAt');

        template1.templateId = templateData.templateId;
    });

    // Get Template By Id
    test('should get a template by id', async () => {
        const requestEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                email: user1.email,
                password: user1.password,
            }),
        } as APIGatewayProxyEvent;

        const res = await loginUser(requestEvent);
        const body = JSON.parse(res.body);
        const authToken = body.authToken;

        const templateRequestEvent: APIGatewayProxyEvent = {
            queryStringParameters: {
                templateId: template1.templateId,
            },
            headers: {
                Authorization: authToken,
            },
        } as unknown as APIGatewayProxyEvent;

        const templateRes = await getTemplateById(templateRequestEvent);
        console.log(templateRes);
        const templateData = JSON.parse(templateRes.body);

        expect(templateRes.statusCode).toEqual(200);
        expect(templateData).toHaveProperty('templateId', template1.templateId);
        expect(templateData).toHaveProperty('content', template1.content);
        expect(templateData).toHaveProperty('createdAt');
        expect(templateData).toHaveProperty('updatedAt');
    });

    // Get All Templates
    test('should get all templates', async () => {
        const requestEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                email: user1.email,
                password: user1.password,
            }),
        } as APIGatewayProxyEvent;

        const res = await loginUser(requestEvent);
        const body = JSON.parse(res.body);
        const authToken = body.authToken;

        const templateRequestEvent: APIGatewayProxyEvent = {
            headers: {
                Authorization: authToken,
            },
        } as unknown as APIGatewayProxyEvent;

        const templateRes = await getTemplates(templateRequestEvent);
        const templateData = JSON.parse(templateRes.body);

        expect(templateRes.statusCode).toEqual(200);
        expect(templateData).toBeInstanceOf(Array);
        expect(templateData).toHaveLength(1);
    });

    // Update Template
    test('should update a template', async () => {
        const requestEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                email: user1.email,
                password: user1.password,
            }),
        } as APIGatewayProxyEvent;

        const res = await loginUser(requestEvent);
        const body = JSON.parse(res.body);
        const authToken = body.authToken;

        const templateRequestEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                content: template2.content,
            }),
            queryStringParameters: {
                templateId: template1.templateId,
            },
            headers: {
                Authorization: authToken,
            },
        } as unknown as APIGatewayProxyEvent;

        const templateRes = await updateTemplate(templateRequestEvent);
        const templateData = JSON.parse(templateRes.body);

        expect(templateRes.statusCode).toEqual(200);
        expect(templateData).toHaveProperty('templateId', template1.templateId);
        expect(templateData).toHaveProperty('content', template2.content);
        expect(templateData).toHaveProperty('createdAt');
        expect(templateData).toHaveProperty('updatedAt');

        const previousTemplateRequestEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                content: template1.content,
            }),
            queryStringParameters: {
                templateId: template1.templateId,
            },
            headers: {
                Authorization: authToken,
            },
        } as unknown as APIGatewayProxyEvent;

        await updateTemplate(previousTemplateRequestEvent);
    });
});