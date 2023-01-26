import * as uuid from 'uuid';

const validateUpdateTemplate = (templateData: {
    templateId: string,
    content: string,
}) : {
    error: boolean,
    errors?: string[],
    templateData?: { templateId: string, content: string },
} => {
    const errors = [];
    let isError = false;

    if (!('templateId' in templateData) || typeof templateData.templateId !== 'string' || !uuid.validate(templateData.templateId)) {
        isError = true;
        errors.push('templateId is required, must be a string, and must be a valid uuid');
    }

    if (!('content' in templateData) || typeof templateData.content !== 'string') {
        errors.push('Content is required and must be a string');
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
        templateData: {
            templateId: templateData.templateId,
            content: templateData.content,
        },
    }
};

export default validateUpdateTemplate;
