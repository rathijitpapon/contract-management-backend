class Template {
    templateId: string;
    content: string;
    createdAt: string;
    updatedAt: string;

    constructor(templateId: string, content: string, createdAt: string, updatedAt: string) {
        this.templateId = templateId;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export default Template;