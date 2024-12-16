import "@testing-library/jest-dom";

import { fireEvent, screen, waitFor, act } from "@testing-library/react";

import React from "react";
import UploadFile from "@/pages/uploadFile";
import customRender from "@/test-utils/render";
import { uploadGraph } from "@/api/storage";
import { useRouter } from "next/router";
import { parseGraphData } from "../../src/utils/extractGraphData";
import { validateJSON } from "../../src/utils/validateJSON";

jest.mock("@/api/storage");
const mockRouterPush = jest.fn();
jest.mock("next/router", () => ({
	useRouter: jest.fn(() => ({
		push: mockRouterPush
	}))
}));
const mockToast = jest.fn();
jest.mock("@chakra-ui/react", () => ({
	...jest.requireActual("@chakra-ui/react"),
	useToast: () => mockToast
}));

jest.mock("../../src/utils/validateJSON", () => ({
	validateJSON: jest.fn()
}));

jest.mock("../../src/utils/extractGraphData", () => ({
	parseGraphData: jest.fn()
}));

const mockFileData = {
	nodes: [
		{
			id: "1",
			label: "GDP",
			value: 2.5,
			category: "economic"
		}
	],
	edges: []
};

const mockFile = new File([JSON.stringify(mockFileData)], "test.json", {
	type: "application/json"
});

describe("Select File", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFile.text = jest
			.fn()
			.mockResolvedValueOnce(JSON.stringify(mockFileData));
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	it("renders the upload file page", () => {
		customRender(<UploadFile />);
		expect(screen.getByText(/File Upload/i)).toBeInTheDocument();
		expect(
			screen.getByText(/Browse your computer or drag and drop here/i)
		).toBeInTheDocument();
	});

	it("Upload File Test", async () => {
		customRender(<UploadFile />);
		(validateJSON as jest.Mock).mockReturnValueOnce({
			isValid: true,
			errorMessage: null
		});
		const fileInput = screen.getByLabelText(
			/Browse your computer or drag and drop here/i
		);
		fireEvent.change(fileInput, { target: { files: [mockFile] } });

		await waitFor(() => {
			expect(validateJSON).toHaveBeenCalledWith(JSON.stringify(mockFileData));
			expect(mockToast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: "File Uploaded",
					description: "Graph data is valid.",
					status: "success"
				})
			);
		});
		const nextButton = screen.getByRole("button", { name: /next/i });
		expect(nextButton).toBeInTheDocument();
	});

	it("Upload File Test Fail", async () => {
		customRender(<UploadFile />);
		(validateJSON as jest.Mock).mockReturnValueOnce({
			isValid: false,
			errorMessage:
				"Invalid graph format, for timestamp format use keys:'timestamps' and 'time_unit', for non-timestamp format use 'nodes' and 'edges'"
		});
		const fileInput = screen.getByLabelText(
			/Browse your computer or drag and drop here/i
		);
		fireEvent.change(fileInput, { target: { files: [mockFile] } });

		await waitFor(() => {
			expect(validateJSON).toHaveBeenCalled();
			expect.objectContaining({
				title: "Invalid graph data",
				description:
					"Invalid graph format, for timestamp format use keys:'timestamps' and 'time_unit', for non-timestamp format use 'nodes' and 'edges'",
				status: "error",
				duration: 5000,
				isClosable: true
			});
		});
	});
});

