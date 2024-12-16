/**
 * Firestore API
 * This module contains functions for interacting with Firestore.
 */

import { Graph, Preset, User } from "@/types";
import { Timestamp, doc, getDoc, updateDoc } from "firebase/firestore";

import { apiClient } from "@/utils/apiClient";
import { db } from "@/config/firebaseConfig";
import { sortGraphs } from "@/utils/sortGraphs";
import { getAuth } from "firebase/auth";

/**
 * Get a user document from Firestore.
 * @param uid - The user's UID.
 * @returns A promise that resolves to the user document.
 * @Samuel
 */
export const getUser = async (uid: string): Promise<User> => {
	try {
		const response = await apiClient(`/api/data/${uid}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});

		if (!response.ok) {
			throw new Error("Error while getting user data");
		}

		const user = await response.json();

		return user;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Create a user document in Firestore.
 * @param user - The user object.
 * @returns A promise that resolves to the created user document.
 * @Danny
 */
export const createUser = async (user: User): Promise<void> => {
	try {
		const response = await apiClient("/api/data/createUser", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ user })
		});

		await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Create a graph metadata document in Firestore.
 * @param graph - The graph object.
 * @returns A promise that resolves to the created graph document.
 * @Danny @Samuel
 */
export const createGraph = async (graph: Graph): Promise<void> => {
	try {
		const response = await apiClient("/api/data/createGraph", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ graph })
		});

		if (!response.ok) {
			throw new Error("Error while creating graph");
		}

		await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Create and store a preset to an existing graph in Firestore.
 * If a preset with the same name exists, it will be updated.
 * @param graphId - The ID of the graph document.
 * @param preset - The preset object.
 * @returns A promise that resolves when the preset is added or updated.
 * @Danny @Samuel
 */
export const addPreset = async (
	graphId: string,
	preset: Preset
): Promise<void> => {
	try {
		const response = await apiClient("/api/data/presets/add", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ graphId, preset })
		});

		if (!response.ok) {
			throw new Error((await response.json()).error);
		}

		await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Deletes a specific preset from Firestore for a given graph by preset name.
 * @param graphId - The ID of the graph document.
 * @param presetName - The name of the preset to delete.
 * @returns A promise that resolves when the preset is deleted.
 * @Samuel
 */
export const deletePreset = async (
	graphId: string,
	presetName: string
): Promise<void> => {
	try {
		const response = await apiClient("/api/data/presets/delete", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ graphId, presetName })
		});

		if (!response.ok) {
			throw new Error((await response.json()).error);
		}
		await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Gets a specific preset from Firestore for a given graph by preset name.
 * @param graphId - The ID of the graph document.
 * @param presetName - The name of the preset.
 * @returns A promise that resolves to the preset object.
 * @Samuel
 * TODO: move to server side
 */
export const getPresetByName = async (
	graphId: string,
	presetName: string
): Promise<Preset | null> => {
	try {
		const response = await apiClient(
			`/api/data/presets/getPreset?graphId=${encodeURIComponent(graphId)}&presetName=${encodeURIComponent(presetName)}`,
			{ method: "GET" }
		);

		if (!response.ok) {
			throw new Error((await response.json()).error);
		}

		const data = await response.json();
		return data.preset;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Gets all presets from Firestore for a given graph.
 * @param graphId - The ID of the graph document.
 * @returns A promise that resolves to an array containing all presets.
 * @Samuel
 */
export const getAllPresets = async (
	graphId: string
): Promise<Preset[] | null> => {
	try {
		const response = await apiClient(
			`/api/data/presets/getAll?graphId=${encodeURIComponent(graphId)}`,
			{ method: "GET" }
		);

		if (!response.ok) {
			throw new Error((await response.json()).error);
		}

		const data = await response.json();
		return data.presets;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Update a user document in Firestore.
 * @param user - The user object.
 * @returns A promise that resolves to the updated user document.
 */
// export const updateUser = async (user: User): Promise<void> => {
// 	// implement
// };

/**
 * Delete a user document in Firestore.
 * @param uid - The user's UID.
 * @returns A promise that resolves when the user document is deleted.
 */
// export const deleteUser = async (uid: string): Promise<void> => {
// 	// implement
// };

/**
 * Share graph and specific presets with a user
 * @param graphId - The ID of the graph document.
 * @param email - The email of the user to share with.
 * @param presetNames - Optional. The names of the presets to share. If not provided, no presets will be shared.
 * @param role - The role of the user in the graph.
 * @returns A promise that resolves to true if the share was successful.
 * @Samuel
 */
export const shareGraphWithUser = async (
	graphId: string,
	email: string,
	presetNames?: string[],
	role = 0
): Promise<boolean> => {
	try {
		const auth = getAuth();
		const idToken = await auth.currentUser?.getIdToken();

		const response = await apiClient("/api/data/shareGraph", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${idToken}`
			},
			body: JSON.stringify({ graphId, email, presetNames, role })
		});

		if (!response.ok) {
			throw new Error("Error sharing graph");
		}

		await response.json();
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
};

/**
 * Remove sharing access for a user from a graph
 * @param graphId - The ID of the graph document
 * @param email - The email of the user to unshare from
 * @returns Promise resolving to true if successful
 * @Samuel
 */
export const unshareGraphFromUser = async (
	graphId: string,
	email: string
): Promise<boolean> => {
	try {
		const auth = getAuth();
		const idToken = await auth.currentUser?.getIdToken();

		const response = await apiClient("/api/data/unshareGraph", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${idToken}`
			},
			body: JSON.stringify({ graphId, email })
		});

		if (!response.ok) {
			throw new Error("Error unsharing graph");
		}

		await response.json();
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
};

/**
 * Remove a user from the shared users list of a graph
 * @param email - The email of the user to remove.
 * @returns A promise that resolves to true if the user was removed.
 * @Samuel
 */
export const getSharedGraphs = async (
	email: string,
	sortType: string = "none",
	filterType: string = "none"
): Promise<Graph[]> => {
	try {
		const response = await apiClient(
			`/api/data/getSharedGraphs?email=${email}&filterType=${filterType}`
		);

		if (!response.ok) {
			throw new Error("Error getting shared graphs");
		}

		const { graphs } = await response.json();
		sortGraphs(graphs, sortType);

		return graphs;
	} catch (error) {
		console.error(error);
		return [];
	}
};

/**
 * Accept a graph share invitation and update user ID
 * @param graphId - The ID of the graph document.
 * @param email - The email of the user to accept the share.
 * @param uid - The user ID to update in the shared users list.
 * @returns A promise that resolves to true if the share was accepted.
 * @Samuel
 * TODO: move to server side, but currently unused
 */
export const acceptShareInvite = async (
	graphId: string,
	email: string,
	uid: string
): Promise<boolean> => {
	try {
		const graphRef = doc(
			db,
			process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "",
			graphId
		);
		const graphSnap = await getDoc(graphRef);

		if (!graphSnap.exists()) return false;

		const graph = graphSnap.data() as Graph;
		const sharing = graph.sharing || [];
		const userIndex = sharing.findIndex((u) => u.email === email);

		if (userIndex === -1) return false;

		sharing[userIndex] = {
			...sharing[userIndex],
			uid,
			status: "accepted",
			acceptedAt: Timestamp.now()
		};

		await updateDoc(graphRef, { sharing });
		return true;
	} catch (error) {
		console.error("Error accepting invite:", error);
		return false;
	}
};
