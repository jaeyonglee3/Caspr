import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import ForgotPassword from "@/pages/forgotPassword";
import React from "react";
import { useRouter } from "next/router";
import customRender from "@/test-utils/render";

const email = "test@123.com";

jest.mock("next/router", () => ({
	useRouter: jest.fn().mockReturnValue({ push: jest.fn() })
}));

jest.mock("@/api", () => ({
	loginWithEmail: jest.fn()
}));

jest.mock("@chakra-ui/react", () => ({
	...jest.requireActual("@chakra-ui/react"),
	toast: jest.fn()
}));

describe("Forgot Password (Landing Page)", () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	});

	test("renders Forgot Password component", () => {
		customRender(<ForgotPassword />);
		const headingElement = screen.getByText(/Forgot Password/i);
		expect(headingElement).toBeInTheDocument();
	});

	test("allows user to input email", () => {
		customRender(<ForgotPassword />);
		const emailInput = screen.getByPlaceholderText(/Enter your email/i);
		fireEvent.change(emailInput, { target: { value: email } });
		expect(emailInput).toHaveValue(email);
	});
});
