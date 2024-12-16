/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/data/unshareGraph";
import { dbAdmin } from "@/config/firebaseAdmin";
import { createMocks } from "node-mocks-http";
import { Graph, SharedUser, User } from "@/types";
import { Timestamp } from "firebase/firestore";

jest.mock("@/config/firebaseAdmin");
jest.mock("firebase-admin", () => ({
    ...jest.requireActual("firebase-admin"),
    auth: jest.fn(() => ({
        verifyIdToken: jest.fn((token) => {
            if (token === "valid-token") {
                return Promise.resolve({
                    uid: "123",
                    email: "test@gmail.com",
                });
            }
            return Promise.reject(new Error("Invalid token"));
        }),
    })),
}));

const mockUser: User = {
    uid: "123",
    name: "Test User",
    email: "test@gmail.com",
    photoURL: "TestURL.com",
    createdAt: Timestamp.now(),
    roles: [],
};

const mockSharedUser: SharedUser = {
    email: "test@example.com",
    status: "accepted",
    role: 0,
    presetAccess: [],
    addedAt: Timestamp.now(),
    addedBy: "admin@example.com",
};

const mockGraph: Graph = {
    id: "test-graph-id",
    owner: mockUser.uid,
    graphName: "Test Graph",
    graphDescription: "Test Description",
    graphVisibility: true,
    graphFileURL: "http://example.com/graph.png",
    graphURL: "http://example.com/graph",
    createdAt: Timestamp.now(),
    sharing: [mockSharedUser],
    sharedEmails: ["test@example.com"],
    presets: [
        {
            name: "Preset 1",
            updated: Timestamp.now(),
            filters: ["filter1"],
            pathways: ["pathway1"],
            view: null,
        },
        {
            name: "Preset 2",
            updated: Timestamp.now(),
            filters: ["filter2"],
            pathways: ["pathway2"],
            view: null,
        },
    ],
    graphTags: [],
    graphFilePath: "",
};

describe("POST /api/data/unshareGraph", () => {
    let graphDocMock: jest.Mock;
    let graphUpdateMock: jest.Mock;

    beforeEach(() => {
        graphDocMock = jest.fn();
        graphUpdateMock = jest.fn().mockResolvedValue(true);

        (dbAdmin.collection as jest.Mock).mockReturnValue({
            doc: jest.fn().mockReturnValue({
                get: graphDocMock,
                update: graphUpdateMock,
            }),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return status code 405 if method isn't POST", async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: "GET",
        });

        await handler(req, res);

        expect(res._getStatusCode()).toEqual(405);
        expect(res._getData()).toEqual('{"message":"Method not allowed"}');
    });

    it("should return status code 400 if graphId or email is missing", async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: "POST",
            headers: { authorization: "Bearer valid-token" },
            body: {},
        });

        await handler(req, res);

        expect(res._getStatusCode()).toEqual(400);
        expect(res._getData()).toEqual(
            '{"error":"Graph ID and email are required"}'
        );
    });

    it("should return status code 404 for non-existent graph", async () => {
        graphDocMock.mockResolvedValue({ exists: false });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: "POST",
            headers: { authorization: "Bearer valid-token" },
            body: {
                graphId: "invalid-id",
                email: "test@example.com",
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toEqual(404);
        expect(res._getData()).toEqual('{"error":"Graph not found"}');
    });

    it("should unshare graph successfully", async () => {
        graphDocMock.mockResolvedValue({
            exists: true,
            data: () => ({
                ...mockGraph,
                sharing: [mockSharedUser],
                sharedEmails: ["test@example.com"],
            }),
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: "POST",
            headers: { authorization: "Bearer valid-token" },
            body: {
                graphId: "test-graph-id",
                email: "test@example.com",
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toEqual(200);
        expect(res._getData()).toEqual(
            '{"message":"Graph unshared successfully"}'
        );
        expect(graphUpdateMock).toHaveBeenCalled();
    });

    it("should return status code 404 if user not found in sharing list", async () => {
        graphDocMock.mockResolvedValue({
            exists: true,
            data: () => ({
                ...mockGraph,
                sharing: [],
                sharedEmails: [],
            }),
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: "POST",
            headers: { authorization: "Bearer valid-token" },
            body: {
                graphId: "test-graph-id",
                email: "nonexistent@example.com",
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toEqual(404);
        expect(res._getData()).toEqual(
            '{"error":"User not found in sharing list"}'
        );
    });

    it("should return status code 500 if there was an error unsharing the graph", async () => {
        graphUpdateMock.mockRejectedValue(new Error("Firestore error"));

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: "POST",
            headers: { authorization: "Bearer valid-token" },
            body: {
                graphId: "test-graph-id",
                email: "test@example.com",
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toEqual(500);
        expect(res._getData()).toEqual('{"error":"Error unsharing graph"}');
    });
});
