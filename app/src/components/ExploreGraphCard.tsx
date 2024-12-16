/**
 * ExploreGraphCard.tsx
 * This component is used to display the card for the graph object in the explore page.
 * @param {MyGraphCardProps} props - The graph object to be displayed
 * @returns {ReactElement} The ExploreGraphCard component
 */
import {
	Box,
	Button,
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
	Text,
	Tooltip,
	useDisclosure
} from "@chakra-ui/react";
import React from "react";

import { MyGraphCardProps } from "@/types";

const MyGraphObject: React.FC<MyGraphCardProps> = ({ graph, owner }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const truncatedDescription =
		graph.graphDescription.length > 21
			? `${graph.graphDescription.substring(0, 21)}...`
			: graph.graphDescription;

	const handleDescriptionClick = () => {
		onOpen();
	};

	const handleOpenClick = () => {
		const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  	window.location.href = `${baseURL}/graph/${graph.graphURL}`;
	};

	return (
		<Card maxW="full">
			<CardHeader className="flex justify-between">
				<Heading size="md">{graph.graphName}</Heading>
				<div className="flex flex-col">
					<Text>{`by ${owner.name || "unknown"}`}</Text>
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
						<Tooltip hasArrow label="Click to see full description">
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

				<div className="flex flex-row gap-2">
					<Button colorScheme="blue" size="md" onClick={handleOpenClick}>
						Open
					</Button>
				</div>
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
