interface ValidationResult {
	isValid: boolean;
	errorMessage: string | null;
}

// Checks if the data is in the timestamp format
const isTimestampFormat = (data: any): boolean => {
	// Check if data has timestamps and time_unit as a key
	const requiredKeys = ["timestamps", "time_unit"];
	const hasRequiredKeys = requiredKeys.every((key) => key in data);

	return hasRequiredKeys;
};

const isNonTimestampFormat = (data: any): boolean => {
	const requiredKeys = ["nodes", "edges"];
	const hasRequiredKeys = requiredKeys.every((key) => key in data);

	return hasRequiredKeys;
};

export const validateJSON = (json: string): ValidationResult => {
	try {
		// Check if JSON syntax is valid
		const data = JSON.parse(json);

		if (!data || typeof data !== "object") {
			return {
				isValid: false,
				errorMessage: "Invalid JSON syntax"
			};
		}

		if (isTimestampFormat(data)) {
			return validateTimestampFormat(data);
		} else if (isNonTimestampFormat(data)) {
			return validateNonTimestampFormat(data);
		} else {
			return {
				isValid: false,
				errorMessage:
					"Invalid graph format, for timestamp format use keys:'timestamps' and 'time_unit', for non-timestamp format use 'nodes' and 'edges'"
			};
		}
	} catch (error) {
		return {
			isValid: false,
			errorMessage: `Invalid JSON syntax: ${error}`
		};
	}
};

const validateTimestampFormat = (data: any): ValidationResult => {
	// Validate the top-level structure of graph data
	const graphDataValidationResult = validateGraphData(data);
	if (!graphDataValidationResult.isValid) {
		return graphDataValidationResult;
	}

	// Validate each timestamp
	for (const timestamp of data.timestamps) {
		const timestampValidationResult = validateTimestamp(timestamp);
		if (!timestampValidationResult.isValid) {
			return timestampValidationResult;
		}
	}

	// Validate each node
	for (const timestamp of data.timestamps) {
		for (const node of timestamp.nodes) {
			const nodeValidationResult = validateNode(node);
			if (!nodeValidationResult.isValid) {
				return nodeValidationResult;
			}
		}
	}

	// Validate each edge
	for (const timestamp of data.timestamps) {
		for (const edge of timestamp.edges) {
			const edgeValidationResult = validateEdge(edge);
			if (!edgeValidationResult.isValid) {
				return edgeValidationResult;
			}
		}
	}

	return {
		isValid: true,
		errorMessage: null
	};
};

const validateNonTimestampFormat = (data: any): ValidationResult => {
	const requiredKeys = ["nodes", "edges"];
	const hasRequiredKeys = requiredKeys.every((key) => key in data);

	if (!hasRequiredKeys) {
		return {
			isValid: false,
			errorMessage: "Invalid keys, must be 'nodes' and 'edges'"
		};
	}

	// Validate Each node
	for (const node of data.nodes) {
		const nodeValidationResult = validateNode(node);
		if (!nodeValidationResult.isValid) {
			return nodeValidationResult;
		}
	}

	// Validate each edge
	for (const edge of data.edges) {
		const edgeValidationResult = validateEdge(edge);
		if (!edgeValidationResult.isValid) {
			return edgeValidationResult;
		}
	}

	// Validate Each edge
	return {
		isValid: true,
		errorMessage: null
	};
};

const validateGraphData = (data: any): ValidationResult => {
	// If data is not an object or is null, it is not a valid graph
	if (typeof data !== "object" || data === null) {
		return {
			isValid: false,
			errorMessage: "Invalid graph JSON format"
		};
	}

	// If time_unit is not a string, it is not a valid graph
	if (typeof data.time_unit !== "string") {
		return {
			isValid: false,
			errorMessage: "Invalid time_unit, must be a string"
		};
	}

	// If timestamps is not an array, it is not a valid graph
	if (!Array.isArray(data.timestamps)) {
		return {
			isValid: false,
			errorMessage: "Invalid timestamps, must be an array"
		};
	}

	if (!data.timestamps.length) {
		return {
			isValid: false,
			errorMessage: "Timestamps array cannot be empty"
		};
	}

	return {
		isValid: true,
		errorMessage: null
	};
};

