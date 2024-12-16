/**
 * Sorts a given array of graphData based on the given sortType
 *
 * @param graphData - The array of Graph objects to sort
 * @param sortType - The sorting type in which to sort the graph array
 * @returns The formatted date string or 'Date unavailable' if the date is invalid.
 */

import { Graph } from "@/types/graph";

export const sortGraphs = (graphData: Graph[], sortType: string) => {
	switch (sortType) {
		case "nameAsc":
			graphData.sort((a: Graph, b: Graph) =>
				a.graphName.localeCompare(b.graphName)
			);
			break;
		case "nameDesc":
			graphData.sort((a: Graph, b: Graph) =>
				b.graphName.localeCompare(a.graphName)
			);
			break;
		case "uploadDateDesc":
			graphData.sort((a: Graph, b: Graph) => {
				const aMillis =
					a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000;
				const bMillis =
					b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000;
				return bMillis - aMillis;
			});
			break;
		case "uploadDateAsc":
			graphData.sort((a: Graph, b: Graph) => {
				const aMillis =
					a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000;
				const bMillis =
					b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000;
				return aMillis - bMillis;
			});
			break;
		default:
			break;
	}
};
