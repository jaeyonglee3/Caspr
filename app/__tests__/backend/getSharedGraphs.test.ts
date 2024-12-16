/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/data/getSharedGraphs";
import { dbAdmin } from "@/config/firebaseAdmin";
import { createMocks } from "node-mocks-http";
import { Graph } from "@/types";
import { Timestamp } from "firebase/firestore";

jest.mock("@/config/firebaseAdmin");

const mockGraph: Graph = {
	id: "test-graph-id",
	owner: "owner-id",
	graphName: "Test Graph",
	graphDescription: "Test Description",
	graphVisibility: true,
	graphFileURL: "http://example.com/graph.png",
	graphURL: "http://example.com/graph",
	createdAt: Timestamp.now(),
	sharing: [],
	sharedEmails: ["test@example.com"],
	presets: [
		{
			name: "Preset 1",
			updated: Timestamp.now(),
			filters: ["filter1"],
			pathways: ["pathway1"],
			view: null
		},
		{
			name: "Preset 2",
			updated: Timestamp.now(),
			filters: ["filter2"],
			pathways: ["pathway2"],
			view: null
		}
	]
};

describe("GET /api/data/getSharedGraphs", () => {
	let collectionMock: jest.Mock;
	let whereMock: jest.Mock;
	let getMock: jest.Mock;

	beforeEach(() => {
		collectionMock = jest.fn();
		whereMock = jest.fn();
		getMock = jest.fn();

		(dbAdmin.collection as jest.Mock).mockReturnValue({
			where: whereMock.mockReturnValue({
				get: getMock
			})
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should return status code 405 if method isn't GET", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST"
		});

		await handler(req, res);

		expect(res._getStatusCode()).toEqual(405);
		expect(res._getData()).toEqual('{"message":"Method not allowed"}');
	});

	it("should return status code 400 if email is missing", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: {}
		});

		await handler(req, res);

		expect(res._getStatusCode()).toEqual(400);
		expect(res._getData()).toEqual('{"error":"Email is required"}');
	});

	it("should return shared graphs successfully", async () => {
		getMock.mockResolvedValue({
			docs: [
				{
					id: mockGraph.id,
					data: () => mockGraph
				}
			]
		});

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: {
				email: "test@example.com"
			}
		});

		await handler(req, res);

		expect(res._getStatusCode()).toEqual(200);
		expect(res._getData()).toEqual(JSON.stringify({ graphs: [mockGraph] }));
	});

	it("should return status code 500 if there was an error getting shared graphs", async () => {
		getMock.mockRejectedValue(new Error("Firestore error"));

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: {
				email: "test@example.com"
			}
		});

		await handler(req, res);

		expect(res._getStatusCode()).toEqual(500);
		expect(res._getData()).toEqual('{"error":"Error getting shared graphs"}');
	});
});
