/**
 * Upload File
 * @returns {ReactElement} Upload File page
 */
import "tailwindcss/tailwind.css";

import {
	ArrowBackIcon,
	CheckCircleIcon,
	CloseIcon,
	DownloadIcon
} from "@chakra-ui/icons";
import {
	Box,
	Button,
	Divider,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	IconButton,
	Input,
	Step,
	StepIcon,
	StepIndicator,
	StepNumber,
	StepSeparator,
	StepStatus,
	StepTitle,
	Stepper,
	Switch,
	Text,
	Textarea,
	useSteps,
	useToast
} from "@chakra-ui/react";

import { RiArrowRightUpLine } from "react-icons/ri";
import { uploadGraph } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useState } from "react";
import { validateJSON } from "@/utils/validateJSON";
import { parseGraphData } from "@/utils/extractGraphData";

const steps = [
	{ title: "Select File", description: "Choose the JSON file to upload" },
	{
		title: "Configure Details",
		description: "Provide details about your graph"
	},
	{
		title: "Review & Save",
		description: "Review the details and save the graph"
	}
];

export default function UploadFile() {
	const { activeStep, setActiveStep } = useSteps({
		index: 0,
		count: steps.length
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [graphName, setGraphName] = useState("");
	const [graphDescription, setGraphDescription] = useState("");
	const [graphVisibility, setGraphVisibility] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const toast = useToast();
	const router = useRouter();
	const { firebaseUser } = useAuth();

	const handleDownloadExample = async (nodeNum: number) => {
		try {
			const fileUrl =
				nodeNum === 10 ? "/10_node_example.json" : "/100_node_example.json";

			const response = await fetch(fileUrl);
			const blob = await response.blob();

			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = `${nodeNum}_nodes_example.json`;
			link.click();
		} catch (error) {
			console.error("Error downloading file:", error);
		}
	};

	const handleSwitchToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		setGraphVisibility(e.target.checked);
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		handleFileChange(file);
	};

	const handleRemoveFile = () => {
		setSelectedFile(null);
		setGraphName("");
		setGraphDescription("");
		setGraphVisibility(false);
		const fileInput = document.getElementById("fileInput") as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const handleFileChange = async (file: File | null) => {
		if (file && file.type === "application/json") {
			try {
				const fileContent = await file.text();
				const validationResult = validateJSON(fileContent);

				if (!validationResult.isValid) {
					toast({
						title: "Invalid Graph Data",
						description: validationResult.errorMessage,
						status: "error",
						duration: 5000,
						isClosable: true
					});
					setSelectedFile(null);
					return;
				}

				toast({
					title: "File Uploaded",
					description: "Graph data is valid.",
					status: "success",
					duration: 5000,
					isClosable: true
				});

				setSelectedFile(file);
			} catch (error) {
				toast({
					title: "Error Reading File",
					description: "An error occurred while reading the file.",
					status: "error",
					duration: 5000,
					isClosable: true
				});
				console.error(error);
				setSelectedFile(null);
			}
		} else {
			toast({
				title: "Invalid File Type",
				description: "Only JSON files are allowed.",
				status: "error",
				duration: 5000,
				isClosable: true
			});
			setSelectedFile(null);
		}
	};

	const handleNextStep = () => {
		if (activeStep === 1) {
			if (!graphName.trim() || !graphDescription.trim()) {
				toast({
					title: "Incomplete Details",
					description: "Both name and description are required.",
					status: "error",
					duration: 5000,
					isClosable: true
				});
				return;
			}
		}
		if (activeStep < steps.length - 1) {
			setActiveStep(activeStep + 1);
		}
	};
	const handlePrevStep = () => {
		if (activeStep > 0) {
			setActiveStep(activeStep - 1);
		}
	};
	const handleSaveClick = async () => {
		setIsLoading(true);

		try {
			if (selectedFile) {
				// Validate the file content before uploading
				const fileContent = await selectedFile.text();

				// Parse Graph Data Before Uploading
				const graphTags = parseGraphData(fileContent);

				// If validation passes, proceed with uploading
				const graph = await uploadGraph(
					firebaseUser,
					selectedFile,
					graphName,
					graphDescription,
					graphVisibility,
					graphTags
				);

				toast({
					title: "Graph saved",
					description: `The following graph has been saved to your account: ${graph?.graphName}`,
					status: "success",
					duration: 5000,
					isClosable: true
				});
				router.push("/");
			}
		} catch (error) {
			toast({
				title: "Error while saving graph",
				description: `Error: ${error}`,
				status: "error",
				duration: null,
				isClosable: true
			});
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<div className="bg-gray-800 h-screen overflow-auto relative">
			<Button
				leftIcon={<ArrowBackIcon color="white" />}
				className="fixed top-4 left-4"
				variant="ghost"
				colorScheme="whiteAlpha"
				onClick={() => {
					router.push("/");
				}}
			>
				<Text color="white">Back to Home</Text>
			</Button>

			<div className="h-full max-w-4xl mx-auto flex flex-col items-center justify-center">
				<div className="bg-white rounded-lg p-8 shadow-md w-full">
					<Box className="text-center">
						<Stepper index={activeStep}>
							{steps.map((step, index) => (
								<Step key={index}>
									<StepIndicator>
										<StepStatus
											complete={<StepIcon />}
											incomplete={<StepNumber />}
											active={<StepNumber />}
										/>
									</StepIndicator>
									<Box flexShrink="0">
										<StepTitle>{step.title}</StepTitle>
									</Box>
									<StepSeparator />
								</Step>
							))}
						</Stepper>
						{/* Upload File */}
						{activeStep === 0 && (
							<>
								<Heading className="text-center text-4xl mt-6">
									File Upload
								</Heading>
								<Text className="pt-2">
									Upload your JSON data to be used in your graph.
								</Text>

								{/* Drag and Drop box */}
								<div
									className={`border border-dashed border-black rounded-lg h-48 mt-4 flex flex-col items-center justify-center ${
										isDragging ? "bg-gray-100" : ""
									}`}
									onDragEnter={handleDragEnter}
									onDragLeave={handleDragLeave}
									onDragOver={handleDragOver}
									onDrop={handleDrop}
								>
									<input
										type="file"
										accept=".json"
										onChange={(e) =>
											handleFileChange(e.target.files?.[0] || null)
										}
										className="hidden"
										id="fileInput"
									/>
									<label htmlFor="fileInput" className="cursor-pointer">
										<span className="underline">
											Browse your computer or drag and drop here
										</span>
									</label>
									{selectedFile && (
										<div className="flex flex-col gap-2">
											<Text mt={2} className="text-primary-500">
												Selected file: {selectedFile.name}
											</Text>
											<IconButton
												isRound={true}
												aria-label="delete file"
												variant="ghost"
												size="sm"
												icon={<CloseIcon />}
												onClick={handleRemoveFile}
											/>
										</div>
									)}
								</div>

								{/* Sample JSON Files */}
								{!selectedFile && (
									<div className="flex flex-col gap-2 mt-6">
										<Divider orientation="horizontal" borderColor="gray.400" />
										<Text className="pt-2">
											Try our example files, which can be uploaded and opened.
											Not sure where to start? Check out our User Guide.
										</Text>

										<div className="flex flex-row gap-2 justify-center w-full">
											<Button
												className="border rounded-lg p-2"
												size="sm"
												rightIcon={<DownloadIcon />}
												onClick={() => handleDownloadExample(10)}
											>
												10 Node Example
											</Button>

											<Button
												className="border rounded-lg p-2"
												size="sm"
												rightIcon={<DownloadIcon />}
												onClick={() => handleDownloadExample(100)}
											>
												100 Node Example
											</Button>

											<Button
												className="border rounded-lg p-2"
												as="a"
												href="https://docs.google.com/document/d/1PY3aDcpMCG_7qnzSSssFF1nvCmY3Tb28pG5efoUcyBk/edit?usp=sharing"
												target="_blank"
												rel="noopener noreferrer"
												size="sm"
											>
												Open user guide{" "}
												<RiArrowRightUpLine className="ml-2" size={16} />
											</Button>
										</div>
									</div>
								)}
								<Button
									mt={4}
									onClick={handleNextStep}
									colorScheme="blue"
									isDisabled={!selectedFile}
									aria-label="step 0 next"
								>
									Next
								</Button>
							</>
						)}
						{/* Add Details */}
						{activeStep === 1 && (
							<>
								<Heading className="text-center text-4xl mt-6">
									Add Details
								</Heading>
								<form>
									<FormControl>
										{/* Graph Name */}
										<FormLabel className="pt-7 ml-6">
											Graph Name <span style={{ color: "red" }}>*</span>
										</FormLabel>

										<Input
											maxWidth="800px"
											className="w-full p-2 border rounded-lg  ml-6"
											placeholder="Enter a name for your graph"
											_placeholder={{ opacity: 1, color: "gray.600" }}
											onChange={(e) => setGraphName(e.target.value)}
											value={graphName}
										/>

										{/* Graph Description */}
										<FormLabel className="pt-7 ml-6">
											Graph Description <span style={{ color: "red" }}>*</span>
										</FormLabel>
										<Textarea
											maxWidth="800px"
											className="w-full p-2 border rounded-lg ml-6"
											placeholder="Enter a description for your graph"
											_placeholder={{ opacity: 1, color: "gray.600" }}
											onChange={(e) => setGraphDescription(e.target.value)}
											value={graphDescription}
										/>

										<FormLabel className="pt-7 ml-6"> Visibility</FormLabel>
										<Box className="pl-5 ml-3" textAlign="left">
											<Switch
												onChange={handleSwitchToggle}
												isChecked={graphVisibility}
												aria-label="Enable Public Visibility"
											>
												Publicly Available
											</Switch>
										</Box>
									</FormControl>
								</form>
								<div className="flex flex-row justify-between mt-7 px-6">
									<Button variant="outline" onClick={handlePrevStep}>
										Back
									</Button>
									<Button
										mt={4}
										onClick={handleNextStep}
										colorScheme="blue"
										isDisabled={!selectedFile}
									>
										Next
									</Button>
								</div>
							</>
						)}
						{/* Review and Save */}
						{activeStep === 2 && (
							<>
								<Heading className="text-center text-4xl mt-6">
									Review & Save
								</Heading>

								<Box
									mt={6}
									p={6}
									borderWidth="1px"
									borderRadius="lg"
									shadow="md"
									bg="gray.50"
									maxWidth="600px"
									mx="auto"
									textAlign="left"
								>
									{selectedFile && (
										<Flex alignItems="center" mb={4}>
											<Text
												fontSize="lg"
												fontWeight="semibold"
												color="gray.700"
												mr={2}
											>
												<Text as="span" className="font-bold">
													Graph File:
												</Text>
											</Text>
											<Text as="span" fontSize="lg" color="gray.600">
												{selectedFile.name} (
												{(selectedFile.size / 1024).toFixed(2)} KB)
											</Text>
										</Flex>
									)}

									<Flex alignItems="center" mb={4}>
										<Text
											fontSize="lg"
											fontWeight="semibold"
											color="gray.700"
											mr={2}
										>
											Graph Name:
										</Text>
										<Text as="span" fontSize="lg" color="gray.600">
											{graphName || "N/A"}
										</Text>
									</Flex>

									<Flex alignItems="center" mb={4}>
										<Text
											fontSize="lg"
											fontWeight="semibold"
											color="gray.700"
											mr={2}
										>
											Description:
										</Text>
										<Text as="span" fontSize="lg" color="gray.600">
											{graphDescription || "N/A"}
										</Text>
									</Flex>

									<Flex alignItems="center">
										<Text
											fontSize="lg"
											fontWeight="semibold"
											color="gray.700"
											mr={2}
										>
											Visibility:
										</Text>
										<Text
											as="span"
											fontSize="lg"
											color={graphVisibility ? "green.500" : "red.500"}
										>
											{graphVisibility ? "Public" : "Private"}
										</Text>
									</Flex>
								</Box>

								{/* Buttons */}
								<Box className="flex justify-between mt-10 px-6">
									<Button variant="outline" size="md" onClick={handlePrevStep}>
										Back
									</Button>
									<Button
										colorScheme="blue"
										size="md"
										onClick={handleSaveClick}
										isLoading={isLoading}
										loadingText="Saving..."
										rightIcon={<CheckCircleIcon />}
									>
										Save graph to your account
									</Button>
								</Box>
							</>
						)}
					</Box>
				</div>
			</div>
		</div>
	);
}
