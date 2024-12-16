import { Timestamp as ClientTimestamp } from "firebase/firestore";
import { Timestamp as AdminTimestamp } from "firebase-admin/firestore";

/**
 * Formats a given date into a locale date string.
 *
 * @param createdAt - The date argument which can be of type ClientTimestamp, AdminTimestamp, Date, or number.
 * @returns The formatted date string or 'Date unavailable' if the date is invalid.
 */
const formatDate = (
	createdAt: ClientTimestamp | AdminTimestamp | any
): string => {
	try {
		if (createdAt && "seconds" in createdAt && "nanoseconds" in createdAt) {
			return new Date(createdAt.seconds * 1000).toLocaleDateString();
		}

		if (createdAt?.toDate) {
			return createdAt.toDate().toLocaleDateString();
		}

		if (createdAt instanceof Date) {
			return createdAt.toLocaleDateString();
		}

		if (typeof createdAt === "number") {
			return new Date(createdAt).toLocaleDateString();
		}

		return "Date unavailable";
	} catch (error) {
		return "Date unavailable";
	}
};

export default formatDate;
