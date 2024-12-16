/**
 * @jest-environment node
 */
import { createMocks } from "node-mocks-http";
import addPresetHandler from "@/pages/api/data/presets/add";
import deletePresetHandler from "@/pages/api/data/presets/delete";
import getPresetsHandler from "@/pages/api/data/presets/getAll";
import getPresetHandler from "@/pages/api/data/presets/getPreset";
import { dbAdmin } from "@/config/firebaseAdmin";

jest.mock("@/config/firebaseAdmin");

describe("API /api/data/presets", () => {
	let graphDocMock: jest.Mock;
	let graphUpdateMock: jest.Mock;

	beforeEach(() => {
		graphDocMock = jest.fn();
		graphUpdateMock = jest.fn().mockResolvedValue(true);

		(dbAdmin.collection as jest.Mock).mockReturnValue({
			doc: jest.fn().mockReturnValue({
				get: graphDocMock,
				update: graphUpdateMock
			})
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /addPreset", () => {
		it("should return 405 for non-POST requests", async () => {
			const { req, res } = createMocks({ method: "GET" });
			await addPresetHandler(req, res);
			expect(res._getStatusCode()).toBe(405);
		});

		it("should return 400 if graphId or preset is missing", async () => {
			const { req, res } = createMocks({
				method: "POST",
				body: {}
			});
			await addPresetHandler(req, res);
			expect(res._getStatusCode()).toBe(400);
		});

		it("should add a preset successfully", async () => {
			graphDocMock.mockResolvedValue({
				exists: true,
				data: () => ({ presets: [] })
			});
			const { req, res } = createMocks({
				method: "POST",
				body: {
					graphId: "test-graph",
					preset: { name: "Test Preset", filters: [] }
				}
			});
			await addPresetHandler(req, res);
			expect(res._getStatusCode()).toBe(200);
			expect(graphUpdateMock).toHaveBeenCalled();
		});
	});

	describe("DELETE /deletePreset", () => {
		it("should return 405 for non-DELETE requests", async () => {
			const { req, res } = createMocks({ method: "POST" });
			await deletePresetHandler(req, res);
			expect(res._getStatusCode()).toBe(405);
		});

		it("should return 400 if graphId or presetName is missing", async () => {
			const { req, res } = createMocks({
				method: "DELETE",
				body: {}
			});
			await deletePresetHandler(req, res);
			expect(res._getStatusCode()).toBe(400);
		});

		it("should delete a preset successfully", async () => {
			graphDocMock.mockResolvedValue({
				exists: true,
				data: () => ({
					presets: [{ name: "Test Preset" }]
				})
			});
			const { req, res } = createMocks({
				method: "DELETE",
				body: {
					graphId: "test-graph",
					presetName: "Test Preset"
				}
			});
			await deletePresetHandler(req, res);
			expect(res._getStatusCode()).toBe(200);
			expect(graphUpdateMock).toHaveBeenCalled();
		});
	});

	describe("GET /getPresets", () => {
		it("should return 405 for non-GET requests", async () => {
			const { req, res } = createMocks({ method: "POST" });
			await getPresetsHandler(req, res);
			expect(res._getStatusCode()).toBe(405);
		});

		it("should return 400 if graphId is missing", async () => {
			const { req, res } = createMocks({
				method: "GET",
				query: {}
			});
			await getPresetsHandler(req, res);
			expect(res._getStatusCode()).toBe(400);
		});

		it("should fetch all presets successfully", async () => {
			graphDocMock.mockResolvedValue({
				exists: true,
				data: () => ({
					presets: [{ name: "Test Preset" }]
				})
			});
			const { req, res } = createMocks({
				method: "GET",
				query: { graphId: "test-graph" }
			});
			await getPresetsHandler(req, res);
			expect(res._getStatusCode()).toBe(200);
			expect(JSON.parse(res._getData())).toEqual({
				presets: [{ name: "Test Preset" }]
			});
		});
	});

	describe("GET /getPreset", () => {
		it("should return 405 for non-GET requests", async () => {
			const { req, res } = createMocks({ method: "POST" });
			await getPresetHandler(req, res);
			expect(res._getStatusCode()).toBe(405);
		});

		it("should return 400 if graphId or presetName is missing", async () => {
			const { req, res } = createMocks({
				method: "GET",
				query: {}
			});
			await getPresetHandler(req, res);
			expect(res._getStatusCode()).toBe(400);
		});

		it("should fetch a single preset successfully", async () => {
			graphDocMock.mockResolvedValue({
				exists: true,
				data: () => ({
					presets: [{ name: "Test Preset" }]
				})
			});
			const { req, res } = createMocks({
				method: "GET",
				query: { graphId: "test-graph", presetName: "Test Preset" }
			});
			await getPresetHandler(req, res);
			expect(res._getStatusCode()).toBe(200);
			expect(JSON.parse(res._getData())).toEqual({
				preset: { name: "Test Preset" }
			});
		});
	});
});
