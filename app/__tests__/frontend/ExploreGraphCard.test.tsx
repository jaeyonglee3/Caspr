import "@testing-library/jest-dom";
import { Graph, User } from "@/types";
import MyGraphObject from "../../src/components/ExploreGraphCard";
import React from "react";
import { Timestamp } from "firebase/firestore";
import customRender from "@/test-utils/render";
import { screen, fireEvent } from "@testing-library/react";

describe("ExploreGraphCard", () => {
  const mockGraph: Graph = {
    id: "1",
    owner: "Kevin",
    graphName: "Test Title",
    graphDescription: "Test Description",
    graphFileURL: "https://www.google.com",
    graphURL: "1234",
    graphVisibility: true,
    createdAt: Timestamp.fromDate(new Date("2023-09-01")),
    sharing: [],
    sharedEmails: [],
    presets: [],
  };

  const mockOwner: User = {
    uid: "1",
    name: "Kevin",
    email: "",
    photoURL: "",
    createdAt: Timestamp.fromDate(new Date("2023-09-01")),
    roles: [],
  };

  test("renders ExploreGraphCard component", () => {
    customRender(<MyGraphObject graph={mockGraph} owner={mockOwner} />);

    const titleElement = screen.getByText(/Test Title/i);
    const descriptionElement = screen.getByText(/Test Description/i);
    const authorElement = screen.getByText(/Kevin/i);

    expect(titleElement).toBeInTheDocument();
    expect(descriptionElement).toBeInTheDocument();
    expect(authorElement).toBeInTheDocument();
  });

  test("navigates to the correct page when Open button is clicked", () => {
    const originalLocation = window.location;
    const mockAssign = jest.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { assign: mockAssign }
    });
    window.location = { assign: mockAssign } as any;

    customRender(<MyGraphObject graph={mockGraph} owner={mockOwner} />);

    const openButton = screen.getByText(/Open/i);
    fireEvent.click(openButton);

    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    expect(window.location.href).toBe(`${baseURL}/graph/1234`);

    window.location = originalLocation;
  });
});