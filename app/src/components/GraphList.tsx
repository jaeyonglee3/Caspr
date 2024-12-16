/**
 * Graph list component
 * @param {Array} graphs - List of graphs
 * @param {string} page - Page title
 * @returns {ReactElement} Graph list component
 */
import {
	Box,
	Button,
	Divider,
	Heading,
	Select,
	Text,
	Tooltip
} from "@chakra-ui/react";
import { Graph, GraphListProps } from "@/types/graph";
import { useEffect, useState } from "react";

import ExploreGraphCard from "./ExploreGraphCard";
import { FullScreenLoader } from "@/components";
import MyGraphCard from "./MyGraphCard";
import { User } from "@/types";
import { getUser } from "@/api";
import { useAuth } from "@/context";

const GraphList = ({
	isLoading,
	graphs,
	page,
	sortOptions,
	filterOptions,
	sortType,
	setSortType,
	filterType,
	setFilterType,
	search
}: GraphListProps) => {
	const { firestoreUser } = useAuth();

	const [isOwnersLoading, setIsOwnersLoading] = useState(true);
	const [graphsWithOwners, setGraphsWithOwners] = useState<
		Array<{
			graph: Graph;
			owner: User | null;
		}>
	>([]);

	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	useEffect(() => {
		const fetchOwners = async () => {
			if (!graphs) return;

			setIsOwnersLoading(true);
			const withOwners = await Promise.all(
				graphs.map(async (graph) => {
					try {
						if (graph.owner == firestoreUser?.uid) {
							return { graph, owner: firestoreUser };
						}
						const owner = await getUser(graph.owner);
						return { graph, owner };
					} catch (error) {
						console.error(error);
						return { graph, owner: null };
					}
				})
			);

			setGraphsWithOwners(withOwners);
			setIsOwnersLoading(false);
		};

		fetchOwners();
	}, [firestoreUser, graphs]);

	if (isLoading || isOwnersLoading) {
		return <FullScreenLoader />;
	}

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentGraphs = graphsWithOwners.slice(
		indexOfFirstItem,
		indexOfLastItem
	);

	const totalPages = Math.ceil(graphsWithOwners.length / itemsPerPage);

	return (
		<div className="mt-8">
			<div className="flex flex-row">
				<Heading size="md" mb={4}>
					{page}
				</Heading>

				<div className="ml-auto flex flex-row gap-2">
					{setSortType && sortOptions && (
						<Tooltip
							label="Sorting and filtering cannot be applied while using the search bar"
							aria-label="A tooltip"
							isDisabled={search.length === 0}
						>
							<Select
								placeholder={
									sortOptions.find((option) => option.value === sortType)
										?.label || "Apply Sort"
								}
								size="sm"
								onChange={(e) => {
									setSortType(e.target.value);
								}}
								className="!min-w-[125px] !rounded-md"
								variant="filled"
								isDisabled={search.length > 0}
							>
								{sortOptions
									.filter((option) => option.value !== sortType)
									.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
							</Select>
						</Tooltip>
					)}
					{setFilterType && filterOptions && (
						<Tooltip
							label="Sorting and filtering cannot be applied while using the search bar"
							aria-label="A tooltip"
							isDisabled={search.length === 0}
						>
							<Select
								placeholder={
									filterOptions.find((option) => option.value === filterType)
										?.label || "Apply filter"
								}
								size="sm"
								onChange={(e) => {
									setFilterType(e.target.value);
								}}
								className="!min-w-[125px] !rounded-md"
								variant="filled"
								isDisabled={search.length > 0}
							>
								{filterOptions
									.filter((option) => option.value !== filterType)
									.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
							</Select>
						</Tooltip>
					)}
				</div>
			</div>

			<Divider className="mb-4" />

			{currentGraphs.length === 0 ? (
				<div className="flex flex-col gap-4 items-center justify-center h-full">
					<Text fontSize="xl">No graphs to show!</Text>
				</div>
			) : page === "Explore" ? (
				<div className="flex flex-col gap-4">
					{currentGraphs.map(({ graph, owner }, i) => (
						<ExploreGraphCard key={graph.id || i} graph={graph} owner={owner} />
					))}
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{currentGraphs?.map(({ graph, owner }, i) => {
						return (
							<MyGraphCard key={graph.id || i} graph={graph} owner={owner} />
						);
					})}
				</div>
			)}

			{currentGraphs.length !== 0 && (
				<div className="flex justify-center items-center w-full">
					<div className="flex justify-center items-center mt-4 gap-4">
						<Button
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
						>
							Previous
						</Button>
						<Text mx={4}>
							Page {currentPage} of {totalPages}
						</Text>
						<Button
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
						>
							Next
						</Button>
						Show:
						<Box w="90px">
							<Select
								size="sm"
								onChange={(e) => {
									setItemsPerPage(Number(e.target.value));
									setCurrentPage(1);
								}}
								className="!rounded-md"
								variant="filled"
							>
								<option value="" disabled>
									Items per page
								</option>
								<option value={10}>10</option>
								<option value={25}>25</option>
								<option value={50}>50</option>
							</Select>
						</Box>
						entries
					</div>
				</div>
			)}
		</div>
	);
};

export default GraphList;
