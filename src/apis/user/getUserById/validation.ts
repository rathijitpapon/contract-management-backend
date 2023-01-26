import * as uuid from 'uuid';

const validateGetUserById = (userData: {
    userId: string,
}) : {
    error: boolean,
    errors?: string[],
    userData?: { userId: string },
} => {
    const errors = [];
    let isError = false;

    if (!('userId' in userData) || typeof userData.userId !== 'string' || !uuid.validate(userData.userId)) {
        isError = true;
        errors.push('User Id is required, must be a string, and must be a valid uuid');
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
        },
    }
};

export default validateGetUserById;
