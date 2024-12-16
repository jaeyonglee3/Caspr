/**
 * @jest-environment node
 */
import handler from "@/pages/api/data/[uid]";
import { dbAdmin } from "@/config/firebaseAdmin";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/types";
import { firestore } from "firebase-admin";

jest.mock("@/config/firebaseAdmin");

describe("GET /api/users/[uid]", () => {
	const mockUser: User = {
		uid: "123",
		name: "Test User",
		email: "test@gmail.com",
		photoURL: "testurl.com",
		createdAt: firestore.Timestamp.now(),
		roles: []
	};

	let userDocMock: jest.Mock;

	beforeEach(() => {
		userDocMock = jest.fn();
		(dbAdmin.collection as jest.Mock).mockReturnValue({
			doc: jest.fn().mockReturnValue({
				get: userDocMock
			})
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("It should return status code: 405 if method isn't GET", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST"
		});

		await handler(req, res);

		const expectedStatusCode = 405;
		const expectedData = "Method not allowed";

		const actualStatusCode = res._getStatusCode();
		const actualData = res._getData();

		expect(actualStatusCode).toEqual(expectedStatusCode);
		expect(actualData).toEqual(expectedData);
	});

	it("It should return status code: 400 if uid isn't passed", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: {}
		});

		await handler(req, res);

		const expectedStatusCode = 400;
		const expectedData = '{"error":"UID wasn\'t passed, but is required"}';

		const actualStatusCode = res._getStatusCode();
		const actualData = res._getData();

		expect(actualStatusCode).toEqual(expectedStatusCode);
		expect(actualData).toEqual(expectedData);
	});

	it("It should return status code: 400 if uid is the wrong type (not string)", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: { uid: 123 }
		});

		await handler(req, res);

		const expectedStatusCode = 400;
		const expectedData = '{"error":"Invalid UID"}';

		const actualStatusCode = res._getStatusCode();
		const actualData = res._getData();

		expect(actualStatusCode).toEqual(expectedStatusCode);
		expect(actualData).toEqual(expectedData);
	});

	it("should return 200 and user data if user document is found", async () => {
		userDocMock.mockResolvedValue({
			exists: true,
			data: () => mockUser
		});

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: { uid: mockUser.uid }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(200);
		expect(JSON.parse(res._getData())).toEqual(mockUser);
	});
});
