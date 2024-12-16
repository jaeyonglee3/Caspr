/**
 * Storage related functions. ie. upload, download, etc.
 */

import { app, auth } from "@/config/firebaseConfig";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Graph } from "@/types/graph";
import { Timestamp } from "firebase/firestore";
import { User, getAuth } from "firebase/auth";
import { createGraph, getSharedGraphs } from "@/api";
import { apiClient } from "@/utils/apiClient";
import { sortGraphs } from "@/utils/sortGraphs";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/config/firebaseConfig";
import { list } from "postcss";
import { List } from "postcss/lib/list";

/**
 * Upload a graph via a JSON file to Firebase Storage and add metadata to Firestore.
 * @param graphFile - The JSON file containing graph data.
 * @param graphName - The name for the graph.
 * @param graphDescription - The description for the graph.
 * @returns A promise that resolves to the newly created graph.
 * @Jaeyong
 */
export const uploadGraph = async (
	firebaseUser: User | null,
	graphFile: File,
	graphName: string,
	graphDescription: string,
	graphVisibility: boolean,
	graphTags: string[]
): Promise<Graph | undefined> => {
	try {
		const storage = getStorage(app);
		const storageRef = ref(
			storage,
			`graphs/${auth.currentUser?.uid}/${graphName}.json`
		);
		await uploadBytes(storageRef, graphFile);

		const hashedId = uuidv4(); // Generate a unique hashed ID
		const graphURL = `${hashedId}`;

		const downloadURL = await getDownloadURL(storageRef);
		const graph: Graph = {
			owner: firebaseUser?.uid || "",
			graphName: graphName,
			graphDescription: graphDescription,
			graphTags: graphTags,
			graphVisibility: graphVisibility,
			graphFilePath: `graphs/${auth.currentUser?.uid}/${graphName}.json`,
			graphFileURL: downloadURL,
			graphURL: graphURL,
			createdAt: Timestamp.now(),
			sharedEmails: [],
			sharing: [],
			presets: []
		};

		await createGraph(graph);
		return graph;
	} catch (error) {
		console.error("Error uploading file or storing metadata: ", error);
		return undefined;
	}
};

/**
 * Fetches the graphs belonging to the user from firestore.
 * @param firebaseUser - The current user object.
 * @returns A promise that resolves to the array of graphs.
 * @Jaeyong @Samuel
 */
export const fetchCurrUserGraphs = async (
	firebaseUser: User | null,
	sortType: string = "none",
	filterType: string = "none"
) => {
	if (!firebaseUser) {
		return [];
	}

	if (firebaseUser) {
		try {
			const uid = firebaseUser.uid;
			const graphDataResponse = await apiClient(
				`/api/data/getGraphs?uid=${uid}&filterType=${filterType}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					}
				}
			);
			const graphData = await graphDataResponse.json();
			sortGraphs(graphData, sortType);

			return graphData;
		} catch (error) {
			console.error("Error fetching graphs:", error);
			return [];
		}
	}
};

/**
 * Fetches all publically visible graphs stored in Firestore.
 * @param firebaseUser - The current user object.
 * @returns A promise that resolves to the array of graphs.
 * @Jaeyong @Terry
 */
export const fetchAllPublicGraphs = async (
	firebaseUser: User | null,
	sortType: string = "nameAsc"
) => {
	try {
		const graphDataResponse = await apiClient(`/api/data/getPublicGraphs`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				id: firebaseUser?.uid
			})
		});

		const graphs = await graphDataResponse.json();
		sortGraphs(graphs, sortType);

		return graphs;
	} catch (error) {
		console.error("Error fetching graphs:", error);
		return [];
	}
};

/**
 * Fetches all publically visible graphs stored in Firestore inclduing the current user's graphs.
 * @returns A promise that resolves to the array of graphs.
 * @Samuel
 */
export const fetchAllUserAccessibleGraphs = async (
	firebaseUser: User | null
): Promise<Graph[]> => {
	if (!firebaseUser) {
		return [];
	}
	try {
		const publicGraphs = await fetchAllPublicGraphs(firebaseUser);
		const userGraphs = await fetchCurrUserGraphs(firebaseUser);
		let sharedGraphs: Graph[] = [];
		try {
			sharedGraphs = await getSharedGraphs(firebaseUser?.email ?? "");
		} catch (error) {
			console.error("Error fetching shared graphs:", error);
		}
		const allGraphs = [...publicGraphs, ...userGraphs, ...sharedGraphs];

		const uniqueGraphs = Array.from(
			new Set(allGraphs.map((graph) => graph.id))
		).map((id) => allGraphs.find((graph) => graph.id === id));

		return uniqueGraphs as Graph[];
	} catch (error) {
		console.error("Error fetching graphs:", error);
		return [];
	}
};

/**
 * Fetches the graph data from the URL stored in the Firestore graph object.
 * @param graph - The graph object containing the URL.
 * @returns A promise that resolves to the graph data
 * @Samuel
 */
export const getGraphData = async (graph: Graph): Promise<any> => {
	if (!graph || !graph.id) {
		throw new Error("Invalid graph object");
	}

	try {
		const auth = getAuth();
		const idToken = await auth.currentUser?.getIdToken();

		const headers: Record<string, string> = {
			"Content-Type": "application/json"
		};

		if (idToken) {
			headers["Authorization"] = `Bearer ${idToken}`;
		}

		const response = await apiClient(`/api/data/getGraphData?id=${graph.id}`, {
			method: "GET",
			headers
		});

		if (!response.ok) {
			throw new Error("Error fetching graph data");
		}

		const graphData = await response.json();
		return graphData;
	} catch (error) {
		console.error("Error fetching graph data:", error);
		throw error;
	}
};

/**
 * Update a graph object
 * @returns A promise that resolves to a string containing the updated graph id
 * @Terry
 */
export const updateGraphData = async (
	graphID: string | undefined,
	updates: any
) => {
	if (!graphID) {
		return [];
	}

	try {
		const auth = getAuth();
		const idToken = await auth.currentUser?.getIdToken();

		const id = graphID;
		const graphDataResponse = await apiClient(`/api/data/updateGraph`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${idToken}`
			},
			body: JSON.stringify({
				id: id,
				updates: updates
			})
		});
		const graphData = await graphDataResponse.json();
		return graphData;
	} catch (error) {
		console.error("Error fetching graphs:", error);
		throw error;
	}
};

/**
 * Delete a graph object
 * @returns A promise that resolves to a string containing the deleted
 * @Terry @Samuel
 */
export const deleteGraph = async (graph: Graph) => {
	if (!graph) {
		return [];
	}

	try {
		const auth = getAuth();
		const idToken = await auth.currentUser?.getIdToken();

		const graphDataResponse = await apiClient(`/api/data/deleteGraph`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${idToken}`
			},
			body: JSON.stringify({
				graphID: graph.id,
				graphFilePath: graph.graphFilePath
			})
		});
		const deleteGraphResponse = await graphDataResponse.json();
		return deleteGraphResponse;
	} catch (error) {
		console.error("Error deleting graph:", error);
		throw new Error("Failed to Delete");
	}
};
