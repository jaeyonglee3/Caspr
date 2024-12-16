/**
 * Update a graph document in Firestore
 * @param req The incoming request object
 * @param res The outgoing response object
 * @returns A message indicating the success of the operation
 * @Samuel
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { dbAdmin } from "@/config/firebaseAdmin";
import { auth } from "firebase-admin";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "PATCH") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const id = req.body.id;
	const updates = req.body.updates;

	if (!id || typeof id !== "string") {
		return res.status(400).json({ error: "Invalid or Missing Graph ID" });
	}

	if (!updates) {
		return res.status(400).json({ error: "Invalid or Missing Update Data" });
	}

	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res
			.status(401)
			.json({ error: "Missing or invalid Authorization header" });
	}

	const idToken = authHeader.split("Bearer ")[1];

	try {
		const decodedToken = await auth().verifyIdToken(idToken);
		const userUid = decodedToken.uid;
		const userEmail = decodedToken.email;

		// Query Firestore for graphs with matching owner UID
		const graphRef = dbAdmin
			.collection(process.env.NEXT_FIREBASE_GRAPH_COLLECTION || "")
			.doc(id);

		const graphDoc = await graphRef.get();
		if (!graphDoc.exists) {
			return res.status(404).json({ error: "Graph not found" });
		}

		const graphData = graphDoc.data();
		if (!graphData) {
			return res.status(500).json({ error: "Failed to retrieve graph data" });
		}

		// Enforce ownership and shared user rules
		const isOwner = graphData.owner === userUid;
		if (!isOwner && !graphData.sharedEmails?.includes(userEmail)) {
			return res
				.status(403)
				.json({ error: "Unauthorized: Insufficient permissions" });
		}

		// Enforce field restrictions
		const restrictedFieldsForOwners = [
			"createdAt",
			"id",
			"graphFileURL",
			"graphFilePath",
			"graphURL"
		];
		const restrictedFieldsForSharedUsers = [
			...restrictedFieldsForOwners,
			"graphVisibility",
			"graphName",
			"graphDescription",
			"owner"
		];

		const restrictedFields = isOwner
			? restrictedFieldsForOwners
			: restrictedFieldsForSharedUsers;

		const invalidFields = Object.keys(updates).filter((field) =>
			restrictedFields.includes(field)
		);

		if (invalidFields.length > 0) {
			return res.status(400).json({
				error: `Update contains restricted fields: ${invalidFields.join(", ")}`
			});
		}

		// Update the graph
		await graphRef.update(updates);
		res.status(200).json({ updatedGraph: id });
	} catch (error) {
		console.error(`Error updating graph ${id}:`, error);
		res.status(500).json({ message: "Error fetching graphs" });
	}
}
