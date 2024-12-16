/**
 * GraphSideBar.tsx
 * @param {GraphSideBarProps} props
 * @returns {ReactElement} GraphSideBar component
 */
import React, { useState, useEffect } from "react";
import {
	Box,
	Input,
	Flex,
	List,
	ListItem,
	Text,
	Tabs,
	TabList,
	TabPanels,
	TabPanel,
	Tab,
	Button,
	VStack,
	useDisclosure,
	useToast
} from "@chakra-ui/react";
import { NodeType, EdgeType, Preset } from "@/types";
import { useView } from "@/context/ViewContext";
import { addPreset, deletePreset } from "@/api";
import { Timestamp } from "firebase/firestore";
import { SavePresetModal, PresetList } from "@/components";
import { useAuth } from "@/context";

interface GraphSideBarProps {
	nodes: NodeType[];
	edges: EdgeType[];
	onNodeSelect: (node: NodeType | null) => void;
}

const GraphSideBar: React.FC<GraphSideBarProps> = ({
	nodes,
	edges,
	onNodeSelect
}) => {
	const [sortedNodes, setSortedNodes] = useState<NodeType[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [presetName, setPresetName] = useState("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { firestoreUser } = useAuth();
	const {
		graph,
		currentView,
		loadPreset,
		activePreset,
		addPresetToGraph,
		deletePresetFromGraph
	} = useView();
	const toast = useToast();

	useEffect(() => {
		const sorted = [...nodes].sort((a, b) => a.label.localeCompare(b.label));
		setSortedNodes(sorted);
	}, [nodes]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value);
	};

	const handleNodeClick = (node: NodeType) => {
		if (selectedNodeId === node.id) {
			setSelectedNodeId(null);
			onNodeSelect(null);
		} else {
			setSelectedNodeId(node.id);
			onNodeSelect(node);
		}
	};

	const handlePresetClick = (preset: Preset) => {
		loadPreset(preset);
		toast({
			title: "Preset Loaded",
			description: `Loaded preset: ${preset.name}`,
			status: "info",
			duration: 2000
		});
	};

	const handleSavePreset = async () => {
		try {
			if (!presetName.trim()) {
				toast({
					title: "Error",
					description: "Please enter a preset name",
					status: "error",
					duration: 2000
				});
				return;
			}

			if (!firestoreUser) {
				toast({
					title: "Error",
					description: "You must be logged in to save presets",
					status: "error",
					duration: 2000
				});
				return;
			}

			if (
				!graph?.sharedEmails?.includes(firestoreUser.email) &&
				graph?.owner != firestoreUser.uid
			) {
				toast({
					title: "Error",
					description: "The graph must be shared with you to save presets",
					status: "error",
					duration: 2000
				});
				return;
			}

			const newPreset: Preset = {
				name: presetName,
				updated: Timestamp.now(),
				filters: [],
				pathways: null,
				view: currentView
			};

			if (graph?.id) {
				await addPreset(graph.id, newPreset);
				addPresetToGraph(newPreset);
				toast({
					title: "Success",
					description: "Preset saved successfully",
					status: "success",
					duration: 2000
				});
				setPresetName("");
				onClose();
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to save preset",
				status: "error",
				duration: 2000
			});
		}
	};

	const handleDeletePreset = async (preset: Preset) => {
		try {
			if (
				!firestoreUser ||
				(!graph?.sharedEmails?.includes(firestoreUser.email) &&
					graph?.owner != firestoreUser.uid)
			) {
				toast({
					title: "Error",
					description: "You must be logged in to delete presets",
					status: "error",
					duration: 2000,
				});
				return;
			}

			if (graph?.id) {
				await deletePreset(graph.id, preset.name);
				deletePresetFromGraph(preset);
				toast({
					title: "Preset deleted",
					status: "success",
					duration: 2000
				});
			}
		} catch (error) {
			toast({
				title: "Failed to delete preset",
				status: "error",
				duration: 2000
			});
		}
	};

	const filteredNodes = searchQuery
		? sortedNodes.filter(
			(node) =>
				node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
				node.category.toLowerCase().includes(searchQuery.toLowerCase())
		)
		: [];

	return (
		<Box p={4} backgroundColor="gray.100" height="100%">
			<Tabs>
				<TabList>
					<Tab>Nodes</Tab>
					<Tab>Presets</Tab>
				</TabList>

				<TabPanels>
					<TabPanel>
						<Flex mb={4}>
							<Input
								placeholder="Search by label, id, or category..."
								value={searchQuery}
								onChange={handleSearchChange}
							/>
						</Flex>
						<Box height="82vh" overflowY="auto">
							{filteredNodes.length > 0 ? (
								<List spacing={2}>
									{filteredNodes.map((node) => (
										<ListItem
											key={node.id}
											p={2}
											backgroundColor={
												selectedNodeId === node.id ? "gray.300" : "white"
											}
											borderRadius="md"
											boxShadow="md"
											onClick={() => handleNodeClick(node)}
											cursor="pointer"
										>
											<Text fontWeight="bold">{node.label}</Text>
											<Text>ID: {node.id}</Text>
											<Text>Value: {node.value}</Text>
											<Text>Category: {node.category}</Text>
										</ListItem>
									))}
								</List>
							) : (
								<Text>No nodes to display. Please enter a search query.</Text>
							)}
						</Box>
					</TabPanel>

					<TabPanel>
						<Box height="86vh" overflowY="auto">
							<VStack spacing={4} align="stretch">
								<Button colorScheme="blue" onClick={onOpen}>
									Save Current View
								</Button>
								<Box overflowY="auto">
									<PresetList
										presets={graph?.presets ?? []}
										activePreset={activePreset}
										onPresetClick={handlePresetClick}
										onDeletePreset={handleDeletePreset}
									/>
								</Box>
							</VStack>
						</Box>
					</TabPanel>
				</TabPanels>
			</Tabs>

			<SavePresetModal
				isOpen={isOpen}
				onClose={onClose}
				presetName={presetName}
				setPresetName={setPresetName}
				currentView={currentView}
				onSave={handleSavePreset}
			/>
		</Box>
	);
};

export default GraphSideBar;
