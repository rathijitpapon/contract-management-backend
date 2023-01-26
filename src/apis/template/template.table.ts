import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import client from '../../database';
import Template from './template.model';

export class TemplateTable {
    constructor(
        private readonly dynamoDBClient: DocumentClient = client,
        private readonly templateTable = process.env.TEMPLATE_TABLE || 'template-table',
    ) {}
    
    async getTemplateById(templateId: string): Promise<Template> {
        const params = {
            TableName: this.templateTable,
            Key: {
                templateId,
            },
        };
    
        const result = await this.dynamoDBClient.get(params).promise();
    
        return result.Item as Template;
    }
    
    async createTemplate(template: Template): Promise<Template> {
        const params = {
            TableName: this.templateTable,
            Item: template,
        };
    
        await this.dynamoDBClient.put(params).promise();
    
        return template;
    }

    async updateTemplate(template: Template): Promise<Template> {
        const params = {
            TableName: this.templateTable,
            Item: template,
        };
    
        await this.dynamoDBClient.put(params).promise();
        const updatedTemplate = await this.getTemplateById(template.templateId);
    
        return updatedTemplate;
    }

    async deleteTemplate(templateId: string): Promise<void> {
        const params = {
            TableName: this.templateTable,
            Key: {
                templateId,
            },
        };
    
        await this.dynamoDBClient.delete(params).promise();
    }

    async getAllTemplates(): Promise<Template[]> {
        const params = {
            TableName: this.templateTable,
        };
    
        const result = await this.dynamoDBClient.scan(params).promise();
    
        return result.Items as Template[];
    }
}

export default TemplateTable;