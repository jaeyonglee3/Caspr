/**
 * This API route fetches all graphs owned by a user with a given UID.
 * @param req The incoming request object.
 * @param res The outgoing response object.
 * @returns An array of Graph objects.
 */
import type { NextApiRequest, NextApiResponse } from "next";

import { Graph } from "@/types";
import { dbAdmin } from "@/config/firebaseAdmin";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { uid, filterType } = req.query;

	if (!uid || typeof uid !== "string") {
		return res.status(400).json({ message: "Invalid UID" });
	}

	try {
		// Query Firestore for graphs with matching owner UID

		const graphsRef = dbAdmin.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "");
		let querySnapshot;
		if (filterType === "publicOnly") {
			querySnapshot = await graphsRef
				.where("owner", "==", uid)
				.where("graphVisibility", "==", true)
				.get();
		} else if (filterType === "privateOnly") {
			querySnapshot = await graphsRef
				.where("owner", "==", uid)
				.where("graphVisibility", "==", false)
				.get();
		} else {
			querySnapshot = await graphsRef.where("owner", "==", uid).get();
		}

		// Transform results into an array of Graph objects
		const graphs: Graph[] = [];
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			graphs.push({
				id: doc.id,
				owner: data.owner,
				graphName: data.graphName,
				graphDescription: data.graphDescription,
				graphTags: data.graphTags,
				graphVisibility: data.graphVisibility,
				graphFileURL: data.graphFileURL,
				graphFilePath: data.graphFilePath,
				graphURL: data.graphURL,
				createdAt: data.createdAt,
				sharing: data.sharing,
				sharedEmails: data.sharedEmails,
				presets: data.presets || []
			});
		});

		res.status(200).json(graphs);
	} catch (error) {
		console.error("Error fetching graphs:", error);
		res.status(500).json({ message: "Error fetching graphs" });
	}
}
