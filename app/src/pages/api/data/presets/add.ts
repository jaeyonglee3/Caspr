/**
 * This API endpoint creates a new preset for a graph.
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
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { graphId, preset } = req.body;

	if (!graphId || !preset) {
		return res.status(400).json({ error: "Graph ID and preset are required" });
	}
	
	try {
		const graphRef = dbAdmin.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "").doc(graphId);
		const graphSnap = await graphRef.get();

		if (!graphSnap.exists) {
			return res.status(404).json({ error: "Graph not found" });
		}

		const data = graphSnap.data();
		const presets = data?.presets || [];
		const existingPresetIndex = presets.findIndex((p: Preset) => p.name === preset.name);

		if (existingPresetIndex !== -1) {
			presets[existingPresetIndex] = preset;
		} else {
			presets.push(preset);
		}

		await graphRef.update({ presets });
		res.status(200).json({ message: "Preset added successfully" });
	} catch (error) {
		console.error("Error adding preset:", error);
		res.status(500).json({ error: "Error adding preset" });
	}
}