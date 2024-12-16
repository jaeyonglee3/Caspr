/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/auth/createAccountWithEmail";
import { authAdmin } from "@/config/firebaseAdmin";
import { createMocks } from "node-mocks-http";
import { User } from "@/types";

// Mock Firebase admin
jest.mock("@/config/firebaseAdmin");

describe("POST /api/auth/createUser", () => {
	const mockUserAuth = {
		uid: "mock-uid",
		email: "test@gmail.com",
		displayName: "Test User",
		photoURL: "http://photo.url"
	};

	beforeEach(() => {
		// Resets any existing mock state for authAdmin.createUser
		(authAdmin.createUser as jest.Mock).mockReset();
		// Defines what authAdmin.createUser should return when its called in each line
		(authAdmin.createUser as jest.Mock).mockResolvedValue(mockUserAuth);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("Should return status code: 405 if method is not POST", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET"
		});

		await handler(req, res);

		const expectedStatusCode = 405;
		const expectedData = "Method not allowed";

		const actualStatusCode = res._getStatusCode();
		const actualData = res._getData();

		expect(actualStatusCode).toEqual(expectedStatusCode);
		expect(actualData).toBe(expectedData);
	});

	it("It should return status code: 400 if required fields are missing", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST",
			body: {
				email: "test@gmail.com"
			}
		});

		await handler(req, res);

		const expectedStatusCode = 400;
		const expectedData =
			'{"error":"Email, password, or username wasn\'t passed and is required"}';

		const actualStatusCode = res._getStatusCode();
		const actualData = res._getData();

		expect(actualStatusCode).toEqual(expectedStatusCode);
		expect(actualData).toBe(expectedData);
	});

	it("It should create an auth user and return status code: 200", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST",
			body: {
				email: "test@gmail.com",
				password: "test123",
				username: "Test User"
			}
		});

		await handler(req, res);

		const expectedUserResponse: User = {
			uid: mockUserAuth.uid,
			name: mockUserAuth.displayName,
			email: mockUserAuth.email,
			photoURL: mockUserAuth.photoURL,
			createdAt: expect.any(Object), // Dynamically generated
			roles: []
		};

		const expectedStatusCode = 200;

		const actualData = JSON.parse(res._getData());
		const actualStatusCode = res._getStatusCode();

		expect(actualStatusCode).toEqual(expectedStatusCode);
		expect(actualData).toEqual(expectedUserResponse);
	});
});
