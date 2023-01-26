import * as uuid from 'uuid';
import Template from '../template.model';

const validateCreateTemplate = (templateData: {
    content: string,
}) : {
    error: boolean,
    errors?: string[],
    template?: Template,
} => {
    const timestamp = new Date().toISOString();

    const errors = [];
    let isError = false;

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

    const template = new Template(
        uuid.v4(), 
        templateData.content,
        timestamp, 
        timestamp,
    );

    return {
        error: false,
        template,
    }
};

export default validateCreateTemplate;
