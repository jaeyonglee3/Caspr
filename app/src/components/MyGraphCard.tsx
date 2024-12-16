/**
 * Graph card component for the home page
 * @param {MyGraphCardProps} props
 * @returns {ReactElement} Graph card component
 */
import {
	Box,
	Card,
	CardBody,
	CardHeader,
	Heading,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Switch,
	Text,
	Tooltip,
	useDisclosure,
	useToast
} from "@chakra-ui/react";
import { DeleteButton, ShareButton } from "@/components";
import React, { useState } from "react";

import { MyGraphCardProps } from "@/types";
import formatDate from "@/utils/formatDate";
import { updateGraphData } from "@/api/storage";
import { useAuth } from "@/context";

const MyGraphObject: React.FC<MyGraphCardProps> = ({ graph, owner }) => {
	const { firebaseUser } = useAuth();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [publicGraph, setPublicGraph] = useState(graph.graphVisibility);
	const [switchDisabled, setSwitchDisabled] = useState<boolean>(
		!graph || !firebaseUser || graph.owner !== firebaseUser.uid
	);
	const toast = useToast();

	const handleSwitchToggle = () => {
		setPublicGraph(!publicGraph);
		setSwitchDisabled(true);
		updateVisibility(!publicGraph);

		setTimeout(() => {
			setSwitchDisabled(false);
		}, 50);
	};

	const updateVisibility = async (visibility: boolean) => {
		try {
			const updateValues = { graphVisibility: visibility };
			await updateGraphData(graph.id, updateValues);
			graph.graphVisibility = visibility;

			toast({
				title: "Graph saved",
				description: `Set: ${graph.graphName} to ${graph.graphVisibility ? "public" : "private"}`,
				status: "success",
				duration: 2500,
				isClosable: true
			});
		} catch (error) {
			toast({
				title: "Error while saving graph",
				description: `Error: ${error}`,
				status: "error",
				duration: null,
				isClosable: true
			});
		}
	};

	const truncatedDescription =
		graph.graphDescription.length > 100
			? `${graph.graphDescription.substring(0, 100)}...`
			: graph.graphDescription;

	const handleDescriptionClick = () => {
		onOpen();
	};

	const handleOpenClick = () => {
		const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
		window.location.href = `${baseURL}/graph/${graph.graphURL}?auth=${firebaseUser?.uid}`;
	};

	return (
		<Card maxW="full">
			<CardHeader className="flex justify-between">
				<div className="flex flex-col space-y-3">
					<Heading
						className="hover:underline"
						size="md"
						onClick={handleOpenClick}
					>
						{graph.graphName}
					</Heading>
					<Switch
						aria-label="Enable Public Visibility"
						fontSize="sm"
						isChecked={publicGraph}
						isDisabled={switchDisabled}
						onChange={handleSwitchToggle}
					>
						{" "}
						Public Visibility{" "}
					</Switch>
				</div>

				<div className="flex flex-col">
					<Text>{`by ${owner.name || "unknown"}`}</Text>
					<Text fontSize="sm" color="gray.500">
						Created: {formatDate(graph.createdAt)}
					</Text>
				</div>
			</CardHeader>

			<CardBody className="flex justify-between">
				<Box>
					<Heading size="xs" textTransform="uppercase">
						Description:
					</Heading>
					{truncatedDescription === graph.graphDescription ? (
						<Text pt="1" pr="1" fontSize="sm">
							{graph.graphDescription}
						</Text>
					) : (
						<Tooltip label="Click to see full description" hasArrow>
							<Text
								pt="1"
								pr="1"
								fontSize="sm"
								onClick={handleDescriptionClick}
								cursor="pointer"
							>
								{truncatedDescription}
							</Text>
						</Tooltip>
					)}
				</Box>

				<Box className="flex flex-row gap-2">
					<ShareButton graph={graph} />
					<DeleteButton graph={graph} />
				</Box>
			</CardBody>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Description</ModalHeader>
					<ModalCloseButton />
					<ModalBody>{graph.graphDescription}</ModalBody>
				</ModalContent>
			</Modal>
		</Card>
	);
};

export default MyGraphObject;
