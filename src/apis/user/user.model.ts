class User {
    userId: string;
    name: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;

    constructor(userId: string, name: string, email: string, password: string, createdAt: string, updatedAt: string) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export default User;