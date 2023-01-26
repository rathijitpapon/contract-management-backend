const validateLoginUser = (userData: {
    email: string,
    password: string,
}) : {
    error: boolean,
    errors?: string[],
    loginData?: { email: string, password: string },
} => {
    const errors = [];
    let isError = false;

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

    return {
        error: false,
        loginData: {
            email: userData.email,
            password: userData.password,
        },
    }
};

export default validateLoginUser;
