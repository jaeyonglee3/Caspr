import React from "react";
import { create } from "@react-three/test-renderer";
import Node from "../../src/components/graphVisualization/Node";
import { Color } from "three";

describe("Node Component", () => {
	const defaultProps = {
		position: [0, 0, 0] as [number, number, number],
		label: "Test Node",
		value: 1,
		category: "Test Category",
		color: "#ff0000",
		isInteracting: false,
		isSelected: false,
		isDimmed: false,
		onPointerOver: jest.fn(),
		onPointerOut: jest.fn(),
		onClick: jest.fn()
	};
	test("debug rendered structure", async () => {
		const renderer = await create(<Node {...defaultProps} />);
		console.log(JSON.stringify(renderer.toTree(), null, 2));
		console.log(renderer.scene);
	});
	test("renders correctly", async () => {
		const renderer = await create(<Node {...defaultProps} />);
		const mesh = renderer.scene.children[0];
		expect(mesh.type).toBe("Mesh");
	});
	test("displays tooltip on hover", async () => {
		jest.useFakeTimers();
		const renderer = await create(<Node {...defaultProps} />);
		const mesh = renderer.scene.children[0];

		mesh.props.onPointerOver();
		jest.runAllTimers();
		expect(defaultProps.onPointerOver).toHaveBeenCalled();
	});
	test("hides tooltip on pointer out", async () => {
		jest.useFakeTimers();
		const renderer = await create(<Node {...defaultProps} />);
		const mesh = renderer.scene.children[0];

		mesh.props.onPointerOver();
		jest.runAllTimers();

		mesh.props.onPointerOut();
		jest.runAllTimers();

		expect(defaultProps.onPointerOut).toHaveBeenCalled();
	});
	test("increases scale when selected", async () => {
		const props = { ...defaultProps, isSelected: true };
		const renderer = await create(<Node {...props} />);
		const mesh = renderer.scene.children[0];
		const baseScale = 2;
		const scaleFactor = Math.sqrt(props.totalNodes) * 0.1;
		const expectedScale = [
			baseScale * scaleFactor * 5,
			baseScale * scaleFactor * 5,
			baseScale * scaleFactor * 5
		].map((value) => Math.max(value, 2));
		expect(mesh.props.scale).toEqual(expectedScale);
	});
	test("handles click events", async () => {
		const renderer = await create(<Node {...defaultProps} />);
		const mesh = renderer.scene.children[0];
		mesh.props.onClick();
		expect(defaultProps.onClick).toHaveBeenCalled();
	});
	test("renders with the correct color", async () => {
		const renderer = await create(<Node {...defaultProps} />);
		const meshInstance = renderer.scene.children.find(
			(child) => child.type === "Mesh"
		);

		expect(meshInstance).toBeDefined();
		const meshObject = meshInstance?._fiber as any;

		expect(meshObject.material).toBeDefined();
		const materialColor = meshObject.material.color;
		const expectedColor = new Color(defaultProps.color);
		expect(materialColor.getHex()).toBe(expectedColor.getHex());
	});
	test("renders with the correct color when selected", async () => {
		const renderer = await create(<Node {...defaultProps} isSelected={true} />);
		const meshInstance = renderer.scene.children.find(
			(child) => child.type === "Mesh"
		);

		expect(meshInstance).toBeDefined();
		const meshObject = meshInstance?._fiber as any;

		expect(meshObject.material).toBeDefined();
		const materialColor = meshObject.material.color;
		const expectedColor = new Color(defaultProps.color);
		expect(materialColor.getHex()).toBe(expectedColor.getHex());
	});
});
