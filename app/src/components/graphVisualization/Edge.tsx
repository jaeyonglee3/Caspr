/**
 * Edge component
 * @param {EdgeProps} props - The edge properties
 * @returns {ReactElement} Edge component
 */
import React, { useRef, useState } from "react";
import { Line, Html } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
extend({ ConeGeometry: THREE.ConeGeometry });

interface EdgeProps {
	sourcePosition: [number, number, number];
	targetPosition: [number, number, number];
	relationship: string;
	strength: number;
	isDimmed: boolean;
}

const Edge: React.FC<EdgeProps> = ({
	sourcePosition,
	targetPosition,
	relationship,
	strength,
	isDimmed
}) => {
	const [hovered, setHovered] = useState(false);
	const hideTooltipTimeout = useRef<NodeJS.Timeout | null>(null);

	const handlePointerOver = () => {
		if (hideTooltipTimeout.current) {
			clearTimeout(hideTooltipTimeout.current);
			hideTooltipTimeout.current = null;
		}
		setHovered(true);
	};
	const handlePointerOut = () => {
		hideTooltipTimeout.current = setTimeout(() => {
			setHovered(false);
		}, 200);
	};
	if (!sourcePosition || !targetPosition) {
		console.error("Invalid source or target position for edge", {
			sourcePosition,
			targetPosition
		});
		return null;
	}

	const scaledLineWidth = 0.1 + strength * 3;
	const nodeRadius = 12;

	let color = "black";
	let dashed = false;
	let arrow = false;

	switch (relationship) {
		case "causal":
			arrow = true;
			break;
		case "correlated":
			dashed = false;
			break;
		case "inhibitory":
			color = "red";
			break;
		default:
			console.error("Unknown relationship type", relationship);
	}

	const direction = new THREE.Vector3(
		targetPosition[0] - sourcePosition[0],
		targetPosition[1] - sourcePosition[1],
		targetPosition[2] - sourcePosition[2]
	);

	const normalizedDirection = direction.clone().normalize();

	const adjustedSource = new THREE.Vector3(
		sourcePosition[0] + normalizedDirection.x * nodeRadius,
		sourcePosition[1] + normalizedDirection.y * nodeRadius,
		sourcePosition[2] + normalizedDirection.z * nodeRadius
	);

	const adjustedTarget = new THREE.Vector3(
		targetPosition[0] - normalizedDirection.x * nodeRadius,
		targetPosition[1] - normalizedDirection.y * nodeRadius,
		targetPosition[2] - normalizedDirection.z * nodeRadius
	);

	// Calculate the midpoint between source and target
	const arrowPosition = new THREE.Vector3(
		targetPosition[0] - normalizedDirection.x * 16,
		targetPosition[1] - normalizedDirection.y * 16,
		targetPosition[2] - normalizedDirection.z * 16
	);

	// Calculate the rotation quaternion for the arrow
	const arrowRotation = new THREE.Quaternion();
	arrowRotation.setFromUnitVectors(
		new THREE.Vector3(0, 1, 0),
		normalizedDirection
	);

	return (
		<>
			<Line
				points={[adjustedSource.toArray(), adjustedTarget.toArray()]}
				lineWidth={scaledLineWidth}
				color={color}
				dashed={dashed}
				opacity={isDimmed ? 0.3 : 1}
				onPointerOver={handlePointerOver}
				onPointerOut={handlePointerOut}
			/>
			{arrow && (
				<mesh position={arrowPosition} quaternion={arrowRotation}>
					<coneGeometry args={[5, 10, 32]} />
					<meshBasicMaterial
						color={color}
						opacity={isDimmed ? 0.5 : 1}
						transparent
						depthTest={false}
					/>
				</mesh>
			)}
			<mesh
				position={arrowPosition}
				rotation={[0, 0, Math.atan2(direction.y, direction.x)]}
				onPointerOver={() => setHovered(true)}
				onPointerOut={() => setHovered(false)}
			>
				<boxGeometry args={[direction.length(), 5, 5]} />
				<meshBasicMaterial color="transparent" opacity={0} transparent />
			</mesh>
			{hovered && (
				<Html position={arrowPosition}>
					<div className="edge-tooltip">
						<strong>Relationship:</strong> {relationship}
						<br />
						<strong>Strength:</strong> {strength}
					</div>
				</Html>
			)}
		</>
	);
};

export default Edge;
