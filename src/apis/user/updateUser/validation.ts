import * as uuid from 'uuid';

const validateUpdateUser = (userData: {
    userId: string,
    email?: string,
    password?: string,
    name?: string,
}) : {
    error: boolean,
    errors?: string[],
    userData?: { userId: string, email?: string, password?: string, name?: string },
} => {
    const errors = [];
    let isError = false;

    if (!('userId' in userData) || typeof userData.userId !== 'string' || !uuid.validate(userData.userId)) {
        isError = true;
        errors.push('userId is required, must be a string, and must be a valid uuid');
    }

    if ('email' in userData && typeof userData.email !== 'string') {
        errors.push('Email must be a string');
        isError = true;
    }

    if ('password' in userData && typeof userData.password !== 'string') {
        errors.push('Password must be a string');
        isError = true;
    }

    if ('name' in userData && typeof userData.name !== 'string') {
        errors.push('Name must be a string');
        isError = true;
    }

    if (isError) {
        return {
            error: true,
            errors,
        };
    }

    return {
        error: false,
        userData: {
            userId: userData.userId,
            email: userData.email || undefined,
            password: userData.password || undefined,
            name: userData.name || undefined,
        },
    }
};

export default validateUpdateUser;
