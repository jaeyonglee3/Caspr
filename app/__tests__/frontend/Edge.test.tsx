import React from "react";
import { create } from "@react-three/test-renderer";
import Edge from "../../src/components/graphVisualization/Edge";

describe("Edge Component", () => {
	const defaultProps = {
		sourcePosition: [0, 0, 0] as [number, number, number],
		targetPosition: [10, 0, 0] as [number, number, number],
		relationship: "causal",
		strength: 0.8,
		isDimmed: false
	};
	test("debug rendered structure of Edge component", async () => {
		const renderer = await create(<Edge {...defaultProps} />);
		console.log("Scene Graph:", renderer.scene.children);

		const lineInstance = renderer.scene.children.find(
			(child) => (child._fiber as any).type === "Line2"
		);

		const coneMeshInstance = renderer.scene.children.find(
			(child) => (child._fiber as any).geometry?.type === "ConeGeometry"
		);

		const boxMeshInstance = renderer.scene.children.find(
			(child) => (child._fiber as any).geometry?.type === "BoxGeometry"
		);

		if (lineInstance) {
			const lineFiber = lineInstance._fiber as any;
			console.log("Line Geometry:", lineFiber.geometry);
			console.log("Line Material:", lineFiber.material);
		}
		if (coneMeshInstance) {
			const coneFiber = coneMeshInstance._fiber as any;
			console.log("Cone Position:", coneFiber.position);
		}
		if (boxMeshInstance) {
			const boxFiber = boxMeshInstance._fiber as any;
			console.log("Box Position:", boxFiber.position);
		}
	});
	test("renders Edge component with black color and arrow for causal relationship", async () => {
		const renderer = await create(<Edge {...defaultProps} />);
		const lineInstance = renderer.scene.children.find(
			(child) => (child._fiber as any).type === "Line2"
		);
		expect(lineInstance).toBeDefined();

		const lineFiber = lineInstance?._fiber as any;
		const material = lineFiber?.material;
		expect(material).toBeDefined();
		expect(material?.color?.getStyle()).toBe("rgb(0,0,0)");
		const arrowInstance = renderer.scene.children.find(
			(child) => (child._fiber as any).geometry?.type === "ConeGeometry"
		);

		expect(arrowInstance).toBeDefined();
		const arrowFiber = arrowInstance?._fiber as any;
		expect(arrowFiber?.geometry?.type).toBe("ConeGeometry");
	});

	test("renders Edge component with red color and no arrow for inhibitory relationship", async () => {
		const inhibitoryProps = {
			...defaultProps,
			relationship: "inhibitory"
		};

		const renderer = await create(<Edge {...inhibitoryProps} />);
		const lineInstance = renderer.scene.children.find(
			(child) => (child._fiber as any).type === "Line2"
		);

		expect(lineInstance).toBeDefined();

		const lineFiber = lineInstance?._fiber as any;
		const material = lineFiber?.material;
		expect(material).toBeDefined();
		expect(material?.color?.getStyle()).toBe("rgb(255,0,0)");

		const arrowInstance = renderer.scene.children.find(
			(child) => (child._fiber as any).geometry?.type === "ConeGeometry"
		);
		expect(arrowInstance).toBeUndefined();
	});
});
