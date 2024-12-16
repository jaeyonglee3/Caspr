import "@testing-library/jest-dom";

import { createAccountWithEmail } from "@/api";
import { fireEvent, render, screen } from "@testing-library/react";

import CreateAccount from "@/pages/createAccount";
import React from "react";
import { useRouter } from "next/router";
import customRender from "@/test-utils/render";

const email = "test@123.com";

jest.mock("next/router", () => ({
	useRouter: jest.fn().mockReturnValue({ push: jest.fn() })
}));

jest.mock("@/api", () => ({
	createAccountWithEmail: jest.fn()
}));

jest.mock("@chakra-ui/react", () => ({
	...jest.requireActual("@chakra-ui/react"),
	toast: jest.fn()
}));

describe("Create Account (Landing Page)", () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	});

	test("renders Create Account component", () => {
		customRender(<CreateAccount />);
		const headingElement = screen.getByText(/Welcome to Caspr/i);
		expect(headingElement).toBeInTheDocument();
	});

	test("renders Google sign-up button", () => {
		customRender(<CreateAccount />);
		const googleSignUpButton = screen.getByRole("button", {
			name: /Sign-up with Google/i
		});
		expect(googleSignUpButton).toBeInTheDocument();
	});

	test("allows user to input email", () => {
		customRender(<CreateAccount />);
		const emailInput = screen.getByPlaceholderText(/Enter email/i);
		fireEvent.change(emailInput, { target: { value: email } });
		expect(emailInput).toHaveValue(email);
	});

	test("allows user to input username", () => {
		customRender(<CreateAccount />);
		const usernameInput = screen.getByPlaceholderText(/Enter username/i);
		fireEvent.change(usernameInput, { target: { value: "username" } });
		expect(usernameInput).toHaveValue("username");
	});

	test("allows user to input password", () => {
		customRender(<CreateAccount />);
		const passwordInput = screen.getByLabelText(/Password/i);
		fireEvent.change(passwordInput, { target: { value: "password" } });
		expect(passwordInput).toHaveValue("password");
	});

	test("does not create account when passwords don't match", async () => {
		(createAccountWithEmail as jest.Mock).mockRejectedValueOnce(
			new Error("Passwords don't match")
		);
		customRender(<CreateAccount />);
		const emailInput = screen.getByPlaceholderText(/Enter email/i);
		const passwordInput = screen.getByLabelText(/Password/i);
		const signUpButton = screen.getByRole("button", {
			name: /Create Account/i
		});

		fireEvent.change(emailInput, { target: { value: "invalid_email" } });
		fireEvent.change(passwordInput, { target: { value: "wrong_password" } });
		fireEvent.click(signUpButton);
	});
});
