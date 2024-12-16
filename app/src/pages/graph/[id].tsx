import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
	Tabs,
	TabPanels,
	TabPanel,
	Box,
	useToast,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	Flex,
	Input
} from "@chakra-ui/react";
import { GraphSideBar, GraphNavbar, FullScreenLoader } from "@/components";
import CausalDiagram from "@/components/graphVisualization/CausalDiagram";
import { NodeType, Graph } from "@/types";
import {
	fetchAllPublicGraphs,
	fetchAllUserAccessibleGraphs,
	getGraphData
} from "@/api";
import { useAuth } from "@/context/AuthContext";
import { ViewProvider, useView } from "@/context/ViewContext";

interface Diagram {
	id: number;
	timestamp?: number;
	data: any;
	label: string;
}

const GraphPageContent = () => {
	const router = useRouter();
	const { id } = router.query;
	const [diagrams, setDiagrams] = useState<Diagram[]>([]);
	const [selectedTab, setSelectedTab] = useState(0);
	const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const { firebaseUser } = useAuth();
	const { graph, setGraph } = useView();
	const toast = useToast();

	const [selectedTimestamp, setSelectedTimestamp] = useState<number>(0);
	const [timestamps, setTimestamps] = useState<number[]>([]);
	const [isEditing, setIsEditing] = useState<boolean>(false);

	const handleNodeSelect = (node: NodeType | null) => {
		setSelectedNode(node);
	};

	const validateJsonData = (data: any) => {
		if (data.timestamps && Array.isArray(data.timestamps)) {
			return data.timestamps.every((timestamp: any) => {
				return (
					typeof timestamp.t === "number" &&
					Array.isArray(timestamp.nodes) &&
					Array.isArray(timestamp.edges)
				);
			});
		}
		return data && Array.isArray(data.nodes) && Array.isArray(data.edges);
	};

	const parseTimestampedData = (data: any, timestamp: number) => {
		const timestampData = data.timestamps.find((t: any) => t.t === timestamp);
		if (!timestampData) {
			throw new Error(`No data found for timestamp ${timestamp}`);
		}
		return {
			nodes: timestampData.nodes,
			edges: timestampData.edges
		};
	};

	useEffect(() => {
		const fetchGraphData = async () => {
			if (!id) return;

			const urlParams = new URLSearchParams(window.location.search);
			const authParam = urlParams.get("auth");

			try {

				if (authParam && !firebaseUser) {
					// Wait for `firebaseUser` to be populated
					return;
				}
				
				const tempGraphs = firebaseUser
					? await fetchAllUserAccessibleGraphs(firebaseUser)
					: await fetchAllPublicGraphs(null);
				const graph = tempGraphs.find((g: Graph) => {
					if (!g.graphURL) return false;
					const urlParts = g.graphURL.split("/");
					const graphId = urlParts[urlParts.indexOf("graph") + 1];
					return graphId === id;
				});

				if (graph) {
					const jsonData = await getGraphData(graph);
					if (!validateJsonData(jsonData)) {
						router.push("/");
						toast({
							title: "Error",
							description: "Invalid graph data",
							status: "error",
							duration: 5000,
							isClosable: true
						});
						return;
					}

					if (jsonData.timestamps) {
						// Handle timestamped data
						const initialTimestamp = jsonData.timestamps[0].t;

						setDiagrams([
							{
								id: 0,
								timestamp: initialTimestamp,
								data: jsonData,
								label: `${graph.graphName} ${initialTimestamp}`
							}
						]);

						const uniqueTimestamps: number[] = Array.from(
							new Set(
								(jsonData.timestamps as { t: number }[]).map(
									(timestamp) => timestamp.t
								)
							)
						).sort((a, b) => a - b);
						setTimestamps(uniqueTimestamps);
						setSelectedTimestamp(initialTimestamp);
					} else {
						// Handle non-timestamped data
						setDiagrams([
							{
								id: 0,
								data: jsonData,
								label: graph.graphName
							}
						]);
					}

					setGraph(graph);
				} else {
					router.push("/");
				}
			} catch (error) {
				console.error("Error fetching graph data:", error);
				toast({
					title: "Error",
					description: "Failed to fetch graph data",
					status: "error",
					duration: null,
					isClosable: true
				});
				router.push("/");
			} finally {
				setLoading(false);
			}
		};

		fetchGraphData();
	}, [firebaseUser, id, router, toast]);

	const addDiagram = () => {
		const newId = diagrams.length ? diagrams[diagrams.length - 1].id + 1 : 0;
		let newTimestamp;
		let newData;

		if (diagrams[0].timestamp) {
			newTimestamp = diagrams[diagrams.length - 1].timestamp! + 1;
			newData = diagrams[0].data;
		} else {
			newData = diagrams[0].data;
		}

		const newDiagram = {
			id: newId,
			...(newTimestamp ? { timestamp: newTimestamp } : {}),
			data: newData,
			label: `${graph?.graphName} ${newTimestamp || newId + 1}`
		};
		setDiagrams([...diagrams, newDiagram]);
	};

	const removeDiagram = (id: number) => {
		if (diagrams.length > 1) {
			setDiagrams(diagrams.filter((diagram) => diagram.id !== id));
			if (selectedTab >= diagrams.length - 1) {
				setSelectedTab(diagrams.length - 2);
			}
		}
	};

	if (loading) {
		return <FullScreenLoader />;
	}

	// Filter nodes and edges based on the selected timestamp
	const filteredData = diagrams[0]?.timestamp
		? parseTimestampedData(diagrams[0].data, selectedTimestamp)
		: diagrams[0]?.data;

	return (
		<Box height="100vh" display="flex" flexDirection="column">
			<GraphNavbar
				diagrams={diagrams}
				selectedTab={selectedTab}
				setSelectedTab={setSelectedTab}
				addDiagram={addDiagram}
				removeDiagram={removeDiagram}
				graph={graph}
			/>
			<Box display="flex" flex="1">
				<Box flex="1" padding={1}>
					{timestamps.length > 0 && (
						<Flex alignItems="center" ml={4} mr={4}>
							Timestamp:
							<Input
								type="number"
								value={isEditing ? undefined : selectedTimestamp}
								onChange={(e) => setIsEditing(true)}
								onBlur={(e) => {
									const val = parseInt(
										(e.target as HTMLInputElement).value,
										10
									);
									if (!isNaN(val) && timestamps.includes(val)) {
										setSelectedTimestamp(val);
									}
									setIsEditing(false);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										const val = parseInt(
											(e.target as HTMLInputElement).value,
											10
										);
										if (!isNaN(val) && timestamps.includes(val)) {
											setSelectedTimestamp(val);
										}
										setIsEditing(false);
									}
								}}
								width="60px"
								height="35px"
								mr={4}
								ml={4}
							/>
							<Slider
								value={selectedTimestamp}
								min={Math.min(...timestamps)}
								max={Math.max(...timestamps)}
								step={1}
								onChange={(val) => setSelectedTimestamp(val)}
							>
								<SliderTrack>
									<SliderFilledTrack />
								</SliderTrack>
								<SliderThumb />
							</Slider>
						</Flex>
					)}
					<Tabs index={selectedTab} onChange={(index) => setSelectedTab(index)}>
						<TabPanels>
							{diagrams.map((diagram) => (
								<TabPanel key={diagram.id}>
									<CausalDiagram
										nodes={filteredData?.nodes || []}
										edges={filteredData?.edges || []}
										selectedNode={selectedNode}
									/>
								</TabPanel>
							))}
						</TabPanels>
					</Tabs>
				</Box>
				<Box width="350px">
					<GraphSideBar
						onNodeSelect={handleNodeSelect}
						nodes={filteredData?.nodes || []}
						edges={filteredData?.edges || []}
					/>
				</Box>
			</Box>
		</Box>
	);
};

// Wrapper component that provides the context
const GraphPage = () => {
	return (
		<ViewProvider>
			<GraphPageContent />
		</ViewProvider>
	);
};

export default GraphPage;
