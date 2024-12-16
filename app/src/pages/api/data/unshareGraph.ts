/**
 * Unshare a graph with a user
 * @param req The incoming request object
 * @param res The outgoing response object
 * @returns A message indicating the success of the operation
 * @Samuel
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { dbAdmin } from "@/config/firebaseAdmin";
import { auth } from "firebase-admin";
import { User } from "@/types";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { graphId, email } = req.body;

	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	let userEmail;
	let userUid;
	try {
		const token = authHeader.split("Bearer ")[1];
		const decodedToken = await auth().verifyIdToken(token);
		userEmail = decodedToken.email;
		userUid = decodedToken.uid;
	} catch (error) {
		return res.status(401).json({ error: "Invalid token" });
	}

	if (!graphId || !email) {
		return res.status(400).json({ error: "Graph ID and email are required" });
	}

	try {
		const graphRef = dbAdmin
			.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "")
			.doc(graphId);
		const graphSnap = await graphRef.get();

		if (!graphSnap.exists) {
			return res.status(404).json({ error: "Graph not found" });
		}

		const graph = graphSnap.data();
		if (!graph) {
			return res.status(500).json({ error: "Failed to retrieve graph data" });
		}

		if (graph.owner !== userUid && !graph.sharedEmails?.includes(userEmail)) {
			return res
				.status(403)
				.json({ error: "No permission to unshare this graph" });
		}

		const sharing = graph?.sharing || [];
		const sharedEmails = graph?.sharedEmails || [];

		const updatedSharing = sharing.filter((u: User) => u.email !== email);
		const updatedEmails = sharedEmails.filter((e: string) => e !== email);

		if (updatedSharing.length === sharing.length) {
			return res.status(404).json({ error: "User not found in sharing list" });
		}

		await graphRef.update({
			sharing: updatedSharing,
			sharedEmails: updatedEmails
		});

		res.status(200).json({ message: "Graph unshared successfully" });
	} catch (error) {
		console.error("Error unsharing graph:", error);
		res.status(500).json({ error: "Error unsharing graph" });
	}
}
