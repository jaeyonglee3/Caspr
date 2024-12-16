/**
 * Represents the viewing position for a graph.
 * @Samuel
 */
export interface ViewPosition {
	x: number;
	y: number;
	z: number;
	orientation: Orientation | null;
}

/**
 * Represents the orientation in 3D space.
 * @Samuel
 */
export interface Orientation {
	pitch: number; // Rotation around the x-axis
	yaw: number; // Rotation around the y-axis
	roll: number; // Rotation around the z-axis
}