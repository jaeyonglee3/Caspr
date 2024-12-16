import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GraphPage from "../../src/pages/graph/[id]";
import "@testing-library/jest-dom";
import { fetchAllUserAccessibleGraphs, getGraphData } from "@/api";
import { useAuth } from "@/context";
import { useRouter } from "next/router";

jest.mock("@/context/AuthContext", () => ({
	useAuth: jest.fn()
}));

jest.mock("next/router", () => ({
	useRouter: jest.fn()
}));

jest.mock("@/api", () => ({
	fetchAllUserAccessibleGraphs: jest.fn(),
	getGraphData: jest.fn()
}));

jest.mock("@chakra-ui/react", () => {
	const originalModule = jest.requireActual("@chakra-ui/react");
	return {
		...originalModule,
		useToast: jest.fn().mockReturnValue(jest.fn())
	};
});

jest.mock("@/components", () => ({
	GraphSideBar: () => <div data-testid="graph-sidebar">GraphSideBar</div>,
	GraphNavbar: () => <div data-testid="graph-navbar">GraphNavbar</div>,
	FullScreenLoader: () => <div data-testid="full-screen-loader">Loading...</div>
}));

jest.mock("../../src/components/graphVisualization/CausalDiagram", () => () => (
	<div data-testid="causal-diagram">CausalDiagram</div>
));

