import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import client from '../../database';
import Contract from './contract.model';

export class ContractTable {
    constructor(
        private readonly dynamoDBClient: DocumentClient = client,
        private readonly contractTable = process.env.CONTRACT_TABLE || 'contract-table',
    ) {}
    
    async getContractById(contractId: string): Promise<Contract> {
        const params = {
            TableName: this.contractTable,
            Key: {
                contractId,
            },
        };
    
        const result = await this.dynamoDBClient.get(params).promise();
    
        return result.Item as Contract;
    }
    
    async createContract(contract: Contract): Promise<Contract> {
        const params = {
            TableName: this.contractTable,
            Item: contract,
        };
    
        await this.dynamoDBClient.put(params).promise();
    
        return contract;
    }

    async updateContract(contract: Contract): Promise<Contract> {
        const params = {
            TableName: this.contractTable,
            Item: contract,
        };
    
        await this.dynamoDBClient.put(params).promise();
        const updatedContract = await this.getContractById(contract.contractId);
    
        return updatedContract;
    }

    async deleteContract(contractId: string): Promise<void> {
        const params = {
            TableName: this.contractTable,
            Key: {
                contractId,
            },
        };
    
        await this.dynamoDBClient.delete(params).promise();
    }

    async getAllContracts(): Promise<Contract[]> {
        const params = {
            TableName: this.contractTable,
        };
    
        const result = await this.dynamoDBClient.scan(params).promise();
    
        return result.Items as Contract[];
    }
}

export default ContractTable;