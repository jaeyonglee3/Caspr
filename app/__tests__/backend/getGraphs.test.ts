/**
 * @jest-environment node
 */
import handler from "@/pages/api/data/getGraphs";
import { dbAdmin } from "@/config/firebaseAdmin";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { Graph } from "@/types";
import { Timestamp } from "firebase/firestore";

jest.mock("@/config/firebaseAdmin");

describe("GET /api/graphs/fetchGraphs", () => {
	const mockGraphData = [
		{
			owner: "1",
			graphName: "Test Graph 1",
			graphDescription: "Description 1",
			graphVisibility: true,
			graphFileURL: "http://example.com/graph1.png",
			graphURL: "http://example.com/graph1",
			createdAt: Timestamp.now(),
			sharing: true,
			sharedEmails: ["test1@example.com"],
			presets: []
		},
		{
			owner: "2",
			graphName: "Test Graph 2",
			graphDescription: "Description 2",
			graphVisibility: false,
			graphFileURL: "http://example.com/graph2.png",
			graphURL: "http://example.com/graph2",
			createdAt: Timestamp.now(),
			sharing: false,
			sharedEmails: ["test2@example.com"],
			presets: []
		}
	];

	let whereMock: jest.Mock;
	let getMock: jest.Mock;

	beforeEach(() => {
		whereMock = jest.fn(() => ({ get: getMock }));
		getMock = jest.fn();

		(dbAdmin.collection as jest.Mock).mockReturnValue({
			where: whereMock
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should return status code: 405 if the method is not GET", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST"
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(405);
		expect(JSON.parse(res._getData())).toEqual({
			message: "Method not allowed"
		});
	});

	it("should return status code: 400 if UID is missing or invalid", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET"
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(400);
		expect(JSON.parse(res._getData())).toEqual({ message: "Invalid UID" });
	});

	it("should fetch graphs and return status code: 200", async () => {
		getMock.mockResolvedValue({
			forEach: (callback: (doc: any) => void) => {
				mockGraphData.forEach((graph) => {
					callback({ owner: graph.owner, data: () => graph });
				});
			}
		});

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: { uid: "test-uid" }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toEqual(200);
		expect(JSON.parse(res._getData())).toEqual(mockGraphData);
	});

	it("should return status code: 500 if there is an error fetching graphs", async () => {
		getMock.mockRejectedValue(new Error("Firestore error"));

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET",
			query: { uid: "test-uid" }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toEqual(500);
		expect(JSON.parse(res._getData())).toEqual({
			message: "Error fetching graphs"
		});
	});
});
