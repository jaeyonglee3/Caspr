/**
 * @jest-environment node
 */
import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/data/getGraphData";
import { dbAdmin, storageAdmin, authAdmin } from "@/config/firebaseAdmin";

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
			file: jest.fn((filePath) => ({
				exists: jest.fn(() => {
					// Simulate existence check behavior based on filePath
					if (filePath === "path/to/nonexistent/file") return [false];
					if (filePath === "path/to/file") return [true];
					throw new Error("Unexpected file path");
				}),
				download: jest.fn(() => {
					// Simulate file download behavior
					if (filePath === "path/to/file")
						return [JSON.stringify({ nodes: [], edges: [] })];
					throw new Error("File does not exist");
				})
			}))
		}))
	}))
}));

describe("GET /api/data/getGraph", () => {
	let graphDocMock: jest.Mock;
	let fileExistsMock: jest.Mock;
	let fileDownloadMock: jest.Mock;
	let verifyIdTokenMock: jest.Mock;

	beforeEach(() => {
		graphDocMock = jest.fn();
		fileExistsMock = jest.fn();
		fileDownloadMock = jest.fn();
		verifyIdTokenMock = jest.fn();

		(dbAdmin.collection as jest.Mock).mockReturnValue({
			doc: jest.fn().mockReturnValue({
				get: graphDocMock
			})
		});

		(storageAdmin.bucket as jest.Mock).mockReturnValue({
			file: jest.fn().mockReturnValue({
				exists: fileExistsMock,
				download: fileDownloadMock
			})
		});

		(authAdmin.verifyIdToken as jest.Mock).mockImplementation(
			verifyIdTokenMock
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should return 405 for non-GET requests", async () => {
		const { req, res } = createMocks({
			method: "POST"
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(405);
		expect(res._getData()).toEqual('{"error":"Method not allowed"}');
	});

	it("should return 400 for missing or invalid graphId", async () => {
		const { req, res } = createMocks({
			method: "GET",
			query: {}
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(400);
		expect(res._getData()).toEqual('{"error":"Missing or invalid graph ID"}');
	});

	it("should return 404 for non-existent graph", async () => {
		graphDocMock.mockResolvedValue({ exists: false });

		const { req, res } = createMocks({
			method: "GET",
			query: { id: "invalid-id" }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(404);
		expect(res._getData()).toEqual('{"error":"Graph not found"}');
	});

	it("should return 403 for unauthorized access", async () => {
		graphDocMock.mockResolvedValue({
			exists: true,
			data: () => ({
				graphVisibility: false,
				owner: "another-user",
				sharedEmails: []
			})
		});

		verifyIdTokenMock.mockResolvedValue({ uid: "user-123" });

		const { req, res } = createMocks({
			method: "GET",
			query: { id: "test-id" },
			headers: {
				authorization: "Bearer invalid-token"
			}
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(403);
		expect(res._getData()).toEqual(
			'{"error":"Unauthorized: Insufficient permissions to read this graph"}'
		);
	});

	it("should return 404 for non-existent graph file", async () => {
		graphDocMock.mockResolvedValue({
			exists: true,
			data: () => ({
				graphVisibility: true,
				graphFilePath: "path/to/nonexistent/file"
			})
		});
		fileExistsMock.mockResolvedValue([false]);

		const { req, res } = createMocks({
			method: "GET",
			query: { id: "test-id" }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(404);
		expect(res._getData()).toEqual('{"error":"Graph file not found in storage"}');
	});

	it("should return 200 with graph JSON on success", async () => {
		const mockGraphJSON = { nodes: [], edges: [] };
		graphDocMock.mockResolvedValue({
			exists: true,
			data: () => ({
				graphVisibility: true,
				graphFilePath: "path/to/file"
			})
		});
		fileExistsMock.mockResolvedValue([true]);
		fileDownloadMock.mockResolvedValue([JSON.stringify(mockGraphJSON)]);

		const { req, res } = createMocks({
			method: "GET",
			query: { id: "test-id" }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(200);
		expect(res._getData()).toEqual(JSON.stringify(mockGraphJSON));
	});

	it("should return 500 on internal error", async () => {
		graphDocMock.mockRejectedValue(new Error("Firestore error"));

		const { req, res } = createMocks({
			method: "GET",
			query: { id: "test-id" }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(500);
		expect(res._getData()).toEqual('{"error":"Error fetching graph data"}');
	});
});
