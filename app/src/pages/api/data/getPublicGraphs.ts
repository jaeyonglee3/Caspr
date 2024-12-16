/**
 * This API route fetches all publci graphs not owned by current user.
 * @param req The incoming request object.
 * @param res The outgoing response object.
 * @returns An array of Graph objects.
 */
import type { NextApiRequest, NextApiResponse } from "next";

import { dbAdmin } from "@/config/firebaseAdmin";
import { Graph } from "@/types";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const uid = req.body.id

	try {
		const graphsRef = dbAdmin.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "");
		let querySnapshot;

		// Query Firestore for graphs with matching owner UID
		if(uid){
			querySnapshot = await graphsRef
				.where("owner", "!=", uid)
				.where("graphVisibility", "==", true)
				.get();
		} else {
			querySnapshot = await graphsRef
				.where("graphVisibility", "==", true)
				.get();
		}

		// Transform results into an array of Graph objects
		const graphs = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			})) as Graph[];

		res.status(200).json(graphs);
	} catch (error) {
		console.error("Error fetching graphs:", error);
		res.status(500).json({ message: "Error fetching graphs" });
	}
}
