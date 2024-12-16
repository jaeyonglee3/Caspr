/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/data/getPublicGraphs";
import { dbAdmin } from "@/config/firebaseAdmin";
import { createMocks } from "node-mocks-http";

jest.mock("@/config/firebaseAdmin");

const mockGraphs = [
	{
		id: "graph-1",
		graphName: "Public Graph 1",
		owner: "other-user-1",
		graphVisibility: true
	},
	{
		id: "graph-2",
		graphName: "Public Graph 2",
		owner: "other-user-2",
		graphVisibility: true
	}
];

describe("POST /api/data/fetchPublicGraphs", () => {
	let queryMock: jest.Mock;
	let getMock: jest.Mock;

	beforeEach(() => {
		queryMock = jest.fn();
		getMock = jest.fn();

		(dbAdmin.collection as jest.Mock).mockReturnValue({
			where: queryMock.mockReturnThis(),
			get: getMock
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should return 405 for non-POST requests", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET"
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(405);
		expect(res._getData()).toEqual('{"message":"Method not allowed"}');
	});

	it("should fetch all public graphs for unauthenticated user", async () => {
		getMock.mockResolvedValue({
			docs: mockGraphs.map((graph) => ({
				id: graph.id,
				data: () => graph
			}))
		});

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST",
			body: {}
		});

		await handler(req, res);

		expect(queryMock).toHaveBeenCalledWith("graphVisibility", "==", true);
		expect(res._getStatusCode()).toBe(200);
		expect(JSON.parse(res._getData())).toEqual(mockGraphs);
	});

	it("should fetch all public graphs not owned by a specific user", async () => {
		getMock.mockResolvedValue({
			docs: mockGraphs.map((graph) => ({
				id: graph.id,
				data: () => graph
			}))
		});

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST",
			body: { id: "current-user-id" }
		});

		await handler(req, res);

		expect(queryMock).toHaveBeenCalledWith("owner", "!=", "current-user-id");
		expect(queryMock).toHaveBeenCalledWith("graphVisibility", "==", true);
		expect(res._getStatusCode()).toBe(200);
		expect(JSON.parse(res._getData())).toEqual(mockGraphs);
	});

	it("should return 500 if an error occurs", async () => {
		getMock.mockRejectedValue(new Error("Firestore error"));

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST",
			body: { id: "current-user-id" }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(500);
		expect(res._getData()).toEqual('{"message":"Error fetching graphs"}');
	});
});
