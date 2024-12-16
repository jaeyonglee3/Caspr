/**
 * This API endpoint is used to create a new user in Firestore.
 * @param req The incoming request object.
 * @param res The outgoing response object.
 * @returns A message indicating the success of the operation.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { dbAdmin } from "@/config/firebaseAdmin";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		return res.status(405).end("Method not allowed");
	}

	const { user } = req.body;

	try {
		// Store user in Firestore
		const userDocumentRef = dbAdmin
			.collection(process.env.NEXT_FIREBASE_USER_COLLECTION || "")
			.doc(user.uid);
		
		await userDocumentRef.set(user);

		res.status(200).json({ message: "Successfully created user" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error creating user" });
	}
}
