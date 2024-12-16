/**
 * Get shared graphs by email
 * @param req The incoming request object
 * @param res The outgoing response object
 * @returns An array of shared graphs
 * @Samuel
 */
import type { NextApiRequest, NextApiResponse } from "next";

import { dbAdmin } from "@/config/firebaseAdmin";
import { Graph } from "@/types";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { email, filterType } = req.query;

	if (!email) {
		return res.status(400).json({ error: "Email is required" });
	}

	try {
		let graphsSnap;

		if (filterType === "publicOnly") {
			graphsSnap = await dbAdmin
				.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "")
				.where("sharedEmails", "array-contains", email)
				.where("graphVisibility", "==", true)
				.get();
		} else if (filterType === "privateOnly") {
			graphsSnap = await dbAdmin
				.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "")
				.where("sharedEmails", "array-contains", email)
				.where("graphVisibility", "==", false)
				.get();
		} else {
			graphsSnap = await dbAdmin
				.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "")
				.where("sharedEmails", "array-contains", email)
				.get();
		}

		const graphs = graphsSnap.docs.map((doc) => {
			const data = doc.data();
			const graph = {
				id: doc.id,
				...data
			} as Graph;

			// if graph is not public, filter presets based on access
			if (!graph.graphVisibility) {
				const sharedUser = graph.sharing?.find((user) => user.email === email);

				if (sharedUser && graph.presets) {
					// only include presets that are in presetAccess
					graph.presets = graph.presets.filter((preset) =>
						sharedUser.presetAccess.includes(preset.name)
					);
				} else {
					graph.presets = [];
				}
			}

			return graph;
		});

		res.status(200).json({ graphs });
	} catch (error) {
		console.error("Error getting shared graphs:", error);
		res.status(500).json({ error: "Error getting shared graphs" });
	}
}
