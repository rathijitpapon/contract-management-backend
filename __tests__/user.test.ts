import { APIGatewayProxyEvent } from 'aws-lambda';
import * as uuid from 'uuid';
import { registerUser } from '../src/apis/user/registerUser/controller';
import { loginUser } from "../src/apis/user/loginUser/controller";
import { getUserById } from '../src/apis/user/getUserById/controller';
import { updateUser } from '../src/apis/user/updateUser/controller';
import { getUsers } from '../src/apis/user/getUsers/controller';

const user1 = {
	name: 'User 1',
	email: 'user1@gmail.com',
	password: 'password1',
};

const user2 = {
	name: 'User 5',
	email: 'user5@gmail.com',
	password: 'password2',
};

const registerUserForTesting = async () => {
	// Register User
	user1.email = `user${uuid.v4()}@gmail.com`;
	const requestEvent: APIGatewayProxyEvent = {
		body: JSON.stringify(user1),
	} as APIGatewayProxyEvent;

	const res = await registerUser(requestEvent);
	return res;
};

describe('User Module Test', () => {

	// Register User
	test('should register a user', async () => {
		// Register User
		const res = await registerUserForTesting();
		const body = JSON.parse(res.body);
		const userData = body.user;
		const authToken = body.authToken;

		expect(res.statusCode).toEqual(201);
		expect(userData).toHaveProperty('userId');
		expect(userData).toHaveProperty('name', user1.name);
		expect(userData).toHaveProperty('email', user1.email);
		expect(userData).toHaveProperty('createdAt');
		expect(userData).toHaveProperty('updatedAt');
		expect(userData).not.toHaveProperty('password');
		expect(authToken).not.toBeNull();
	});

	// Login User
	it('should login a user', async () => {
		// Register User
		const registerRes = await registerUserForTesting();
		const registerBody = JSON.parse(registerRes.body);
		const registerUserData = registerBody.user;

		// Login User
		const requestEvent: APIGatewayProxyEvent = {
			body: JSON.stringify({
				email: user1.email,
				password: user1.password,
			}),
		} as APIGatewayProxyEvent;

		const res = await loginUser(requestEvent);
		const body = JSON.parse(res.body);
		const userData = body.user;
		const authToken = body.authToken;

		expect(res.statusCode).toEqual(200);
		expect(userData).toHaveProperty('userId', registerUserData.userId);
		expect(userData).toHaveProperty('name', user1.name);
		expect(userData).toHaveProperty('email', user1.email);
		expect(userData).toHaveProperty('createdAt');
		expect(userData).toHaveProperty('updatedAt');
		expect(userData).not.toHaveProperty('password');
		expect(authToken).not.toBeNull();
	});

	// Get User By Id
	it('should get a user by id', async () => {
		// Register User
		const registerRes = await registerUserForTesting();
		const registerBody = JSON.parse(registerRes.body);
		const registerUserData = registerBody.user;
		const authToken = registerBody.authToken;

		// Get User By Id
		const getUserRequestEvent: APIGatewayProxyEvent = {
			queryStringParameters: {
				userId: registerUserData.userId,
			},
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		} as unknown as APIGatewayProxyEvent;

		const getUserRes = await getUserById(getUserRequestEvent);
		const getUserData = JSON.parse(getUserRes.body);
		
		expect(getUserRes.statusCode).toEqual(200);
		expect(getUserData).toHaveProperty('userId', registerUserData.userId);
		expect(getUserData).toHaveProperty('name', user1.name);
		expect(getUserData).toHaveProperty('email', user1.email);
		expect(getUserData).toHaveProperty('createdAt');
		expect(getUserData).toHaveProperty('updatedAt');
		expect(getUserData).not.toHaveProperty('password');
	});

	// Get Users
	it('should get all users', async () => {
		// Register User
		const registerRes = await registerUserForTesting();
		const registerBody = JSON.parse(registerRes.body);
		const authToken = registerBody.authToken;

		// Get All Users
		const getUsersRequestEvent: APIGatewayProxyEvent = {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		} as unknown as APIGatewayProxyEvent;

		const getUsersRes = await getUsers(getUsersRequestEvent);
		const getUsersData = JSON.parse(getUsersRes.body);
		
		expect(getUsersRes.statusCode).toEqual(200);
		expect(getUsersData).toBeInstanceOf(Array);
	});

	// Update User
	it('should update a user', async () => {
		// Register User
		const registerRes = await registerUserForTesting();
		const registerBody = JSON.parse(registerRes.body);
		const registerUserData = registerBody.user;
		const authToken = registerBody.authToken;

		// Update User
		user2.email = `user${uuid.v4()}@gmail.com`;
		const updateUserRequestEvent: APIGatewayProxyEvent = {
			body: JSON.stringify({
				name: user2.name,
				email: user2.email,
				password: user2.password,
			}),
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		} as unknown as APIGatewayProxyEvent;

		const updateUserRes = await updateUser(updateUserRequestEvent);
		const updateUserData = JSON.parse(updateUserRes.body);
		
		expect(updateUserRes.statusCode).toEqual(200);
		expect(updateUserData).toHaveProperty('userId', registerUserData.userId);
		expect(updateUserData).toHaveProperty('name', user2.name);
		expect(updateUserData).toHaveProperty('email', user2.email);
		expect(updateUserData).toHaveProperty('createdAt');
		expect(updateUserData).toHaveProperty('updatedAt');
		expect(updateUserData).not.toHaveProperty('password');
	});
});