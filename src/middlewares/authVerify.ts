import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import jwt from 'jsonwebtoken';
import User from '../apis/user/user.model';
import UserTable from '../apis/user/user.table';

const jwtSecret = process.env.JWT_SECRET || 'defaultsecret';

const isAuthenticated = async (event: APIGatewayProxyEvent): Promise<{
    isError: boolean;
    errors?: string[];
    user?: User;
}> => {
    let isError = false;
    const errors = [];

    const authorizationToken = event.headers.authorizationToken || event.headers.Authorization || event.headers.authorization;
    if (!authorizationToken) {
        isError = true;
        errors.push('Authorization token not provided.');

        return {
            isError,
            errors,
        };
    }

    const jwtToken = authorizationToken.replace('Bearer ', '');
    const payload = jwt.verify(jwtToken, jwtSecret);

    if (!payload || !(payload instanceof Object) || !payload.id) {
        isError = true;
        errors.push('Unauthorized.');

        return {
            isError,
            errors,
        };
    }

    const userId = payload.id;
    const userTable = new UserTable();

    let user: User | null;
    try {
        user = await userTable.getUserById(userId);

        if (!user) {
            isError = true;
            errors.push('Unauthorized.');

            return {
                isError,
                errors,
            };
        }
    } catch (err: any) {
        isError = true;
        errors.push(`Unauthorized. ${err.message}`);

        return {
            isError,
            errors,
        };
    }

    if (!user) {
        isError = true;
        errors.push('Unauthorized.');

        return {
            isError,
            errors,
        };
    }

    delete user.password;
    return {
        isError,
        user,
    };
};

export default isAuthenticated;