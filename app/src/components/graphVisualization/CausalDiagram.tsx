/**
 * CausalDiagram component
 * @param {CausalDiagramProps} props - The props for the CausalDiagram component
 * @returns {ReactElement} The CausalDiagram component
 */
import React, { useEffect, useRef, useState } from "react";
import { Box, Checkbox } from "@chakra-ui/react";
import CameraController from "./CameraController";
import { Canvas } from "@react-three/fiber";
import Edge from "./Edge";
import { EdgeType } from "../../types/edge";
import Node from "./Node";
import { NodeType } from "../../types/node";
import { ViewPosition } from "@/types/camera";
import { useView } from "@/context/ViewContext";

interface CausalDiagramProps {
	nodes: NodeType[];
	edges: EdgeType[];
	selectedNode?: NodeType | null;
}

const colors = [
	"#195c90",
	"#de7f26",
	"#a0db8e",
	"#ac1e8e",
	"#edae01",
	"#d61800",
	"#cf6766"
];

const CausalDiagram: React.FC<CausalDiagramProps> = ({
	nodes,
	edges,
	selectedNode
}) => {
	const categoryColorMap = useRef<{ [key: string]: string }>({}).current;
	const [nodePositions, setNodePositions] = useState<{
		[key: string]: [number, number, number];
	}>({});
	const zPositions = useRef<{ [key: string]: number }>({});
	const [isInteracting, setIsInteracting] = useState(false);
	const [minStrength, setMinStrength] = useState(0);
	const [maxStrength, setMaxStrength] = useState(1);
	const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
	const [clickedNodeId, setClickedNodeId] = useState<string | null>(null);
	const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(
		new Set()
	);
	const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<Set<string>>(
		new Set()
	);
	const [showCausal, setShowCausal] = useState(true);
	const [showCorrelated, setShowCorrelated] = useState(true);
	const [showInhibitory, setShowInhibitory] = useState(true);
	const { setCurrentView, activePreset } = useView();
	const [initialViewState, setInitialViewState] = useState<ViewPosition | null>(null);

	// function to assign colors based on category (same color for nodes from one category)
	const getColorByCategory = (category: string): string => {
		if (!categoryColorMap[category]) {
			categoryColorMap[category] =
				colors[Object.keys(categoryColorMap).length % colors.length];
		}
		return categoryColorMap[category];
	};

	// Function to calculate the distance between two points in 3D space
	const calculateDistance = (
		pos1: [number, number, number],
		pos2: [number, number, number]
	): number => {
		const [x1, y1, z1] = pos1;
		const [x2, y2, z2] = pos2;
		return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
	};

	const getNeighborNodeIds = (nodeId: string) => {
		return edges
			.filter(
				(edge) =>
					(edge.source === nodeId || edge.target === nodeId) &&
					edge.relationship === "causal"
			)
			.map((edge) => (edge.source === nodeId ? edge.target : edge.source));
	};
	const handlePointerOver = (nodeId: string) => {
		setHoveredNodeId(nodeId);
	};

	const handlePointerOut = () => {
		setHoveredNodeId(null);
	};
	const handleCanvasClick = () => {
		setClickedNodeId(null);
	};
	const handleNodeClick = (nodeId: string) => {
		if (clickedNodeId === nodeId) {
			setClickedNodeId(null);
		} else {
			setClickedNodeId(nodeId);
		}
	};

	useEffect(() => {
		if (edges.length > 150 || nodes.length > 500) {
			setShowCausal(false);
			setShowCorrelated(false);
			setShowInhibitory(false);
		}
	}, [edges]);

	useEffect(() => {
		if (clickedNodeId) {
			const visitedNodeIds = new Set<string>();
			const visitedEdgeIds = new Set<string>();

			const traverseForward = (nodeId: string) => {
				visitedNodeIds.add(nodeId);
				edges.forEach((edge) => {
					if (edge.relationship === "causal" && edge.source === nodeId) {
						const edgeId = `${edge.source}-${edge.target}`;
						visitedEdgeIds.add(edgeId);
						if (!visitedNodeIds.has(edge.target)) {
							traverseForward(edge.target);
						}
					}
				});
			};

			const traverseBackward = (nodeId: string) => {
				visitedNodeIds.add(nodeId);
				edges.forEach((edge) => {
					if (edge.relationship === "causal" && edge.target === nodeId) {
						const edgeId = `${edge.source}-${edge.target}`;
						visitedEdgeIds.add(edgeId);
						if (!visitedNodeIds.has(edge.source)) {
							traverseBackward(edge.source);
						}
					}
				});
			};
			traverseForward(clickedNodeId);
			traverseBackward(clickedNodeId);

			setHighlightedNodeIds(visitedNodeIds);
			setHighlightedEdgeIds(visitedEdgeIds);
		} else {
			setHighlightedNodeIds(new Set());
			setHighlightedEdgeIds(new Set());
		}
	}, [clickedNodeId, edges]);

	useEffect(() => {
		// Calculate radial positions for each category
		const categories = Array.from(new Set(nodes.map((node) => node.category)));
		const radius = 200; // Adjust the radius as needed
		const angleStep = (2 * Math.PI) / categories.length;
		const categoryPositions: { [key: string]: [number, number] } = {};

		categories.forEach((category, index) => {
			const angle = index * angleStep;
			categoryPositions[category] = [
				Math.cos(angle) * radius,
				Math.sin(angle) * radius
			];
		});

		// Calculate scaling factor based on the number of nodes
		const scaleFactor = Math.sqrt(nodes.length) * 0.25;
		const minDistance = 50 * scaleFactor; // Minimum distance between nodes

		// Set node positions based on category with added deterministic noise
		const positions: { [key: string]: [number, number, number] } = {};
		nodes.forEach((node, index) => {
			if (!zPositions.current[node.id]) {
				const noiseZ = ((index % 5) - 5) * 100 * scaleFactor; // Deterministic noise for z position
				zPositions.current[node.id] = noiseZ;
			}
			const [x, y] = categoryPositions[node.category];
			const noiseX = ((index % 10) - 5) * 10 * scaleFactor; // Deterministic noise for x position
			const noiseY = ((Math.floor(index / 10) % 10) - 5) * 10 * scaleFactor; // Deterministic noise for y position
			positions[node.id] = [
				(x + noiseX) * scaleFactor,
				(y + noiseY) * scaleFactor,
				zPositions.current[node.id]
			];
		});

		// Adjust positions if nodes are too close
		nodes.forEach((node, index) => {
			const pos1 = positions[node.id];
			nodes.forEach((otherNode, otherIndex) => {
				if (index !== otherIndex) {
					const pos2 = positions[otherNode.id];
					if (calculateDistance(pos1, pos2) < minDistance) {
						// Adjust position to ensure minimum distance
						positions[otherNode.id] = [
							pos2[0] + minDistance,
							pos2[1] + minDistance,
							pos2[2] + minDistance
						];
					}
				}
			});
		});

		setNodePositions(positions);
	}, [nodes]);

	useEffect(() => {
		if (activePreset?.view) {
			setInitialViewState(activePreset.view);
		}
	}, [activePreset]);

	// Input handlers for min and max strength fields
	const handleMinStrengthChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setMinStrength(parseFloat(event.target.value));
	};

	const handleMaxStrengthChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setMaxStrength(parseFloat(event.target.value));
	};

	const filteredEdges = edges.filter(
		(edge) =>
			edge.strength >= minStrength &&
			edge.strength <= maxStrength &&
			((edge.relationship === "causal" && showCausal) ||
				(edge.relationship === "correlated" && showCorrelated) ||
				(edge.relationship === "inhibitory" && showInhibitory))
	);

	const farClippingPlane = Math.max(5000, nodes.length * 20);

	return (
		<div>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
				<Box display="flex" alignItems="center" gap={4}>
					<label htmlFor="min-strength" style={{ marginRight: "10px" }}>
						Min Strength:
					</label>
					<input
						type="number"
						id="min-strength"
						value={minStrength}
						onChange={handleMinStrengthChange}
						step="0.1"
						min="0"
						max="1"
						style={{ marginRight: "20px" }}
					/>

					<label htmlFor="max-strength" style={{ marginRight: "10px" }}>
						Max Strength:
					</label>
					<input
						type="number"
						id="max-strength"
						value={maxStrength}
						onChange={handleMaxStrengthChange}
						step="0.1"
						min="0"
						max="1"
						style={{ marginRight: "20px" }}
					/>

					<Checkbox isChecked={showCausal} onChange={() => setShowCausal(!showCausal)}>
						Causal
					</Checkbox>
					<Checkbox isChecked={showCorrelated} onChange={() => setShowCorrelated(!showCorrelated)}>
						Correlated
					</Checkbox>
					<Checkbox isChecked={showInhibitory} onChange={() => setShowInhibitory(!showInhibitory)}>
						Inhibitory
					</Checkbox>
				</Box>
			</Box>

			<Canvas
				camera={{
					position: [0, 0, 100],
					fov: 50,
					near: 0.1,
					far: farClippingPlane
				}}
				style={{ width: "100%", height: "89vh" }}
				onPointerMissed={handleCanvasClick}
			>
				<ambientLight intensity={1.0} />
				<directionalLight position={[10, 10, 10]} intensity={1} />
				<CameraController
					nodePositions={nodePositions}
					setIsInteracting={setIsInteracting}
					onCameraStateChange={setCurrentView}
				/>
				{Object.keys(nodePositions).length > 0 &&
					nodes.map((node) => {
						const isNeighbor =
							hoveredNodeId &&
							getNeighborNodeIds(hoveredNodeId).includes(node.id);
						const isHovered = hoveredNodeId === node.id;
						const isInCausalPath = highlightedNodeIds.has(node.id);
						let isDimmed = false;

						if (clickedNodeId) {
							isDimmed = !isInCausalPath && !isHovered && !isNeighbor;
						} else if (hoveredNodeId) {
							isDimmed = !isHovered && !isNeighbor;
						}
						return (
							<Node
								key={node.id}
								position={nodePositions[node.id]}
								label={node.label}
								value={node.value}
								category={node.category}
								color={getColorByCategory(node.category)}
								isInteracting={isInteracting}
								isSelected={!!(selectedNode && selectedNode.id === node.id)}
								isDimmed={isDimmed}
								onPointerOver={() => handlePointerOver(node.id)}
								onPointerOut={handlePointerOut}
								onClick={() => handleNodeClick(node.id)}
								totalNodes={nodes.length}
							/>
						);
					})}
				{Object.keys(nodePositions).length > 0 &&
					filteredEdges.map((edge) => {
						const sourcePosition = nodePositions[edge.source];
						const targetPosition = nodePositions[edge.target];
						if (!sourcePosition || !targetPosition) return null;
						const edgeId = `${edge.source}-${edge.target}`;
						const isEdgeHighlighted = highlightedEdgeIds.has(edgeId);
						const isNeighborEdge =
							hoveredNodeId &&
							(edge.source === hoveredNodeId || edge.target === hoveredNodeId) &&
							edge.relationship === "causal";

						let isDimmed = false;

						if (clickedNodeId) {
							isDimmed = !isEdgeHighlighted && !isNeighborEdge;
						} else if (hoveredNodeId) {
							isDimmed = !isNeighborEdge;
						}

						return (
							<Edge
								key={`${edge.source}-${edge.target}`}
								sourcePosition={sourcePosition}
								targetPosition={targetPosition}
								relationship={edge.relationship}
								strength={edge.strength}
								isDimmed={isDimmed}
							/>
						);
					})}
			</Canvas>
		</div>
	);
};

export default CausalDiagram;