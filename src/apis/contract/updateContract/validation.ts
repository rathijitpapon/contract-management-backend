import * as uuid from 'uuid';

const validateUpdateContract = (contractData: {
    contractName: string,
    description: string,
    userId: string,
    templateId: string,
    contractId: string,
}) : {
    error: boolean,
    errors?: string[],
    contractData?: { contractId: string, contractName: string, description: string, userId: string, templateId: string },
} => {
    const errors = [];
    let isError = false;

    if (!('contractId' in contractData) || typeof contractData.contractId !== 'string' || !uuid.validate(contractData.contractId)) {
        isError = true;
        errors.push('contractId is required, must be a string, and must be a valid uuid');
    }

    if (!('contractName' in contractData) || typeof contractData.contractName !== 'string') {
        errors.push('Contract Name is required and must be a string');
        isError = true;
    }

    if (!('description' in contractData) || typeof contractData.description !== 'string') {
        errors.push('Description is required and must be a string');
        isError = true;
    }

    if (!('userId' in contractData) || typeof contractData.userId !== 'string' || !uuid.validate(contractData.userId)) {
        errors.push('User ID is required and must be a string and must be a valid uuid');
        isError = true;
    }

    if (!('templateId' in contractData) || typeof contractData.templateId !== 'string' || !uuid.validate(contractData.templateId)) {
        errors.push('Template ID is required and must be a string and must be a valid uuid');
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
        contractData: {
            contractId: contractData.contractId,
            contractName: contractData.contractName,
            description: contractData.description,
            userId: contractData.userId,
            templateId: contractData.templateId,
        },
    }
};

export default validateUpdateContract;
