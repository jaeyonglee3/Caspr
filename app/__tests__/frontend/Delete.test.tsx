import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import customRender from "@/test-utils/render";
import { Timestamp } from "firebase/firestore";
import { deleteGraph } from "@/api";
import { Graph } from "@/types";
import DeleteButton from "@/components/buttons/DeleteButton"

const mockGraph: Graph = {
	id: "1",
	owner: "Test",
	graphName: "Test Title",
	graphDescription: "Test Description",
	graphTags: ["GDP"],
	graphFileURL: "https://www.example.com",
	graphURL: "https://www.example.com/1234",
	graphFilePath: "/user/filepath.json",
	graphVisibility: false,
	createdAt: Timestamp.now(),
	sharing: [],
	sharedEmails: [],
	
};

const mockToast = jest.fn();
jest.mock("@chakra-ui/react", () => ({
	...jest.requireActual("@chakra-ui/react"),
	useToast: () => mockToast
}));

jest.mock("@/api", () => ({
    deleteGraph: jest.fn()
}));

describe("Delete Button Testing", () => {

    beforeEach(() => {
        (deleteGraph as jest.Mock).mockResolvedValueOnce({ message: "Graph Deleted Successfully" });
	});

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Delete Button Renders Properly" , () => {

		customRender(<DeleteButton graph={mockGraph} />);

        const deleteButton = screen.getByText("Delete");
		fireEvent.click(deleteButton);
        expect(screen.getByText("Confirm Graph Deletion")).toBeInTheDocument();

      })

    it("Verify Delete Button Called with proper Input", async () =>  {

        customRender(<DeleteButton graph={mockGraph} />);
    
        const deleteButton = screen.getByText("Delete");
		fireEvent.click(deleteButton);
        
        // Click the "Confirm" button
        const confirmButton = await screen.findByRole("button", { name: /Confirm/i });
        fireEvent.click(confirmButton);

        // Wait for deleteGraph to be called
        await waitFor(() => {
            expect(deleteGraph).toHaveBeenCalledTimes(1);
            expect(deleteGraph).toHaveBeenCalledWith(mockGraph);
        });

        // Verify the toast is shown
        expect(mockToast).toHaveBeenCalledWith(
            expect.objectContaining({
            title: "Graph Deleted",
            description: `Sucessfully Removed Graph: ${mockGraph.graphName}`,
            colorScheme: "green",
            duration: 2500,
            isClosable: true,
            })
        );
    })
})
