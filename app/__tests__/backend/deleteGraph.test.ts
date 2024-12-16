/**
 * @jest-environment node
 */
import handler from "@/pages/api/data/deleteGraph";
import { createMocks } from "node-mocks-http";
import { dbAdmin } from "@/config/firebaseAdmin";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

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

jest.mock("firebase-admin/storage", () => ({
	getStorage: jest.fn(() => ({
		bucket: jest.fn(() => ({
			file: jest.fn().mockReturnValue({
				delete: jest.fn().mockResolvedValue(null)
			})
		}))
	}))
}));

describe("DELETE /api/data/deleteGraph", () => {
	const mockID = "mockID";
	const mockFilePath = "mockID/graph.json";
	const mockUserUid = "mockUserUid";
	const mockToken = "mockToken";

	let deleteMock: jest.Mock;
	let docMock: jest.Mock;
	let verifyIdTokenMock: jest.Mock;
	let bucketMock: jest.Mock;

	beforeEach(() => {
		deleteMock = jest.fn();
		docMock = jest.fn().mockReturnValue({
			delete: deleteMock,
			get: jest.fn().mockResolvedValue({
				exists: true,
				data: jest.fn(() => ({
					owner: mockUserUid
				}))
			})
		});

		(dbAdmin.collection as jest.Mock).mockReturnValue({
			doc: docMock
		});

		bucketMock = jest.fn().mockReturnValue({
			file: jest.fn((filePath) => ({
				delete: jest.fn(() => {
					if (filePath === mockFilePath) return Promise.resolve();
					throw new Error("File does not exist");
				})
			}))
		});

		(getStorage as jest.Mock).mockReturnValue({
			bucket: bucketMock
		});

		verifyIdTokenMock = jest.fn().mockResolvedValue({ uid: mockUserUid });
		(admin.auth as jest.Mock).mockReturnValue({
			verifyIdToken: verifyIdTokenMock
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should return status code: 405 if the method is not DELETE", async () => {
		const { req, res } = createMocks({
			method: "POST"
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(405);
		expect(JSON.parse(res._getData())).toEqual({
			message: "Method not allowed"
		});
	});

	it("should return status code: 400 if graphID is invalid", async () => {
		const { req, res } = createMocks({
			method: "DELETE",
			body: { graphID: "", graphFilePath: mockFilePath }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(400);
		expect(JSON.parse(res._getData())).toEqual({
			message: "Invalid graph ID"
		});
	});

	it("should delete a graph and file successfully", async () => {
		const fileDeleteMock = jest.fn().mockResolvedValue(null);

		bucketMock.mockReturnValue({
			file: jest.fn(() => ({
				delete: fileDeleteMock
			}))
		});

		const { req, res } = createMocks({
			method: "DELETE",
			body: { graphID: mockID, graphFilePath: mockFilePath },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		// Verify storage calls
		expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(mockToken);
		expect(getStorage).toHaveBeenCalled();
		expect(bucketMock).toHaveBeenCalledWith(
			process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
		);
		expect(bucketMock().file).toHaveBeenCalledWith(mockFilePath);
		expect(fileDeleteMock).toHaveBeenCalled();

		// Graph Metadata gets deleted
		expect(dbAdmin.collection).toHaveBeenCalledWith(
			process.env.NEXT_FIREBASE_GRAPH_COLLECTION || ""
		);
		expect(docMock).toHaveBeenCalledWith(mockID);
		expect(deleteMock).toHaveBeenCalled();

		expect(res._getStatusCode()).toBe(200);
		expect(JSON.parse(res._getData())).toEqual({
			message: "Graph Deleted Successfully"
		});
	});

	it("should return status code: 500 if there is an error deleting graphs", async () => {
		deleteMock.mockRejectedValue(new Error("Firestore error"));

		const { req, res } = createMocks({
			method: "DELETE",
			body: { graphID: mockID, graphFilePath: mockFilePath },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(500);
		expect(JSON.parse(res._getData())).toEqual({
			message: "Error deleting graph"
		});
	});
	it("should return status code 403 if user does not own the graph", async () => {
		docMock.mockReturnValue({
			get: jest.fn().mockResolvedValue({
				exists: true,
				data: jest.fn().mockReturnValue({
					owner: "otherUserUID"
				})
			})
		});

		const { req, res } = createMocks({
			method: "DELETE",
			body: { graphID: mockID, graphFilePath: mockFilePath },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(403);
		expect(JSON.parse(res._getData())).toEqual({
			error: "No permission to delete this graph"
		});
	});
	it("should return status code 401 if authorization header is missing", async () => {
		const { req, res } = createMocks({
			method: "DELETE",
			body: { graphID: mockID, graphFilePath: mockFilePath }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(401);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Unauthorized"
		});
	});

	it("should return status code 400 if graphFilePath is invalid", async () => {
		const { req, res } = createMocks({
			method: "DELETE",
			body: { graphID: mockID, graphFilePath: "" },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(400);
		expect(JSON.parse(res._getData())).toEqual({
			message: "Invalid graph URL"
		});
	});
	it("should return status code 401 if token verification fails", async () => {
		verifyIdTokenMock.mockRejectedValue(new Error("Invalid token"));

		const { req, res } = createMocks({
			method: "DELETE",
			body: { graphID: mockID, graphFilePath: mockFilePath },
			headers: { authorization: `Bearer ${mockToken}` }
		});

		await handler(req, res);

		expect(verifyIdTokenMock).toHaveBeenCalledWith(mockToken);
		expect(res._getStatusCode()).toBe(401);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Invalid token"
		});
	});
});
