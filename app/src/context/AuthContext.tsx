/**
 * This context provides the authenticated user and loading state.
 * It fetches the Firestore user document when the Firebase user is authenticated.
 * @param children The children components to render.
 * @returns The AuthContext provider.
 */
import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode
} from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { AuthenticatedUser, User } from "@/types";
import { getUser } from "@/api";

export const AuthContext = createContext<AuthenticatedUser>({
	firebaseUser: null,
	firestoreUser: null,
	loading: true
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
	const [firestoreUser, setFirestoreUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setFirebaseUser(user); // incase of logout, it sets to null
			if (user) {
				try {
					const firestoreUser = await getUser(user.uid);
					setFirestoreUser(firestoreUser);
				} catch (error) {
					console.error("Error fetching Firestore user:", error);
				}
			} else {
				setFirestoreUser(null);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ firebaseUser, firestoreUser, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
