import "@testing-library/jest-dom";

import { Graph, User, SharedUser, Preset } from "@/types";

import MyGraphObject from "../../src/components/MyGraphCard";
import React from "react";
import { Timestamp } from "firebase/firestore"; // Import Timestamp
import customRender from "@/test-utils/render";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { deleteGraph } from "@/api";

jest.mock("@/api", () => ({
	deleteGraph: jest.fn()
}));

const sampleGraph: Graph = {
	id: "1",
	owner: "Kevin",
	graphName: "Test Title",
	graphDescription: "Test Description",
	graphTags: ["GDP"],
	graphFileURL: "https://www.google.com",
	graphFilePath: "/1/Test Title.json",
	graphURL: "1234",
	graphVisibility: true,
	createdAt: Timestamp.fromDate(new Date("2023-09-01")),
	sharing: [],
	sharedEmails: [],
	presets: []
};

describe("GraphObject renders correctly", () => {
	test("renders GraphObject component", () => {
		customRender(
			<MyGraphObject
				graph={sampleGraph}
				owner={
					{
						uid: "1",
						name: "Kevin",
						email: "",
						photoURL: "",
						createdAt: Timestamp.fromDate(new Date("2023-09-01")),
						roles: []
					} as User
				}
			/>
		);

		const titleElement = screen.getByText(/Test Title/i);
		const descriptionElement = screen.getByText(/Test Description/i);
		const authorElement = screen.getByText(/Kevin/i);

		expect(titleElement).toBeInTheDocument();
		expect(descriptionElement).toBeInTheDocument();
		expect(authorElement).toBeInTheDocument();
	});

	test("renders GraphObject button", () => {
		customRender(
			<MyGraphObject
				graph={sampleGraph}
				owner={
					{
						uid: "1",
						name: "Kevin",
						email: "",
						photoURL: "",
						createdAt: Timestamp.fromDate(new Date("2023-09-01")),
						roles: []
					} as User
				}
			/>
		);

		const shareButton = screen.getByText(/Share/i);
		const deleteButton = screen.getByText(/Delete/i);
		expect(deleteButton).toBeInTheDocument();
		expect(shareButton).toBeInTheDocument();
	});

	test("navigates to the correct page when graph title is clicked", () => {
		const originalLocation = window.location;
		Object.defineProperty(window, "location", {
			writable: true,
			value: { href: "" }
		});

		customRender(
			<MyGraphObject
				graph={sampleGraph}
				owner={
					{
						uid: "1",
						name: "Kevin",
						email: "",
						photoURL: "",
						createdAt: Timestamp.fromDate(new Date("2023-09-01")),
						roles: []
					} as User
				}
			/>
		);

		const openButton = screen.getByText(/Test Title/i);
		fireEvent.click(openButton);

		const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

		expect(window.location.href).toBe(`${baseURL}/graph/1234?auth=undefined`);

		window.location = originalLocation;
	});
});
