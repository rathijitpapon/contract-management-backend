import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import client from '../../database';
import User from './user.model';

export class UserTable {
    constructor(
        private readonly dynamoDBClient: DocumentClient = client,
        private readonly userTable = process.env.USER_TABLE || 'user-table',
    ) {}
    
    async getUserById(userId: string): Promise<User> {
        const params = {
            TableName: this.userTable,
            Key: {
                userId,
            },
        };
    
        const result = await this.dynamoDBClient.get(params).promise();
    
        return result.Item as User;
    }
    
    async createUser(user: User): Promise<User> {
        const params = {
            TableName: this.userTable,
            Item: user,
        };
    
        await this.dynamoDBClient.put(params).promise();
    
        return user;
    }

    async updateUser(user: User): Promise<User> {
        const params = {
            TableName: this.userTable,
            Item: user,
        };
    
        await this.dynamoDBClient.put(params).promise();
        const updatedUser = await this.getUserById(user.userId);
    
        return updatedUser;
    }

    async deleteUser(userId: string): Promise<void> {
        const params = {
            TableName: this.userTable,
            Key: {
                userId,
            },
        };
    
        await this.dynamoDBClient.delete(params).promise();
    }

    async getAllUsers(): Promise<User[]> {
        const params = {
            TableName: this.userTable,
        };
    
        const result = await this.dynamoDBClient.scan(params).promise();
    
        return result.Items as User[];
    }

    async getUserByEmailAndPassword(email: string, password: string): Promise<User | null> {
        const params = {
            TableName: this.userTable,
            FilterExpression: 'email = :email AND password = :password',
            ExpressionAttributeValues: {
                ':email': email,
                ':password': password,
            },
        };
    
        const result = await this.dynamoDBClient.scan(params).promise();

        if (!result.Items || result.Items.length === 0) {
            return null;
        }
    
        return result.Items[0] as User;
    }
}

export default UserTable;