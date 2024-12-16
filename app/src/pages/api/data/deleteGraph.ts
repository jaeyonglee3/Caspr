/**
 * This API route fetches all graphs owned by a user with a given UID.
 * @param req The incoming request object.
 * @param res The outgoing response object.
 * @returns 200 when graph is successfully deleted
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { dbAdmin } from "@/config/firebaseAdmin";
import { auth } from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "DELETE") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { graphID, graphFilePath } = req.body;

	if (!graphID || typeof graphID !== "string") {
		return res.status(400).json({ message: "Invalid graph ID" });
	}

	if (!graphFilePath || typeof graphFilePath !== "string") {
		return res.status(400).json({ message: "Invalid graph URL" });
	}

	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	let userUid;
	try {
		const token = authHeader.split("Bearer ")[1];
		const decodedToken = await auth().verifyIdToken(token);
		userUid = decodedToken.uid;
	} catch (error) {
		return res.status(401).json({ error: "Invalid token" });
	}

	try {
		const graphRef = dbAdmin
			.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "")
			.doc(graphID);
		const graphSnap = await graphRef.get();

		if (!graphSnap.exists) {
			return res.status(404).json({ error: "Graph not found" });
		}

		const graph = graphSnap.data();
		if (!graph) {
			return res.status(500).json({ error: "Failed to retrieve graph data" });
		}

		// Check if user is the owner
		if (graph.owner !== userUid) {
			return res
				.status(403)
				.json({ error: "No permission to delete this graph" });
		}

		// Remove Graph File
		const bucket = getStorage().bucket(
			process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
		);
		await bucket.file(graphFilePath).delete();

		// Remove Graph File Metadata
		await graphRef.delete();

		res.status(200).json({ message: "Graph Deleted Successfully" });
	} catch (error) {
		console.error("Error deleting graph:", error);
		res.status(500).json({ message: "Error deleting graph" });
	}
}
