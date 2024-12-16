/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, fireEvent, waitFor, within } from "@testing-library/react";
import GraphSideBar from "@/components/GraphSideBar";
import customRender from "@/test-utils/render";
import { addPreset, deletePreset } from "@/api";
import { useView } from "@/context/ViewContext";
import { AuthContext } from "@/context";
import { Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";

jest.mock("@/api", () => ({
	addPreset: jest.fn(),
	deletePreset: jest.fn()
}));

jest.mock("@/context/ViewContext", () => ({
	useView: jest.fn()
}));

const mockGraph = {
	id: "test-graph-id",
	owner: "123",
	graphName: "Test Graph",
	presets: [
		{ name: "Preset 1", updated: Timestamp.now(), view: { x: 1, y: 1, z: 1 } },
		{ name: "Preset 2", updated: Timestamp.now(), view: { x: 2, y: 2, z: 2 } }
	],
	sharedEmails: ["test@example.com"]
};

const mockViewContext = {
	graph: mockGraph,
	currentView: { x: 3, y: 3, z: 3 },
	activePreset: null,
	loadPreset: jest.fn(),
	addPresetToGraph: jest.fn(),
	deletePresetFromGraph: jest.fn()
};

const mockToast = jest.fn();
jest.mock("@chakra-ui/react", () => ({
	...jest.requireActual("@chakra-ui/react"),
	useToast: () => mockToast
}));

const mockUser: Partial<User> = {
	uid: "123",
	email: "test@gmail.com"
};

const renderComponent = () => {
	return customRender(
		<AuthContext.Provider
			value={{
				firebaseUser: mockUser as User,
				firestoreUser: mockUser,
				loading: false
			}}
		>
			<GraphSideBar nodes={[]} edges={[]} onNodeSelect={jest.fn()} />
		</AuthContext.Provider>
	);
};

describe("Presets", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useView as jest.Mock).mockReturnValue(mockViewContext);
	});

	test("displays presets in the sidebar", () => {
		renderComponent();
		fireEvent.click(screen.getByText("Presets"));

		const presetList = screen.getByRole("list");
		expect(within(presetList).getByText("Preset 1")).toBeInTheDocument();
		expect(within(presetList).getByText("Preset 2")).toBeInTheDocument();
	});

	test("loads a preset when clicked", async () => {
		renderComponent();
		fireEvent.click(screen.getByText("Presets"));

		fireEvent.click(screen.getByText("Preset 1"));

		await waitFor(() => {
			expect(mockViewContext.loadPreset).toHaveBeenCalledWith(
				mockGraph.presets[0]
			);
		});

		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Preset Loaded",
				description: "Loaded preset: Preset 1",
				status: "info"
			})
		);
	});

	test("saves a new preset", async () => {
		(addPreset as jest.Mock).mockResolvedValueOnce(true);

		renderComponent();
		fireEvent.click(screen.getByText("Presets"));
		fireEvent.click(screen.getByText("Save Current View"));

		const modal = screen.getByRole("dialog");
		const input = within(modal).getByPlaceholderText(
			"Enter a descriptive name for this view"
		);
		fireEvent.change(input, { target: { value: "New Preset" } });

		fireEvent.click(within(modal).getByText("Save Preset"));

		await waitFor(() => {
			expect(addPreset).toHaveBeenCalledWith(mockGraph.id, {
				name: "New Preset",
				updated: expect.anything(),
				filters: [],
				pathways: null,
				view: mockViewContext.currentView
			});
		});

		expect(mockViewContext.addPresetToGraph).toHaveBeenCalled();
		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Success",
				description: "Preset saved successfully",
				status: "success"
			})
		);
	});

	test("deletes a preset", async () => {
		(deletePreset as jest.Mock).mockResolvedValueOnce(true);

		renderComponent();
		fireEvent.click(screen.getByText("Presets"));

		const deleteButton = screen
			.getByText("Preset 1")
			.parentElement!.querySelector("button")!;
		fireEvent.click(deleteButton);

		await waitFor(() => {
			expect(deletePreset).toHaveBeenCalledWith(mockGraph.id, "Preset 1");
		});

		expect(mockViewContext.deletePresetFromGraph).toHaveBeenCalled();
		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Preset deleted",
				status: "success"
			})
		);
	});

	test("shows error toast when saving preset fails", async () => {
		(addPreset as jest.Mock).mockRejectedValueOnce(new Error("Failed to save"));

		renderComponent();
		fireEvent.click(screen.getByText("Presets"));
		fireEvent.click(screen.getByText("Save Current View"));

		const modal = screen.getByRole("dialog");
		const input = within(modal).getByPlaceholderText(
			"Enter a descriptive name for this view"
		);
		fireEvent.change(input, { target: { value: "Invalid Preset" } });

		fireEvent.click(within(modal).getByText("Save Preset"));

		await waitFor(() => {
			expect(addPreset).toHaveBeenCalled();
		});

		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Error",
				description: "Failed to save preset",
				status: "error"
			})
		);
	});

	test("shows error toast when deleting preset fails", async () => {
		(deletePreset as jest.Mock).mockRejectedValueOnce(
			new Error("Failed to delete")
		);

		renderComponent();
		fireEvent.click(screen.getByText("Presets"));

		const deleteButton = screen
			.getByText("Preset 1")
			.parentElement!.querySelector("button")!;
		fireEvent.click(deleteButton);

		await waitFor(() => {
			expect(deletePreset).toHaveBeenCalledWith(mockGraph.id, "Preset 1");
		});

		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Failed to delete preset",
				status: "error"
			})
		);
	});
});
