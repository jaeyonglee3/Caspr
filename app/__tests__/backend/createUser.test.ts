/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/data/createUser";
import { dbAdmin } from "@/config/firebaseAdmin";
import { createMocks } from "node-mocks-http";
import { User } from "@/types";
import { firestore } from "firebase-admin";

// Mock Firebase admin
jest.mock("@/config/firebaseAdmin");

describe("POST /api/data/createUser", () => {
	const mockUser: User = {
		uid: "123",
		name: "Test User",
		email: "test@gmail.com",
		photoURL: "TestURL.com",
		createdAt: firestore.Timestamp.now(),
		roles: []
	};

	let userDocMock: jest.Mock;

	beforeEach(() => {
		userDocMock = jest.fn();
		(dbAdmin.collection as jest.Mock).mockReturnValue({
			doc: jest.fn().mockReturnValue({ set: userDocMock })
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("It should return status code: 405 if method isn't POST", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET"
		});

		await handler(req, res);

		const expectedStatusCode = 405;
		const expectedData = "Method not allowed";

		const actualStatusCode = res._getStatusCode();
		const actualData = res._getData();

		expect(actualStatusCode).toEqual(expectedStatusCode);
		expect(actualData).toEqual(expectedData);
	});

	it("It should return status code: 500 if there was an error creating user in firestore.", async () => {
		userDocMock.mockRejectedValue(new Error("Firestore error"));

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST",
			body: { user: mockUser }
		});

		await handler(req, res);

		const expectedStatusCode = 500;
		const expectedData = '{"error": "Error creating user"}';

		const actualStatusCode = res._getStatusCode();
		const actualData = res._getData();

		expect(actualStatusCode).toEqual(expectedStatusCode);
		expect(actualData).toEqual(actualData);
	});

	it("It should create a user and return status code: 200", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST",
			body: { user: mockUser }
		});

		await handler(req, res);

		const expectedStatusCode = 200;
		const expectedData = '{"message":"Successfully created user"}';

		const actualStatusCode = res._getStatusCode();
		const actualData = res._getData();

		expect(expectedStatusCode).toEqual(actualStatusCode);
		expect(actualData).toEqual(expectedData);
	});
});
