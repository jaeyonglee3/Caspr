import React from "react";
import { render, screen } from "@testing-library/react";
import Sidebar from "@/components/Sidebar";
import "@testing-library/jest-dom";
import customRender from "@/test-utils/render";
import { useRouter } from "next/router";
import { ChakraProvider } from "@chakra-ui/react";
import { ViewProvider } from "@/context/ViewContext";

// Mocking useRouter
jest.mock("next/router", () => ({
	useRouter: jest.fn()
}));

const mockUseAuth = jest.fn();
jest.mock("@/context", () => ({
    useAuth: () => mockUseAuth()
}));

const renderWithChakra = (ui: React.ReactElement) => {
	return render(
		<ChakraProvider>
			<ViewProvider>{ui}</ViewProvider>
		</ChakraProvider>
	);}
	
describe("Sidebar renders correctly", () => {
	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({
			pathname: "/home",
			push: jest.fn()
		});
	});

	test("renders Sidebar links correctly", () => {
		mockUseAuth.mockReturnValue({ firebaseUser: { name: "Test User" } });
		renderWithChakra(<Sidebar />);
		expect(screen.getByAltText("Logo")).toBeInTheDocument();
		expect(screen.getByAltText("Caspr")).toBeInTheDocument();
		const sidebarTexts = ["My Graphs", "Shared With Me", "Explore"];

		sidebarTexts.forEach((text) => {
			expect(screen.getByText(new RegExp(text, "i"))).toBeInTheDocument();
		});
	});
	test("renders Sidebar correctly for logout state", () => {
		mockUseAuth.mockReturnValue({ firebaseUser: null });
        jest.mock("@/context", () => ({
            useAuth: jest.fn(() => ({ firebaseUser: null }))
        }));

        renderWithChakra(<Sidebar />);
		expect(screen.getByText(/Explore/i)).toBeInTheDocument();
        expect(screen.getByText(/Login/i)).toBeInTheDocument();
    });
});
