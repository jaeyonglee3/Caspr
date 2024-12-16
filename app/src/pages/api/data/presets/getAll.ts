/**
 * This API route fetches all graphs presets for a given graph.
 * @param req The incoming request object.
 * @param res The outgoing response object.
 * @returns An array of Graph objects.
 */
import type { NextApiRequest, NextApiResponse } from "next";

import { dbAdmin } from "@/config/firebaseAdmin";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { graphId } = req.query;

	if (!graphId) {
		return res.status(400).json({ error: "Graph ID is required" });
	}

	try {
		const graphRef = dbAdmin.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "").doc(graphId as string);
		const graphSnap = await graphRef.get();

		if (!graphSnap.exists) {
			return res.status(404).json({ error: "Graph not found" });
		}

		const data = graphSnap.data();
		res.status(200).json({ presets: data?.presets || null });
	} catch (error) {
		console.error("Error getting presets:", error);
		res.status(500).json({ error: "Error getting presets" });
	}
}
