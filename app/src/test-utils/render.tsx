/**
 * Custom render function to wrap components with Providers
 * @param {React.ReactElement} ui - The component to render
 * @returns {RenderResult} The rendered component
 */
import React from "react";
import { render } from "@testing-library/react";
import { Providers } from "@/app/providers";

const customRender = (ui: React.ReactElement) => {
	return render(<Providers>{ui}</Providers>);
};

export default customRender;
