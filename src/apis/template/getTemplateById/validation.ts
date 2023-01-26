import * as uuid from 'uuid';

const validateGetTemplateById = (templateData: {
    templateId: string,
}) : {
    error: boolean,
    errors?: string[],
    templateData?: { templateId: string },
} => {
    const errors = [];
    let isError = false;

    if (!('templateId' in templateData) || typeof templateData.templateId !== 'string' || !uuid.validate(templateData.templateId)) {
        isError = true;
        errors.push('Template Id is required, must be a string, and must be a valid uuid');
    }

    if (isError) {
        return {
            error: true,
            errors,
        };
    }

    return {
        error: false,
        templateData: {
            templateId: templateData.templateId,
        },
    }
};

export default validateGetTemplateById;
