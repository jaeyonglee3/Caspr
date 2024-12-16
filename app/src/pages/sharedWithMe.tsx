import { FullScreenLoader, GraphList, Searchbar, Sidebar } from "@/components";
/**
 * Shared With Me Page
 * @returns {ReactElement} Shared With Me Page
 */
import { Heading, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { Graph } from "@/types";
import { getSharedGraphs } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

function SharedWithMe() {
	const { firebaseUser, loading } = useAuth();
	const router = useRouter();
	const [graphs, setGraphs] = useState<Graph[] | undefined>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [sortType, setSortType] = useState("none");
	const [filterType, setFilterType] = useState("none");
	const [search, setSearch] = useState("");

	const fetchUsersSharedGraphs = useCallback(async () => {
		if (!firebaseUser?.email) return;

		try {
			setIsLoading(true);
			const sharedGraphs = await getSharedGraphs(
				firebaseUser.email,
				sortType,
				filterType
			);
			setGraphs(sharedGraphs);
		} catch (error) {
			console.error("Error fetching shared graphs:", error);
			setGraphs([]);
		} finally {
			setIsLoading(false);
		}
	}, [firebaseUser?.email, sortType, filterType]);

	useEffect(() => {
		fetchUsersSharedGraphs();
	}, [fetchUsersSharedGraphs]);

	if (loading) {
		return <FullScreenLoader />;
	}

	if (!firebaseUser) {
		router.push("/");
		return null;
	}

	const sortOptions = [
		{ value: "none", label: "Sort: None" },
		{ value: "nameAsc", label: "Sort: Name (A - Z)" },
		{ value: "nameDesc", label: "Sort: Name (Z - A)" },
		{ value: "uploadDateDesc", label: "Sort: Newest First" },
		{ value: "uploadDateAsc", label: "Sort: Oldest First" }
	];

	const filterOptions = [
		{ value: "none", label: "Filter: None" },
		{ value: "publicOnly", label: "Filter: Public Only" },
		{ value: "privateOnly", label: "Filter: Private Only" }
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
							filterType={filterType}
						/>
						<Heading>Welcome, {firebaseUser?.displayName || "User"}</Heading>
						<Text>Email: {firebaseUser.email}</Text>
					</div>
				</div>

				<GraphList
					isLoading={isLoading}
					graphs={graphs}
					page="Shared With Me"
					sortOptions={sortOptions}
					filterOptions={filterOptions}
					sortType={sortType}
					setSortType={setSortType}
					filterType={filterType}
					setFilterType={setFilterType}
					search={search}
				/>
			</div>
		</div>
	);
}

export default SharedWithMe;
