import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import CausalDiagram from "../../src/components/graphVisualization/CausalDiagram";
import "@testing-library/jest-dom";
import { act } from "@testing-library/react";
import { ViewProvider } from "@/context/ViewContext";

const nodes = [
	{ id: "1", label: "Node 1", category: "A", value: 10 },
	{ id: "2", label: "Node 2", category: "B", value: 20 },
	{ id: "3", label: "Node 3", category: "B", value: 30 },
	{ id: "4", label: "Node 4", category: "C", value: 40 }
];

const edges = [
	{ source: "1", target: "2", relationship: "causal", strength: 0.5 },
	{ source: "2", target: "3", relationship: "correlated", strength: 0.7 },
	{ source: "2", target: "4", relationship: "causal", strength: 0.7 }
];

jest.mock("@react-three/drei", () => ({
	OrbitControls: jest.fn((props) => {
		const mockControls = {
			getPolarAngle: jest.fn().mockReturnValue(0),
			getAzimuthalAngle: jest.fn().mockReturnValue(0)
		};
		if (props.ref) {
			props.ref.current = mockControls;
		}
		return null;
	})
}));

jest.mock("@react-three/fiber", () => ({
	...jest.requireActual("@react-three/fiber"),

	extend: jest.fn(),
	useFrame: jest.fn()
}));

const mockNode = jest.fn();
jest.mock("../../src/components/graphVisualization/Node", () => (props: any) => {
	mockNode(props);
	return null;
});

const mockEdge = jest.fn();

jest.mock("../../src/components/graphVisualization/Edge", () => (props: any) => {
	mockEdge(props);
	return null;
});

HTMLCanvasElement.prototype.getContext = jest
	.fn()
	.mockImplementation((type) => {
		if (type === "webgl" || type === "webgl2") {
			return {
				getExtension: jest.fn(),
				createShader: jest.fn(),
				shaderSource: jest.fn(),
				compileShader: jest.fn(),
				createProgram: jest.fn(),
				attachShader: jest.fn(),
				linkProgram: jest.fn(),
				useProgram: jest.fn(),
				getProgramParameter: jest.fn().mockReturnValue(true),
				getShaderParameter: jest.fn().mockReturnValue(true),
				getAttribLocation: jest.fn(),
				vertexAttribPointer: jest.fn(),
				enableVertexAttribArray: jest.fn(),
				uniformMatrix4fv: jest.fn(),
				getShaderPrecisionFormat: jest.fn(),
				setPixelRatio: jest.fn(),
				precision: "highp"
			};
		}
		return null;
	});

jest.mock("three", () => ({
	...jest.requireActual("three"),
	WebGLRenderer: jest.fn().mockImplementation(() => ({
		setSize: jest.fn(),
		render: jest.fn(),
		setPixelRatio: jest.fn(),
		precision: "highp"
	}))
}));

describe("CausalDiagram Visualization", () => {
	beforeEach(() => {
		mockNode.mockClear();
		mockEdge.mockClear();
	});

	const renderWithChakra = (ui: React.ReactElement) => {
		return render(
			<ChakraProvider>
				<ViewProvider>{ui}</ViewProvider>
			</ChakraProvider>
		);
	};

	test("renders without crashing", () => {
		const { container } = renderWithChakra(
			<CausalDiagram nodes={nodes} edges={edges} />
		);
		expect(container).toBeInTheDocument();
	});

	test("renders nodes correctly", () => {
		renderWithChakra(<CausalDiagram nodes={nodes} edges={edges} />);

		expect(mockNode).toHaveBeenCalledTimes(nodes.length);

		nodes.forEach((node) => {
			const matchedCall = mockNode.mock.calls.find(
				([props]) =>
					props.label === node.label &&
					props.category === node.category &&
					props.value === node.value
			);

			expect(matchedCall).toBeDefined();
		});
	});

	test("renders edges correctly", () => {
		renderWithChakra(<CausalDiagram nodes={nodes} edges={edges} />);

		expect(mockEdge).toHaveBeenCalledTimes(edges.length);

		edges.forEach((edge) => {
			const matchedCall = mockEdge.mock.calls.find(
				([props]) =>
					props.relationship === edge.relationship &&
					props.strength === edge.strength &&
					props.sourcePosition &&
					props.targetPosition
			);

			expect(matchedCall).toBeDefined();

			const [props] = matchedCall;
			expect(props.sourcePosition).toBeDefined();
			expect(props.targetPosition).toBeDefined();
		});
	});
	test("nodes from the same category have the same color", () => {
		renderWithChakra(<CausalDiagram nodes={nodes} edges={edges} />);

		const categoryColors: { [key: string]: string } = {};

		mockNode.mock.calls.forEach(([props]) => {
			const { category, color } = props;

			if (!categoryColors[category]) {
				categoryColors[category] = color;
			} else {
				expect(color).toBe(categoryColors[category]);
			}
		});
		const uniqueColors = new Set(Object.values(categoryColors));
		expect(uniqueColors.size).toBe(Object.keys(categoryColors).length);
	});

	test("sets up OrbitControls for rotation, panning and zooming", () => {
		const { OrbitControls } = require("@react-three/drei");

		renderWithChakra(<CausalDiagram nodes={nodes} edges={edges} />);
		expect(OrbitControls).toHaveBeenCalled();

		const orbitControlsCall = OrbitControls.mock.calls[0];
		expect(orbitControlsCall).toBeDefined();
		expect(orbitControlsCall[0]).toEqual(expect.objectContaining({}));
	});

	test("hovering over a node dims all other nodes and unrelated edges", () => {
		renderWithChakra(<CausalDiagram nodes={nodes} edges={edges} />);

		const hoveredNodeCall = mockNode.mock.calls.find(
			([props]) => props.label === "Node 1"
		);
		expect(hoveredNodeCall).toBeDefined();

		act(() => {
			hoveredNodeCall[0].onPointerOver();
		});

		const lastNodeCalls = mockNode.mock.calls.slice(-4).map(([props]) => ({
			label: props.label,
			isDimmed: props.isDimmed
		}));

		const lastEdgeCalls = mockEdge.mock.calls.map(([props]) => ({
			source: props.sourcePosition,
			target: props.targetPosition,
			isDimmed: props.isDimmed
		}));

		expect(lastNodeCalls).toEqual([
			{ label: "Node 1", isDimmed: false },
			{ label: "Node 2", isDimmed: false },
			{ label: "Node 3", isDimmed: true },
			{ label: "Node 4", isDimmed: true }
		]);

		expect(lastEdgeCalls).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ isDimmed: false }),
				expect.objectContaining({ isDimmed: true })
			])
		);
	});

	test("clicking a node highlights the path", () => {
		renderWithChakra(<CausalDiagram nodes={nodes} edges={edges} />);

		const clickedNodeCall = mockNode.mock.calls.find(
			([props]) => props.label === "Node 1"
		);
		expect(clickedNodeCall).toBeDefined();

		act(() => {
			clickedNodeCall[0].onClick();
		});

		const lastThreeCalls = mockNode.mock.calls.slice(-4).map(([props]) => ({
			label: props.label,
			isDimmed: props.isDimmed
		}));

		expect(lastThreeCalls).toEqual([
			{ label: "Node 1", isDimmed: false },
			{ label: "Node 2", isDimmed: false },
			{ label: "Node 3", isDimmed: true },
			{ label: "Node 4", isDimmed: false }
		]);
	});
});
