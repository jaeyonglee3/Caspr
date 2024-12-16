import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import customRender from "@/test-utils/render";
import "@testing-library/jest-dom";
import NavBar from "../../src/components/GraphNavbar";
import { Graph } from "@/types/graph";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

// Mock the ShareButton component
jest.mock("../../src/components/buttons/ShareButton", () => (props: any) => (
	<div>
		ShareButton
		<button onClick={() => props.onMakePublic(true)}>Make Public</button>
	</div>
));

// Mock the next/router module
jest.mock("next/router", () => ({
	useRouter: jest.fn().mockReturnValue({
		back: jest.fn()
	})
}));

// Mock the firebase/auth module
jest.mock("firebase/auth", () => ({
	getAuth: jest.fn(),
	onAuthStateChanged: jest.fn((auth, callback) => {
		callback({ displayName: "Test User" });
		return jest.fn();
	})
}));

const mockGraph: Graph = {
	owner: "test-owner",
	id: "test-id",
	graphName: "Test Graph",
	graphDescription: "Test Description",
	graphVisibility: true,
	graphFileURL: "http://example.com/test.json",
	graphURL: "http://localhost:3000/graph/test-id",
	createdAt: Timestamp.fromDate(new Date()),
	sharedEmails: [],
	sharing: [],
	presets: []
};

const mockDiagrams = [
	{
		id: 0,
		data: {
			nodes: [{ id: "1", label: "Node 1", value: 1, category: "A" }],
			edges: [
				{ source: "1", target: "2", relationship: "related", strength: 1 }
			]
		},
		label: "Diagram 1"
	}
];

describe("NavBar", () => {
	test("renders NavBar component", () => {
		customRender(
			<NavBar
				diagrams={mockDiagrams}
				selectedTab={0}
				setSelectedTab={jest.fn()}
				addDiagram={jest.fn()}
				removeDiagram={jest.fn()}
				graph={mockGraph}
			/>
		);

		expect(screen.getByText("Diagram 1")).toBeInTheDocument();
		expect(screen.getByText("ShareButton")).toBeInTheDocument();
	});

	test("calls addDiagram when Add New Diagram button is clicked", () => {
		const addDiagram = jest.fn();
		customRender(
			<NavBar
				diagrams={mockDiagrams}
				selectedTab={0}
				setSelectedTab={jest.fn()}
				addDiagram={addDiagram}
				removeDiagram={jest.fn()}
				graph={mockGraph}
			/>
		);

		fireEvent.click(screen.getByLabelText("Add New Diagram"));
		expect(addDiagram).toHaveBeenCalled();
	});

	test("calls removeDiagram when Remove Diagram button is clicked", () => {
		const removeDiagram = jest.fn();
		customRender(
			<NavBar
				diagrams={mockDiagrams}
				selectedTab={0}
				setSelectedTab={jest.fn()}
				addDiagram={jest.fn()}
				removeDiagram={removeDiagram}
				graph={mockGraph}
			/>
		);

		fireEvent.click(screen.getByLabelText("Delete Diagram"));
		expect(removeDiagram).toHaveBeenCalledWith(0);
	});

	test("calls router.back when Go Back button is clicked", () => {
		const router = useRouter();
		customRender(
			<NavBar
				diagrams={mockDiagrams}
				selectedTab={0}
				setSelectedTab={jest.fn()}
				addDiagram={jest.fn()}
				removeDiagram={jest.fn()}
				graph={mockGraph}
			/>
		);

		fireEvent.click(screen.getByLabelText("Go Back"));
		expect(router.back).toHaveBeenCalled();
	});
});
