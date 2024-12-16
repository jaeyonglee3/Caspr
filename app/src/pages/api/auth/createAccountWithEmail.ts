/**
 * This API endpoint creates a new user account with email and password.
 * @param req The incoming request object.
 * @param res The outgoing response object.
 * @returns The user object.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { authAdmin } from "@/config/firebaseAdmin";
import { User } from "@/types";
import { firestore } from "firebase-admin";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.setHeader("Allow", ["POST"]);
		return res.status(405).end("Method not allowed");
	}

	const { email, password, username } = req.body;
	// Check if any field is not passed
	if (!email || !password || !username) {
		return res.status(400).json({
			error: "Email, password, or username wasn't passed and is required"
		});
	}

	try {
		// Create user in Firebase Authentication
		const userAuth = await authAdmin.createUser({
			email,
			password,
			displayName: username
		});

		// Create user object for Firestore
		const user: User = {
			uid: userAuth.uid,
			name: username,
			email: userAuth.email || "",
			photoURL: userAuth.photoURL || "",
			createdAt: firestore.Timestamp.now(),
			roles: []
		};

		res.status(200).json(user);
	} catch (error) {
		console.error("Error creating user: ", error);
		res.status(500).json({ error: "Error creating user" });
	}
}