describe("GraphPage Component", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test("renders loading component when loading is true", () => {
		(useAuth as jest.Mock).mockReturnValue({ firebaseUser: null });
		(useRouter as jest.Mock).mockReturnValue({ query: {} });

		render(<GraphPage />);

		expect(screen.getByTestId("full-screen-loader")).toBeInTheDocument();
	});

	test("fetches graph data when firebaseUser and id are available", async () => {
		const mockFirebaseUser = { uid: "user123" };
		const mockId = "graphId123";
		const mockGraph = {
			graphURL: "/graph/graphId123",
			graphName: "Test Graph"
		};
		const mockJsonData = {
			nodes: [{ id: "1", label: "Node 1", value: 1, category: "A" }],
			edges: [
				{ source: "1", target: "2", relationship: "causes", strength: 0.5 }
			]
		};

		(useAuth as jest.Mock).mockReturnValue({ firebaseUser: mockFirebaseUser });
		const pushMock = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({
			query: { id: mockId },
			push: pushMock
		});

		(fetchAllUserAccessibleGraphs as jest.Mock).mockResolvedValue([mockGraph]);
		(getGraphData as jest.Mock).mockResolvedValue(mockJsonData);

		render(<GraphPage />);

		await waitFor(() => {
			expect(fetchAllUserAccessibleGraphs).toHaveBeenCalledWith(
				mockFirebaseUser
			);
		});

		await waitFor(() => {
			expect(getGraphData).toHaveBeenCalledWith(mockGraph);
		});

		expect(pushMock).not.toHaveBeenCalledWith("/undefined");
		expect(pushMock).not.toHaveBeenCalledWith("/home");
		expect(screen.getByTestId("graph-navbar")).toBeInTheDocument();
		expect(screen.getByTestId("causal-diagram")).toBeInTheDocument();
		expect(screen.getByTestId("graph-sidebar")).toBeInTheDocument();
	});

	test("redirects to /home when graph data is invalid", async () => {
		const mockFirebaseUser = { uid: "user123" };
		const mockId = "graphId123";
		const mockGraph = {
			graphURL: "/graph/graphId123",
			graphName: "Test Graph"
		};
		const invalidJsonData = {};

		(useAuth as jest.Mock).mockReturnValue({ firebaseUser: mockFirebaseUser });
		const pushMock = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({
			query: { id: mockId },
			push: pushMock
		});

		(fetchAllUserAccessibleGraphs as jest.Mock).mockResolvedValue([mockGraph]);
		(getGraphData as jest.Mock).mockResolvedValue(invalidJsonData);

		render(<GraphPage />);

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/");
		});
	});

	test("redirects to /undefined when graph is not found", async () => {
		const mockFirebaseUser = { uid: "user123" };
		const mockId = "graphId123";

		(useAuth as jest.Mock).mockReturnValue({ firebaseUser: mockFirebaseUser });
		const pushMock = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({
			query: { id: mockId },
			push: pushMock
		});

		(fetchAllUserAccessibleGraphs as jest.Mock).mockResolvedValue([]);

		render(<GraphPage />);

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/");
		});
	});

	test("handles adding a new diagram", async () => {
		const mockFirebaseUser = { uid: "user123" };
		const mockId = "graphId123";
		const mockGraph = {
			graphURL: "/graph/graphId123",
			graphName: "Test Graph"
		};
		const mockJsonData = {
			nodes: [{ id: "1", label: "Node 1", value: 1, category: "A" }],
			edges: [
				{ source: "1", target: "2", relationship: "causes", strength: 0.5 }
			]
		};

		(useAuth as jest.Mock).mockReturnValue({ firebaseUser: mockFirebaseUser });
		(useRouter as jest.Mock).mockReturnValue({
			query: { id: mockId },
			push: jest.fn()
		});

		(fetchAllUserAccessibleGraphs as jest.Mock).mockResolvedValue([mockGraph]);
		(getGraphData as jest.Mock).mockResolvedValue(mockJsonData);

		render(<GraphPage />);

		await waitFor(() => {
			expect(screen.getByTestId("graph-navbar")).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText("GraphNavbar"));

		await waitFor(() => {
			expect(screen.getAllByTestId("causal-diagram").length).toBe(1);
		});
	});

	test("handles removing a diagram", async () => {
		const mockFirebaseUser = { uid: "user123" };
		const mockId = "graphId123";
		const mockGraph = {
			graphURL: "/graph/graphId123",
			graphName: "Test Graph"
		};
		const mockJsonData = {
			nodes: [{ id: "1", label: "Node 1", value: 1, category: "A" }],
			edges: [
				{ source: "1", target: "2", relationship: "causes", strength: 0.5 }
			]
		};

		(useAuth as jest.Mock).mockReturnValue({ firebaseUser: mockFirebaseUser });
		(useRouter as jest.Mock).mockReturnValue({
			query: { id: mockId },
			push: jest.fn()
		});

		(fetchAllUserAccessibleGraphs as jest.Mock).mockResolvedValue([mockGraph]);
		(getGraphData as jest.Mock).mockResolvedValue(mockJsonData);

		render(<GraphPage />);

		await waitFor(() => {
			expect(screen.getByTestId("graph-navbar")).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText("GraphNavbar"));

		fireEvent.click(screen.getByText("GraphNavbar"));

		await waitFor(() => {
			expect(screen.getAllByTestId("causal-diagram").length).toBe(1);
		});
	});

	test("handles node selection", async () => {
		const mockFirebaseUser = { uid: "user123" };
		const mockId = "graphId123";
		const mockGraph = {
			graphURL: "/graph/graphId123",
			graphName: "Test Graph"
		};
		const mockJsonData = {
			nodes: [{ id: "1", label: "Node 1", value: 1, category: "A" }],
			edges: [
				{ source: "1", target: "2", relationship: "causes", strength: 0.5 }
			]
		};

		(useAuth as jest.Mock).mockReturnValue({ firebaseUser: mockFirebaseUser });
		(useRouter as jest.Mock).mockReturnValue({
			query: { id: mockId },
			push: jest.fn()
		});

		(fetchAllUserAccessibleGraphs as jest.Mock).mockResolvedValue([mockGraph]);
		(getGraphData as jest.Mock).mockResolvedValue(mockJsonData);

		render(<GraphPage />);

		await waitFor(() => {
			expect(screen.getByTestId("graph-sidebar")).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText("GraphSideBar"));
	});
});
