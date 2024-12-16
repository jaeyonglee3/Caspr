/**
 * Get the graph JSON from storage
 * @param req The incoming request object
 * @param res The outgoing response object
 * @returns A message indicating the success of the operation
 * @Samuel
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { dbAdmin } from "@/config/firebaseAdmin";
import { auth } from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const graphId = req.query.id;

	if (!graphId || typeof graphId !== "string") {
		return res.status(400).json({ error: "Missing or invalid graph ID" });
	}

	const authHeader = req.headers.authorization;
	let userUid = null;
	let userEmail = null;

	if (authHeader && authHeader.startsWith("Bearer ")) {
		const idToken = authHeader.split("Bearer ")[1];
		try {
			const decodedToken = await auth().verifyIdToken(idToken);
			userUid = decodedToken.uid;
			userEmail = decodedToken.email;
		} catch (error) {
			console.error("Error verifying ID token:", error);
		}
	}

	try {
		const graphRef = dbAdmin
			.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "")
			.doc(graphId);

		const graphDoc = await graphRef.get();

		if (!graphDoc.exists) {
			return res.status(404).json({ error: "Graph not found" });
		}

		const graphData = graphDoc.data();
		if (!graphData) {
			console.error("Failed to retrieve graph data");
			return res.status(500).json({ error: "Failed to retrieve graph data" });
		}

		const canRead =
			graphData.graphVisibility === true ||
			(userUid && graphData.owner === userUid) ||
			(userEmail && graphData.sharedEmails.includes(userEmail));

		if (!canRead) {
			return res.status(403).json({ error: "Unauthorized: Insufficient permissions to read this graph" });
		}

		const storage = getStorage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
		const graphFile = storage.file(graphData.graphFilePath);

		const [fileExists] = await graphFile.exists();
		if (!fileExists) {
			return res.status(404).json({ error: "Graph file not found in storage" });
		}

		const [fileContent] = await graphFile.download();
		const graphJSON = JSON.parse(fileContent.toString());

		res.status(200).json(graphJSON);
	} catch (error) {
		console.error("Error fetching graph data:", error);
		res.status(500).json({ error: "Error fetching graph data" });
	}
}