import { APIGatewayProxyEvent } from 'aws-lambda';
import * as uuid from 'uuid';
import { createContract } from '../src/apis/contract/createContract/controller';
import { getContractById } from '../src/apis/contract/getContractById/controller';
import { createTemplate } from '../src/apis/template/createTemplate/controller';
import { registerUser } from '../src/apis/user/registerUser/controller';
import { getContracts } from '../src/apis/contract/getContracts/controller';
import { updateContract } from '../src/apis/contract/updateContract/controller';

const user1 = {
    name: 'User 1',
    email: 'user1@gmail.com',
    password: 'password1',
};

const template1 = {
    content: 'Template 1',
};

const contract1 = {
    contractName: 'Contract 1',
    description: 'Description 1',
};

const contract2 = {
    contractName: 'Contract 2',
    description: 'Description 2',
};

const createContractForTesting = async () => {
    // Register User
    user1.email = `user${uuid.v4()}@gmail.com`;
    const registerRequestEvent: APIGatewayProxyEvent = {
        body: JSON.stringify(user1),
    } as APIGatewayProxyEvent;

    const res = await registerUser(registerRequestEvent);
    const body = JSON.parse(res.body);
    const userData = body.user;
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
    const templateData = JSON.parse(templateRes.body);

    // Create Contract
    const contractRequestEvent: APIGatewayProxyEvent = {
        body: JSON.stringify({
            contractName: contract1.contractName,
            description: contract1.description,
            templateId: templateData.templateId,
        }),
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    } as unknown as APIGatewayProxyEvent;

    const contractRes = await createContract(contractRequestEvent);

    return {
        authToken,
        userData,
        templateData,
        contractRes,
    };
};

describe('Template Module Test', () => {

    // Create Contract
    test('should create a contract', async () => {
        const { userData, templateData, contractRes } = await createContractForTesting();
        const contractData = JSON.parse(contractRes.body);

        expect(contractRes.statusCode).toEqual(201);
        expect(contractData).toHaveProperty('contractId');
        expect(contractData).toHaveProperty('contractName', contract1.contractName);
        expect(contractData).toHaveProperty('description', contract1.description);
        expect(contractData).toHaveProperty('templateId', templateData.templateId);
        expect(contractData).toHaveProperty('userId', userData.userId);
        expect(contractData).toHaveProperty('createdAt');
        expect(contractData).toHaveProperty('updatedAt');
    });

    // Get Contract By Id
    test('should get a contract by id', async () => {
        const { authToken, userData, templateData, contractRes } = await createContractForTesting();
        const contractData = JSON.parse(contractRes.body);

        const requestEvent: APIGatewayProxyEvent = {
            queryStringParameters: {
                contractId: contractData.contractId,
            },
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        } as unknown as APIGatewayProxyEvent;

        const res = await getContractById(requestEvent);
        const body = JSON.parse(res.body);

        expect(res.statusCode).toEqual(200);
        expect(body).toHaveProperty('contractId', contractData.contractId);
        expect(body).toHaveProperty('contractName', contract1.contractName);
        expect(body).toHaveProperty('description', contract1.description);
        expect(body).toHaveProperty('templateId', templateData.templateId);
        expect(body).toHaveProperty('userId', userData.userId);
        expect(body).toHaveProperty('createdAt');
        expect(body).toHaveProperty('updatedAt');
    });

    // Get All Contracts
    test('should get all contracts', async () => {
        const { authToken } = await createContractForTesting();

        const requestEvent: APIGatewayProxyEvent = {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        } as unknown as APIGatewayProxyEvent;

        const res = await getContracts(requestEvent);
        const body = JSON.parse(res.body);

        expect(res.statusCode).toEqual(200);
        expect(body).toBeInstanceOf(Array);
    });

    // Update Contract
    test('should update a contract', async () => {
        const { authToken, userData, templateData, contractRes } = await createContractForTesting();
        const contractData = JSON.parse(contractRes.body);

        const requestEvent: APIGatewayProxyEvent = {
            queryStringParameters: {
                contractId: contractData.contractId,
            },
            body: JSON.stringify({
                contractName: contract2.contractName,
                description: contract2.description,
                templateId: templateData.templateId,
            }),
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        } as unknown as APIGatewayProxyEvent;

        const res = await updateContract(requestEvent);
        const body = JSON.parse(res.body);

        expect(res.statusCode).toEqual(200);
        expect(body).toHaveProperty('contractId', contractData.contractId);
        expect(body).toHaveProperty('contractName', contract2.contractName);
        expect(body).toHaveProperty('description', contract2.description);
        expect(body).toHaveProperty('templateId', templateData.templateId);
        expect(body).toHaveProperty('userId', userData.userId);
        expect(body).toHaveProperty('createdAt');
        expect(body).toHaveProperty('updatedAt');
    });
});
