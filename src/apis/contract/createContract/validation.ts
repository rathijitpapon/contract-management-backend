import * as uuid from 'uuid';
import Contract from '../contract.model';

const validateCreateContract = (contractData: {
    contractName: string,
    description: string,
    userId: string,
    templateId: string,
}) : {
    error: boolean,
    errors?: string[],
    contract?: Contract,
} => {
    const timestamp = new Date().toISOString();

    const errors = [];
    let isError = false;

    if (!('contractName' in contractData) || typeof contractData.contractName !== 'string') {
        errors.push('Contract Name is required and must be a string');
        isError = true;
    }

    if (!('description' in contractData) || typeof contractData.description !== 'string') {
        errors.push('Description is required and must be a string');
        isError = true;
    }

    if (!('userId' in contractData) || typeof contractData.userId !== 'string' || !uuid.validate(contractData.userId)) {
        errors.push('User ID is required and must be a valid UUID');
        isError = true;
    }

    if (!('templateId' in contractData) || typeof contractData.templateId !== 'string' || !uuid.validate(contractData.templateId)) {
        errors.push('Template ID is required and must be a valid UUID');
        isError = true;
    }

    if (isError) {
        return {
            error: true,
            errors,
        };
    }

    const contract = new Contract(
        uuid.v4(), 
        contractData.contractName,
        contractData.description,
        contractData.userId,
        contractData.templateId,
        timestamp, 
        timestamp,
    );

    return {
        error: false,
        contract,
    }
};

export default validateCreateContract;
