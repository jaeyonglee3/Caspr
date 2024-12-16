/**
 * This API route fetches a preset for a given graph.
 * @param req The incoming request object.
 * @param res The outgoing response object.
 * @returns An array of Graph objects.
 */
import type { NextApiRequest, NextApiResponse } from "next";

import { dbAdmin } from "@/config/firebaseAdmin";
import { Preset } from "@/types";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { graphId, presetName } = req.query;

	if (!graphId || !presetName) {
		return res.status(400).json({ error: "Graph ID and preset name are required" });
	}

	try {
		const graphRef = dbAdmin.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "").doc(graphId as string);
		const graphSnap = await graphRef.get();

		if (!graphSnap.exists) {
			return res.status(404).json({ error: "Graph not found" });
		}

		const data = graphSnap.data();
		const presets = data?.presets || [];
		const preset = presets.find((p: Preset) => p.name === presetName);

		res.status(200).json({ preset: preset || null });
	} catch (error) {
		console.error("Error getting preset:", error);
		res.status(500).json({ error: "Error getting preset" });
	}
}