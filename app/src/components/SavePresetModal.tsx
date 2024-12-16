/**
 * This component is used to save the current camera view as a preset
 * @param {SavePresetModalProps} props - The props for the SavePresetModal component
 * @returns {ReactElement} The SavePresetModal component
 * @Samuel
 */
import React from "react";
import {
	Modal, ModalOverlay, ModalContent, ModalHeader,
	ModalBody, ModalFooter, ModalCloseButton,
	Button, VStack, Flex, Text, Box,
	FormControl, FormLabel, Input,
	SimpleGrid
} from "@chakra-ui/react";
import { ViewPosition } from "@/types/camera";

interface SavePresetModalProps {
	isOpen: boolean;
	onClose: () => void;
	presetName: string;
	setPresetName: (name: string) => void;
	currentView: ViewPosition | null;
	onSave: () => Promise<void>;
}

const formatNumber = (num: number) => num.toFixed(2);

const SavePresetModal: React.FC<SavePresetModalProps> = ({
	isOpen,
	onClose,
	presetName,
	setPresetName,
	currentView,
	onSave,
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<ModalOverlay backdropFilter="blur(2px)" bg="blackAlpha.300" />
			<ModalContent bg="white" shadow="2xl" borderRadius="xl">
				<ModalHeader
					borderBottom="1px"
					borderColor="gray.100"
					py={6}
					bg="gray.50"
					borderTopRadius="xl"
				>
					<Flex align="center" gap={3}>
						<VStack align="flex-start" spacing={1}>
							<Text fontSize="xl" fontWeight="bold">
								Save Current View
							</Text>
							<Text fontSize="sm" color="gray.600">
								Save your current camera position and orientation as a preset
							</Text>
						</VStack>
					</Flex>
				</ModalHeader>
				<ModalCloseButton
					top={6}
					right={6}
					_hover={{ bg: "gray.100" }}
				/>

				<ModalBody py={6}>
					<VStack spacing={6} align="stretch">
						<FormControl>
							<FormLabel fontWeight="medium">Preset Name</FormLabel>
							<Input
								placeholder="Enter a descriptive name for this view"
								value={presetName}
								onChange={(e) => setPresetName(e.target.value)}
								bg="gray.50"
								border="1px"
								borderColor="gray.200"
								_hover={{
									borderColor: "gray.300",
									bg: "gray.100"
								}}
								_focus={{
									borderColor: "blue.500",
									boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
									bg: "white"
								}}
							/>
						</FormControl>

						{currentView && (
							<Box>
								<Text fontWeight="medium" mb={3} color="gray.700">
									Current View Details
								</Text>
								<Box
									bg="gray.50"
									border="1px"
									borderColor="gray.200"
									borderRadius="lg"
									overflow="hidden"
								>
									<SimpleGrid columns={2} spacing={4} p={4} bg="white">
										<Box>
											<Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
												Position
											</Text>
											<VStack align="stretch" spacing={2}>
												<Flex justify="space-between">
													<Text color="gray.600">X</Text>
													<Text fontWeight="medium">{formatNumber(currentView.x)}</Text>
												</Flex>
												<Flex justify="space-between">
													<Text color="gray.600">Y</Text>
													<Text fontWeight="medium">{formatNumber(currentView.y)}</Text>
												</Flex>
												<Flex justify="space-between">
													<Text color="gray.600">Z</Text>
													<Text fontWeight="medium">{formatNumber(currentView.z)}</Text>
												</Flex>
											</VStack>
										</Box>

										{currentView.orientation && (
											<Box>
												<Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
													Orientation
												</Text>
												<VStack align="stretch" spacing={2}>
													<Flex justify="space-between">
														<Text color="gray.600">Pitch</Text>
														<Text fontWeight="medium">
															{formatNumber(currentView.orientation.pitch)}°
														</Text>
													</Flex>
													<Flex justify="space-between">
														<Text color="gray.600">Yaw</Text>
														<Text fontWeight="medium">
															{formatNumber(currentView.orientation.yaw)}°
														</Text>
													</Flex>
													<Flex justify="space-between">
														<Text color="gray.600">Roll</Text>
														<Text fontWeight="medium">
															{formatNumber(currentView.orientation.roll)}°
														</Text>
													</Flex>
												</VStack>
											</Box>
										)}
									</SimpleGrid>
								</Box>
							</Box>
						)}
					</VStack>
				</ModalBody>

				<ModalFooter borderTop="1px" borderColor="gray.100" gap={3} py={6}>
					<Button variant="ghost" onClick={onClose} _hover={{ bg: "gray.100" }}>
						Cancel
					</Button>
					<Button
						colorScheme="blue"
						onClick={onSave}
						isDisabled={!presetName.trim()}
					>
						Save Preset
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default SavePresetModal;