describe("Configure Details", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFile.text = jest
			.fn()
			.mockResolvedValueOnce(JSON.stringify(mockFileData));
	});

	const setupUpload = async () => {
		const fileInput = screen.getByLabelText(
			/Browse your computer or drag and drop here/i
		);
		fireEvent.change(fileInput, { target: { files: [mockFile] } });
		await waitFor(() => {});

		const nextButton = screen.getByRole("button", { name: /next/i });
		fireEvent.click(nextButton);
	};

	it("renders add details stepper", async () => {
		(validateJSON as jest.Mock).mockReturnValueOnce({
			isValid: true,
			errorMessage: null
		});
		customRender(<UploadFile />);
		await setupUpload();

		expect(screen.getByText(/Add Details/i)).toBeInTheDocument();
		const graphNameInput = screen.getByPlaceholderText(
			/Enter a name for your graph/i
		);
		const graphDescriptionInput = screen.getByPlaceholderText(
			/Enter a description for your graph/i
		);
		expect(graphDescriptionInput).toBeInTheDocument();
		expect(graphNameInput).toBeInTheDocument();
	});

	it("shows a toast when inputs are empty", async () => {
		(validateJSON as jest.Mock).mockReturnValueOnce({
			isValid: true,
			errorMessage: null
		});

		customRender(<UploadFile />);
		await setupUpload();

		// Verify we're on the "Add Details" step
		expect(screen.getByText(/Add Details/i)).toBeInTheDocument();

		// Attempt to go to the next step with empty inputs
		const nextButton = screen.getByRole("button", { name: /next/i });
		fireEvent.click(nextButton);

		// Assert that the toast is triggered
		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: "Incomplete Details",
					description: "Both name and description are required.",
					status: "error"
				})
			);
		});
	});

	it("Toggle Public Button Updates Checked Value", async () => {
		(validateJSON as jest.Mock).mockReturnValueOnce({
			isValid: true,
			errorMessage: null
		});

		customRender(<UploadFile />);
		await setupUpload();

		const switchElement = screen.getByRole("checkbox", {
			name: /Enable Public Visibility/i
		});
		expect(switchElement).not.toBeChecked();

		act(() => {
			fireEvent.click(switchElement);
			expect(switchElement).toBeChecked();

			fireEvent.click(switchElement);
			expect(switchElement).not.toBeChecked();
		});
	});
});

describe("Review and Save", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFile.text = jest.fn().mockResolvedValue(JSON.stringify(mockFileData));
	});

	const setupUpload = async () => {
		const fileInput = screen.getByLabelText(
			/Browse your computer or drag and drop here/i
		);
		fireEvent.change(fileInput, { target: { files: [mockFile] } });
		await waitFor(() => {});

		const nextButton = screen.getByRole("button", { name: /next/i });
		fireEvent.click(nextButton);

		await waitFor(() => {});

		const graphNameInput = screen.getByPlaceholderText(
			/Enter a name for your graph/i
		);
		const graphDescriptionInput = screen.getByPlaceholderText(
			/Enter a description for your graph/i
		);
		fireEvent.change(graphNameInput, { target: { value: "Test Graph" } });
		fireEvent.change(graphDescriptionInput, {
			target: { value: "Test Description" }
		});
		const nextButton2 = screen.getByRole("button", { name: /next/i });
		fireEvent.click(nextButton2);
	};

	it("renders add details stepper", async () => {
		(validateJSON as jest.Mock).mockReturnValueOnce({
			isValid: true,
			errorMessage: null
		});
		customRender(<UploadFile />);
		await setupUpload();

		const saveButton = screen.getByRole("button", {
			name: /Save graph to your account/i
		});
		expect(saveButton).toBeInTheDocument();
	});

	it("test graph saves and routes to home", async () => {
		(parseGraphData as jest.Mock).mockReturnValueOnce(["GDP"]);
		(uploadGraph as jest.Mock).mockResolvedValueOnce({
			graphName: "test-graph"
		});
		(validateJSON as jest.Mock).mockReturnValueOnce({
			isValid: true,
			errorMessage: null
		});
		const router = useRouter();
		customRender(<UploadFile />);
		await setupUpload();

		const saveButton = screen.getByRole("button", {
			name: /Save graph to your account/i
		});
		expect(saveButton).toBeInTheDocument();

		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(parseGraphData).toHaveBeenCalledWith(JSON.stringify(mockFileData));
			expect(uploadGraph).toHaveBeenCalledWith(
				null,
				mockFile,
				"Test Graph",
				"Test Description",
				false,
				["GDP"]
			);
			expect(mockRouterPush).toHaveBeenCalledWith("/");
		});

		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({
				description:
					"The following graph has been saved to your account: test-graph",
				duration: 5000,
				isClosable: true,
				status: "success",
				title: "Graph saved"
			})
		);
	});

	it("test graph saves and routes to home", async () => {
		(parseGraphData as jest.Mock).mockReturnValueOnce(["GDP"]);
		(uploadGraph as jest.Mock).mockRejectedValueOnce(
			new Error("Upload failed")
		);
		(validateJSON as jest.Mock).mockReturnValueOnce({
			isValid: true,
			errorMessage: null
		});
		const router = useRouter();
		customRender(<UploadFile />);
		await setupUpload();

		const saveButton = screen.getByRole("button", {
			name: /Save graph to your account/i
		});
		expect(saveButton).toBeInTheDocument();

		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(validateJSON).toHaveBeenCalled();
			expect(parseGraphData).toHaveBeenCalled();
			expect(mockToast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: "Error while saving graph",
					status: "error",
					description: expect.stringContaining("Error: Upload failed")
				})
			);
		});
	});
});
