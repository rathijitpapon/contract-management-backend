import * as uuid from 'uuid';

const validateGetContractById = (contractData: {
    contractId: string,
}) : {
    error: boolean,
    errors?: string[],
    contractData?: { contractId: string },
} => {
    const errors = [];
    let isError = false;

    if (!('contractId' in contractData) || typeof contractData.contractId !== 'string' || !uuid.validate(contractData.contractId)) {
        isError = true;
        errors.push('Contract Id is required, must be a string, and must be a valid uuid');
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
        },
    }
};

export default validateGetContractById;
