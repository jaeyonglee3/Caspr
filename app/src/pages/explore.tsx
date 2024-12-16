import { FullScreenLoader, GraphList, Searchbar, Sidebar } from "@/components";
/**
 * Explore Page
 * @returns {ReactElement} Explore Page
 */
import { Heading, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { Graph } from "@/types";
import { fetchAllPublicGraphs } from "@/api";
import { useAuth } from "@/context/AuthContext";

function Explore() {
	const { firebaseUser, loading } = useAuth();
	const [graphs, setGraphs] = useState<Graph[] | undefined>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [sortType, setSortType] = useState("none");
	const [search, setSearch] = useState("");

	const fetchExplorePageGraphs = useCallback(async () => {
		try {
			setIsLoading(true);
			const publicGraphs = await fetchAllPublicGraphs(firebaseUser, sortType);
			setGraphs(publicGraphs);
		} catch (error) {
			console.error("Error fetching graphs:", error);
		} finally {
			setIsLoading(false);
		}
	}, [firebaseUser, sortType]);

	useEffect(() => {
		fetchExplorePageGraphs();
	}, [fetchExplorePageGraphs]);

	if (loading) {
		return <FullScreenLoader />;
	}

	const sortOptions = [
		{ value: "none", label: "Sort: None" },
		{ value: "nameAsc", label: "Sort: Name (A - Z)" },
		{ value: "nameDesc", label: "Sort: Name (Z - A)" }
	];

	return (
		<div className="flex flex-row">
			<div className="sticky top-0 h-screen">
				<Sidebar />
			</div>

			<div className="p-8 flex flex-col w-full overflow-y-auto">
				<div className="flex flex-row w-full">
					<div className="flex flex-col gap-2 w-full">
						<Searchbar
							search={search}
							setSearch={setSearch}
							graphs={graphs}
							setGraphs={setGraphs}
							sortType={sortType}
							filterType={"none"}
						/>
						{firebaseUser && (
							<>
								<Heading>
									Welcome, {firebaseUser?.displayName || "User"}
								</Heading>
								<Text>Email: {firebaseUser.email}</Text>
							</>
						)}
						{!firebaseUser && (
							<>
								<Heading>Welcome, Guest</Heading>
							</>
						)}
					</div>
				</div>

				<GraphList
					isLoading={isLoading}
					graphs={graphs}
					page="Explore"
					sortOptions={sortOptions}
					sortType={sortType}
					setSortType={setSortType}
					search={search}
				/>
			</div>
		</div>
	);
}

export default Explore;
