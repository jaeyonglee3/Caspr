/**
 * PresetList component
 * @params {PresetListProps} props - The props for the component
 * @returns {ReactElement} The PresetList component
 * @Samuel
 */
import React from "react";
import {
	List, ListItem, Text, Box, Button,
	VStack, SimpleGrid, Flex
} from "@chakra-ui/react";
import { Preset } from "@/types";
import formatDate from "@/utils/formatDate";

interface PresetListProps {
	presets: Preset[];
	activePreset: Preset | null;
	onPresetClick: (preset: Preset) => void;
	onDeletePreset: (preset: Preset) => void;
}

const PresetList: React.FC<PresetListProps> = ({
	presets,
	activePreset,
	onPresetClick,
	onDeletePreset,
}) => {
	const formatNumber = (num: number) => num.toFixed(2);

	return (
		<List spacing={3}>
			{presets.map((preset) => (
				<ListItem
					key={preset.name}
					p={4}
					backgroundColor={activePreset?.name === preset.name ? "blue.50" : "white"}
					borderRadius="lg"
					boxShadow="sm"
					cursor="pointer"
					onClick={() => onPresetClick(preset)}
					_hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
					transition="all 0.2s"
					border="1px"
					borderColor="gray.200"
				>
					<VStack align="stretch" spacing={2}>
						<Flex justify="space-between" align="center">
							<Text
								fontWeight="bold"
								fontSize="lg"
								color={activePreset?.name === preset.name ? "blue.600" : "gray.700"}
							>
								{preset.name}
							</Text>
							<Text fontSize="sm" color="gray.500" fontStyle="italic">
								Updated {formatDate(preset.updated)}
							</Text>
							<Button
								size="xs"
								variant="ghost"
								onClick={(e) => {
									e.stopPropagation();
									onDeletePreset(preset);
								}}
								ml={2}
								p={0}
								minW={6}
								height={6}
								color="gray.400"
								_hover={{ color: "red.500" }}
							>
								×
							</Button>
						</Flex>

						{preset.view && (
							<Box bg="gray.50" p={2} borderRadius="md" fontSize="sm">
								<SimpleGrid columns={2} spacing={3}>
									<Box>
										<Text color="gray.600" fontWeight="medium">Position</Text>
										<Text>X: {formatNumber(preset.view.x)}</Text>
										<Text>Y: {formatNumber(preset.view.y)}</Text>
										<Text>Z: {formatNumber(preset.view.z)}</Text>
									</Box>
									{preset.view.orientation && (
										<Box>
											<Text color="gray.600" fontWeight="medium">Orientation</Text>
											<Text>Pitch: {formatNumber(preset.view.orientation.pitch)}°</Text>
											<Text>Yaw: {formatNumber(preset.view.orientation.yaw)}°</Text>
											<Text>Roll: {formatNumber(preset.view.orientation.roll)}°</Text>
										</Box>
									)}
								</SimpleGrid>
							</Box>
						)}
					</VStack>
				</ListItem>
			))}
		</List>
	);
};

export default PresetList;