const validateTimestamp = (timestamp: any): ValidationResult => {
	const requiredKeys = ["t", "nodes", "edges"];
	const hasRequiredKeys = requiredKeys.every((key) => key in timestamp);

	if (!hasRequiredKeys) {
		return {
			isValid: false,
			errorMessage: `Missing/Incorrect required keys: ${requiredKeys.filter((key) => !(key in timestamp)).join(", ")}`
		};
	}

	if (typeof timestamp !== "object") {
		return {
			isValid: false,
			errorMessage: "Invalid timestamp, must be an object"
		};
	}

	if (timestamp === null) {
		return {
			isValid: false,
			errorMessage: "Timestamp cannot be null"
		};
	}

	if (typeof timestamp.t !== "number") {
		return {
			isValid: false,
			errorMessage: "Invalid timestamp, must be a number"
		};
	}

	if (!Array.isArray(timestamp.nodes)) {
		return {
			isValid: false,
			errorMessage: "Invalid timestamp, nodes must be an array"
		};
	}

	if (!Array.isArray(timestamp.edges)) {
		return {
			isValid: false,
			errorMessage: "Invalid timestamp, edges must be an array"
		};
	}

	return {
		isValid: true,
		errorMessage: null
	};
};

const validateNode = (node: any): ValidationResult => {
	const requiredKeys = ["id", "label", "value", "category"];
	const hasRequiredKeys = requiredKeys.every((key) => key in node);

	if (!hasRequiredKeys) {
		return {
			isValid: false,
			errorMessage: `Missing/Incorrect required keys: ${requiredKeys.filter((key) => !(key in node)).join(", ")}`
		};
	}

	if (typeof node !== "object") {
		return {
			isValid: false,
			errorMessage: "Invalid node, must be an object"
		};
	}

	if (node === null) {
		return {
			isValid: false,
			errorMessage: "Node cannot be null"
		};
	}

	if (typeof node.id !== "string") {
		return {
			isValid: false,
			errorMessage: "Invalid node, id must be a string"
		};
	}

	if (typeof node.label !== "string") {
		return {
			isValid: false,
			errorMessage: "Invalid node, label must be a string"
		};
	}

	if (typeof node.value !== "number") {
		return {
			isValid: false,
			errorMessage: "Invalid node, value must be a number"
		};
	}

	if (typeof node.category !== "string") {
		return {
			isValid: false,
			errorMessage: "Invalid node, category must be a string"
		};
	}

	return {
		isValid: true,
		errorMessage: null
	};
};

const validateEdge = (edge: any): ValidationResult => {
	const requiredKeys = ["source", "target", "relationship", "strength"];
	const hasRequiredKeys = requiredKeys.every((key) => key in edge);

	if (!hasRequiredKeys) {
		return {
			isValid: false,
			errorMessage: `Missing/Incorrect required keys: ${requiredKeys.filter((key) => !(key in edge)).join(", ")}`
		};
	}

	if (typeof edge !== "object") {
		return {
			isValid: false,
			errorMessage: "Invalid edge, must be an object"
		};
	}

	if (edge === null) {
		return {
			isValid: false,
			errorMessage: "Edge cannot be null"
		};
	}

	if (typeof edge.source !== "string") {
		return {
			isValid: false,
			errorMessage: "Invalid edge, source must be a string"
		};
	}

	if (typeof edge.target !== "string") {
		return {
			isValid: false,
			errorMessage: "Invalid edge, target must be a string"
		};
	}

	if (typeof edge.relationship !== "string") {
		return {
			isValid: false,
			errorMessage: "Invalid edge, relationship must be a string"
		};
	}

	if (typeof edge.strength !== "number") {
		return {
			isValid: false,
			errorMessage: "Invalid edge, strength must be a number"
		};
	}

	if (edge.strength < 0 || edge.strength > 1) {
		return {
			isValid: false,
			errorMessage: "Invalid edge, strength must be between 0 and 1"
		};
	}

	return {
		isValid: true,
		errorMessage: null
	};
};
