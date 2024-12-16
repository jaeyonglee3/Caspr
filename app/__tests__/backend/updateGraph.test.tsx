/**
 * @jest-environment node
 */
import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/data/updateGraph";
import { dbAdmin } from "@/config/firebaseAdmin";
import admin from "firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

jest.mock("firebase-admin", () => ({
	apps: [],
	initializeApp: jest.fn(),
	credential: {
		cert: jest.fn()
	},
	firestore: jest.fn(() => ({
		collection: jest.fn()
	})),
	auth: jest.fn(() => ({
		verifyIdToken: jest.fn()
	})),
	storage: jest.fn(() => ({
		bucket: jest.fn()
	}))
}));

describe("PATCH /api/data/updateGraph", () => {
	const mockID = "TestUpdateGraphID";

	const mockUpdateOneField = {
		graphVisibility: true
	};

	const mockUpdateMultiField = {
		graphVisibility: true,
		graphDescription: "Updated Description",
		graphName: "Updated Graph Name"
	};

	const mockUserUid = "mockUserUid";
	const mockToken = "mockToken";

	let graphDocMock: jest.Mock;
	let updateMock: jest.Mock;
	let verifyIdTokenMock: jest.Mock;

	beforeEach(() => {
		graphDocMock = jest.fn().mockResolvedValue({
			exists: true,
			data: jest.fn().mockReturnValue({
				owner: "test_uid",
				sharedEmails: ["test@example.com"]
			})
		});
		updateMock = jest.fn();
		verifyIdTokenMock = jest.fn().mockResolvedValue({ uid: mockUserUid });
		(admin.auth as jest.Mock).mockReturnValue({
			verifyIdToken: verifyIdTokenMock
		});

		(dbAdmin.collection as jest.Mock).mockReturnValue({
			doc: jest.fn().mockReturnValue({
				get: graphDocMock,
				update: updateMock
			})
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("Should return status code 405 if method is not PATCH", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET"
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(405);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Method not allowed"
		});
	});

	it("Should return status code 400 if graph ID is missing", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "PATCH",
			body: { updates: mockUpdateOneField }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(400);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Invalid or Missing Graph ID"
		});
	});
	it("Should return status code 401 if authorization header is missing", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "PATCH",
			body: { id: mockID, updates: mockUpdateOneField }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(401);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Missing or invalid Authorization header"
		});
	});

	it("Should return status code 404 if graph does not exist", async () => {
		graphDocMock.mockResolvedValue({ exists: false });

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "PATCH",
			body: { id: mockID, updates: mockUpdateOneField },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(404);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Graph not found"
		});
	});

	it("Should return status code 400 for updates containing restricted fields", async () => {
		verifyIdTokenMock.mockResolvedValue({
			uid: "test_uid",
			email: "test@example.com"
		});
		const restrictedUpdate = { createdAt: "2023-01-01T00:00:00Z" };

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "PATCH",
			body: { id: mockID, updates: restrictedUpdate },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(400);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Update contains restricted fields: createdAt"
		});
	});

	it("Should return status code 403 for unauthorized user", async () => {
		verifyIdTokenMock.mockResolvedValue({
			uid: "unauthorized_uid",
			email: "unauthorized@example.com"
		});

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "PATCH",
			body: { id: mockID, updates: mockUpdateOneField },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(403);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Unauthorized: Insufficient permissions"
		});
	});

	it("Should return status code 400 if update data is missing", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "PATCH",
			body: { id: mockID }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(400);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Invalid or Missing Update Data"
		});
	});

	it("Should update a single field and return a status code 200", async () => {
		verifyIdTokenMock.mockResolvedValue({
			uid: "test_uid",
			email: "test@example.com"
		});
		updateMock.mockResolvedValue(null);

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "PATCH",
			body: { id: mockID, updates: mockUpdateOneField },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(mockToken);
		expect(dbAdmin.collection).toHaveBeenCalledWith(
			process.env.NEXT_FIREBASE_GRAPH_COLLECTION || ""
		);
		expect(dbAdmin.collection().doc).toHaveBeenCalledWith(mockID);
		expect(updateMock).toHaveBeenCalledWith(mockUpdateOneField);
		expect(res._getStatusCode()).toBe(200);
		expect(JSON.parse(res._getData())).toEqual({
			updatedGraph: mockID
		});
	});

	it("Should update multiple fields and return a status code 200", async () => {
		verifyIdTokenMock.mockResolvedValue({
			uid: "test_uid",
			email: "test@example.com"
		});
		updateMock.mockResolvedValue(null);

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "PATCH",
			body: { id: mockID, updates: mockUpdateMultiField },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(mockToken);
		expect(dbAdmin.collection).toHaveBeenCalledWith(
			process.env.NEXT_FIREBASE_GRAPH_COLLECTION || ""
		);
		expect(dbAdmin.collection().doc).toHaveBeenCalledWith(mockID);
		expect(updateMock).toHaveBeenCalledWith(mockUpdateMultiField);
		expect(res._getStatusCode()).toBe(200);
		expect(JSON.parse(res._getData())).toEqual({
			updatedGraph: mockID
		});
	});

	it("should return status code: 500 if there is an error updating", async () => {
		verifyIdTokenMock.mockResolvedValue({
			uid: "test_uid",
			email: "test@example.com"
		});
		updateMock.mockRejectedValue(new Error("Firestore update error"));

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "PATCH",
			body: { id: mockID, updates: mockUpdateOneField },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(mockToken);
		expect(res._getStatusCode()).toBe(500);
		expect(JSON.parse(res._getData())).toEqual({
			message: "Error fetching graphs"
		});
	});
});
