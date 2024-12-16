import { Graph } from "@/types";
import { getUser } from "@/api/firestore";

/**
 * Maps all graph owners' names with their respective graph given an array of graphs
 *
 * @param graphs - The array of Graph objects to fetch owner data for
 * @returns An array of Graph objects with a string representation of the graph owner's name
 */
export const fetchOwnerData = async (
	graphs: Graph[]
): Promise<[Graph, string][]> => {
	if (graphs && graphs.length > 0) {
		const graphsWithUsers = await Promise.all(
			graphs.map(async (graph) => {
				const user = await getUser(graph.owner);
				return [graph, user.name] as [Graph, string];
			})
		);
		return graphsWithUsers;
	}
	return [];
};

/**
 * Applies search filtering to a given list of graphs
 *
 * @param searchValue - The current string value in the search bar
 * @param originalGraphs - The array of graphs before any search filtering is applied to it
 * @returns An array of filtered Graph objects based on the searchValue
 */
export const handleSearch = (
	searchValue: string,
	originalGraphs: [Graph, string][]
): Graph[] => {
	const value = searchValue.toLowerCase();

	if (value.length > 0) {
		const filteredResults = originalGraphs.filter(
			(item) =>
				item[0]?.graphName.toLowerCase().includes(value) || // item[0] is the graph object and item[1] is the owner as a string
				item[0]?.graphDescription.toLowerCase().includes(value) ||
				item[1]?.toLowerCase().includes(value) ||
				item[0]?.graphTags.some((tag) => tag.toLowerCase().includes(value))
		);

		// Prioritize results by name, then description, then author
		const prioritizedResults = filteredResults.sort((a, b) => {
			const aNameMatch = a[0].graphName.toLowerCase().includes(value) ? 1 : 0;
			const bNameMatch = b[0].graphName.toLowerCase().includes(value) ? 1 : 0;
			const aDescriptionMatch = a[0].graphDescription
				.toLowerCase()
				.includes(value)
				? 1
				: 0;
			const bDescriptionMatch = b[0].graphDescription
				.toLowerCase()
				.includes(value)
				? 1
				: 0;
			const aAuthorMatch = a[1].toLowerCase().includes(value) ? 1 : 0;
			const bAuthorMatch = b[1].toLowerCase().includes(value) ? 1 : 0;
			const aTagMatch = a[0]?.graphTags.some((tag) =>
				tag.toLowerCase().includes(value)
			)
				? 1
				: 0;
			const bTagMatch = b[0]?.graphTags.some((tag) =>
				tag.toLowerCase().includes(value)
			)
				? 1
				: 0;

			return (
				bNameMatch - aNameMatch ||
				bDescriptionMatch - aDescriptionMatch ||
				bAuthorMatch - aAuthorMatch ||
				bTagMatch - aTagMatch
			);
		});

		return prioritizedResults.map((item) => item[0]);
	} else {
		return originalGraphs.map((item) => item[0]);
	}
};
