/**
 * @jest-environment node
 */
import handler from "@/pages/api/data/createGraph"; // Update the import path as needed
import { dbAdmin } from "@/config/firebaseAdmin";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import { Graph } from "@/types";
import { Timestamp } from "firebase/firestore";

jest.mock("@/config/firebaseAdmin");

describe("POST /api/graphs/createGraph", () => {
	const mockGraph: Graph = {
		owner: "123",
		graphName: "Test Graph",
		graphDescription: "Test Description",
		graphFilePath: "",
		graphVisibility: true,
		graphFileURL: "http://example.com/graph.png",
		graphURL: "http://example.com/graph",
		createdAt: Timestamp.now(),
		sharing: [],
		sharedEmails: ["test@example.com"],
		presets: [],
		graphTags: []
	};

	let addMock: jest.Mock;

	beforeEach(() => {
		addMock = jest.fn();
		(dbAdmin.collection as jest.Mock).mockReturnValue({
			add: addMock
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should return status code:405 if method is not POST", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "GET"
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(405);
		expect(JSON.parse(res._getData())).toEqual({
			message: "Method not allowed"
		});
	});

	it("should return status code: 400 if owner or graphName is missing", async () => {
		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST",
			body: { graph: { ...mockGraph, owner: "" } } // Missing owner
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(400);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Owner or graph name wasn't passed, but is required"
		});
	});

	it("should create a graph and return status code: 200", async () => {
		addMock.mockResolvedValue({ id: "mock-graph-id" });

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST",
			body: { graph: mockGraph }
		});

		await handler(req, res);

		expect(addMock).toHaveBeenCalledWith({
			owner: mockGraph.owner,
			graphName: mockGraph.graphName,
			graphDescription: mockGraph.graphDescription,
			graphFilePath: mockGraph.graphFilePath,
			graphVisibility: mockGraph.graphVisibility,
			graphFileURL: mockGraph.graphFileURL,
			graphURL: mockGraph.graphURL,
			createdAt: mockGraph.createdAt,
			sharing: mockGraph.sharing,
			sharedEmails: mockGraph.sharedEmails,
			presets: mockGraph.presets,
			graphTags: mockGraph.graphTags
		});

		expect(res._getStatusCode()).toBe(200);
		expect(JSON.parse(res._getData())).toEqual({
			message: "Graph succesfully created"
		});
	});

	it("should return status code: 500 if there is an error creating the graph", async () => {
		addMock.mockRejectedValue(new Error("Firestore error"));

		const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
			method: "POST",
			body: { graph: mockGraph }
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(500);
		expect(JSON.parse(res._getData())).toEqual({
			error: "Error creating graph"
		});
	});
});
