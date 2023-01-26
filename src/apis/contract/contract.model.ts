class Contract {
    contractId: string;
    contractName: string;
    description: string;
    userId: string;
    templateId: string;
    createdAt: string;
    updatedAt: string;

    constructor(contractId: string, contractName: string, description: string, userId: string, templateId: string, createdAt: string, updatedAt: string) {
        this.contractId = contractId;
        this.contractName = contractName;
        this.description = description;
        this.userId = userId;
        this.templateId = templateId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export default Contract;