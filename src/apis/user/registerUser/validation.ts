import * as uuid from 'uuid';
import User from '../user.model';

const validateRegisterUser = (userData: {
    name: string,
    email: string,
    password: string,
}) : {
    error: boolean,
    errors?: string[],
    user?: User,
} => {
    const timestamp = new Date().toISOString();

    const errors = [];
    let isError = false;

    if (!('name' in userData) || typeof userData.name !== 'string') {
        errors.push('Name is required and must be a string');
        isError = true;
    }

    if (!('email' in userData) || typeof userData.email !== 'string') {
        errors.push('Email is required and must be a string');
        isError = true;
    }

    if (!('password' in userData) || typeof userData.password !== 'string') {
        errors.push('Password is required and must be a string');
        isError = true;
    }

    if (isError) {
        return {
            error: true,
            errors,
        };
    }

    const user = new User(
        uuid.v4(), 
        userData.name, 
        userData.email, 
        userData.password, 
        timestamp, 
        timestamp,
    );

    return {
        error: false,
        user,
    }
};

export default validateRegisterUser;
