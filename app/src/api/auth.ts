/**
 * Auth-related functions
 */

import { AuthenticatedUser, User } from "@/types";
import {
	GoogleAuthProvider,
	getAuth,
	getRedirectResult,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signInWithPopup
} from "firebase/auth";
import { app, auth } from "@/config/firebaseConfig";
import { createUser, getUser } from "@/api";
import { Timestamp } from "firebase/firestore";
import { apiClient } from "@/utils/apiClient";

/**
 * Create account with email and password.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise that resolves to the newly created user.
 * @Danny
 */
export const createAccountWithEmail = async (
	email: string,
	password: string,
	username: string
): Promise<User> => {
	// create user account in firebase authentication -> Store the user's details in Firestore
	try {
		const response = await apiClient("/api/auth/createAccountWithEmail", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password, username })
		});

		if (!response.ok) {
			throw new Error("Error while creating user");
		}

		const user = await response.json();

		// After creating user in authentication, create document in firestore
		await createUser(user);

		// After creating the user, log them into the app
		await loginWithEmail(email, password);

		return user;
	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
};

/**
 * Create account with Google.
 * @returns A promise that resolves to the newly created user.
 * @Danny
 */
export const loginWithGoogle = async (): Promise<User> => {
	const auth = getAuth(app);
	const provider = new GoogleAuthProvider();

	try {
		// Popup Google Sign-in Page
		const userCredentials = await signInWithPopup(auth, provider);
		const authUser = userCredentials.user;

		if (authUser) {
			try {
				const existingUser = await getUser(authUser.uid);
				return existingUser;
			} catch (error) {
				// User doesn't exist, create new one
				const user: User = {
					uid: authUser.uid,
					name: authUser.displayName || "",
					email: authUser.email || "",
					photoURL: authUser.photoURL || "",
					createdAt: Timestamp.now(),
					roles: []
				};

				await createUser(user);

				return user;
			}
		} else {
			throw new Error("Error creating account with Google");
		}
	} catch (error) {
		throw error;
	}
};

/**
 * Login with email and password.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise that resolves to the authenticated user.
 * @Samuel
 */
export const loginWithEmail = async (
	email: string,
	password: string
): Promise<AuthenticatedUser> => {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const firebaseUser = userCredential.user;

		const firestoreUser = await getUser(firebaseUser.uid);
		if (!firestoreUser) {
			throw new Error("No user document found");
		}

		return { firebaseUser, firestoreUser, loading: false };
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Handle Google redirect result.
 * @returns A promise that resolves to the authenticated user.
 * @Samuel
 */
export const handleGoogleRedirect = async (): Promise<AuthenticatedUser> => {
	try {
		const result = await getRedirectResult(auth);
		if (result) {
			const firebaseUser = result.user;

			const firestoreUser = await getUser(firebaseUser.uid);
			if (!firestoreUser) {
				throw new Error("Create account first");
			}

			return { firebaseUser, firestoreUser, loading: false };
		} else {
			throw new Error("no redirect");
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
};

/**
 * Universal logout.
 * @returns A promise that resolves when the user is logged out successfully.
 * @Samuel
 */
export const universalLogout = async (): Promise<void> => {
	try {
		await auth.signOut();
	} catch (error) {
		console.error("Error logging out user: ", error);
	}
};

/**
 * Send a password change email to the user.
 * @param email - The user's email address.
 * @returns A promise that resolves when the password reset request email is sent.
 * @Jaeyong
 */
export const sendResetPasswordEmail = async (email: string): Promise<void> => {
	try {
		await sendPasswordResetEmail(getAuth(app), email);
	} catch (error) {
		console.error("Error sending password reset email: ", error);
	}
};
