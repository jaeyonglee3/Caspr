/**
 * GraphNavbar.tsx
 * This component is used to display the navigation bar for the graph page.
 * @param {Graph} graph - The graph object to be shared
 * @param {Diagram[]} diagrams - The list of diagrams to be displayed
 * @param {number} selectedTab - The index of the selected tab
 * @param {Function} setSelectedTab - The function to set the selected tab
 * @param {Function} addDiagram - The function to add a new diagram
 * @param {Function} removeDiagram - The function to remove a diagram
 * @returns {ReactNode} The GraphNavbar component
 */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
	Tabs,
	TabList,
	Tab,
	IconButton,
	Flex,
	Avatar,
	Spacer,
	useDisclosure
} from "@chakra-ui/react";
import { AddIcon, CloseIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ShareButton from "./buttons/ShareButton";
import { Graph } from "@/types/graph";

interface Diagram {
	id: number;
	data: {
		nodes: { id: string; label: string; value: number; category: string }[];
		edges: {
			source: string;
			target: string;
			relationship: string;
			strength: number;
		}[];
	};
	label: string;
}

interface NavBarProps {
	graph: Graph | null;
	diagrams: Diagram[];
	selectedTab: number;
	setSelectedTab: (index: number) => void;
	addDiagram: () => void;
	removeDiagram: (id: number) => void;
}

const NavBar: React.FC<NavBarProps> = ({
	diagrams,
	selectedTab,
	setSelectedTab,
	addDiagram,
	removeDiagram,
	graph
}) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [username, setUsername] = useState("");
	const router = useRouter();

	useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUsername(user.displayName || "User");
			}
		});
		return () => unsubscribe();
	}, []);

	const goBack = () => {
		router.back();
	};

	const handleAvatarClick = () => {
		// Function to handle avatar click
	};

	return (
		<Flex alignItems="center" mb={0} p={2} backgroundColor="gray.800">
			<Link href="/">
				<IconButton
					aria-label="Go Back"
					icon={<ArrowBackIcon />}
					size="lg"
					ml={2}
					mr={5}
					onClick={goBack}
					p={2}
				/>
			</Link>
			<Avatar src="/favicon.ico" size="sm" mr={3} /> 
			<Tabs index={selectedTab} onChange={(index) => setSelectedTab(index)} variant="unstyled">
				<TabList>
					{diagrams.map((diagram) => (
						<Tab
							key={diagram.id}
							p={2}
							color={selectedTab === diagram.id ? 'white' : 'gray.400'}
							bg={selectedTab === diagram.id ? 'gray.700' : 'transparent'}
							_selected={{ color: 'white', bg: 'gray.700' }}
						>
							{diagram.label}
							<IconButton
								aria-label="Delete Diagram"
								icon={<CloseIcon />}
								size="xs"
								ml={2}
								onClick={(e) => {
									e.stopPropagation();
									removeDiagram(diagram.id);
								}}
								p={2}
							/>
						</Tab>
					))}
				</TabList>
			</Tabs>
			<IconButton
				aria-label="Add New Diagram"
				icon={<AddIcon />}
				size="xs"
				ml={2}
				onClick={(e) => {
					e.stopPropagation();
					addDiagram();
				}}
				p={2}
			/>
			<Spacer />
			{graph && (
				<ShareButton
					graph={graph}
				/>
			)}
			<Avatar
				name={username ? username.slice(0, 2).toUpperCase() : ""}
				src="path_to_image.jpg"
				size="md"
				ml={2}
				onClick={handleAvatarClick}
				cursor="pointer"
				p={2}
			/>
		</Flex>
	);
};

export default NavBar;
