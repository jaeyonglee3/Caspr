/**
 * This API endpoint deletes a preset for a graph.
 * @param req The incoming request object.
 * @param res The outgoing response object.
 * @returns A message indicating the success of the operation.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { dbAdmin } from "@/config/firebaseAdmin";
import { Preset } from "@/types";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "DELETE") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { graphId, presetName } = req.body;

	if (!graphId || !presetName) {
		return res.status(400).json({ error: "Graph ID and preset name are required" });
	}

	try {
		const graphRef = dbAdmin.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "").doc(graphId);
		const graphSnap = await graphRef.get();

		if (!graphSnap.exists) {
			return res.status(404).json({ error: "Graph not found" });
		}

		const data = graphSnap.data();
		const presets = data?.presets || [];
		const updatedPresets = presets.filter((p: Preset) => p.name !== presetName);

		await graphRef.update({ presets: updatedPresets });
		res.status(200).json({ message: "Preset deleted successfully" });
	} catch (error) {
		console.error("Error deleting preset:", error);
		res.status(500).json({ error: "Error deleting preset" });
	}
}
