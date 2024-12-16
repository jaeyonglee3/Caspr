/**
 * Create Account
 * @returns {ReactElement} CreateAccount component
 */
import "tailwindcss/tailwind.css";

import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Heading,
	Input,
	InputGroup,
	InputRightElement,
	List,
	ListIcon,
	ListItem,
	Text,
	useToast
} from "@chakra-ui/react";
import { createAccountWithEmail, loginWithGoogle } from "@/api";

import { ArrowForwardIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useState } from "react";
import { checkPasswordStrength } from "@/utils/passwordStrength";
import { PasswordChecklist } from "@/types/passwordStrength";

export default function CreateAccount() {
	const toast = useToast();
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState<boolean>(false);
	const [passwordStrength, setPasswordStrength] = useState("");
	const [passwordColor, setPasswordColor] = useState("");
	const [passwordChecklist, setPasswordChecklist] = useState<PasswordChecklist>(
		{
			hasUpperCase: false,
			hasLowerCase: false,
			hasNumbers: false,
			hasSpecialChar: false,
			sufficientLength: false
		}
	);

	const handleSubmit = async () => {
		// If user mistyped the password
		if (password != confirmPassword) {
			toast({
				title: "Make sure that passwords are matching",
				status: "error",
				duration: 3000,
				isClosable: true
			});
			return;
		}

		// If passwords do match
		setLoading(true);

		try {
			const user = await createAccountWithEmail(email, password, username);

			toast({
				title: "Account created",
				description: `Welcome ${user.email}`,
				status: "success",
				duration: 5000,
				isClosable: true
			});
			router.push("/");
		} catch (error) {
			toast({
				title: "Error while creating account",
				description: `Error: ${error}`,
				status: "error",
				duration: 5000,
				isClosable: true
			});
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleCreateAccount = async () => {
		try {
			setGoogleLoading(true);
			const user = await loginWithGoogle();

			toast({
				title: "Account created",
				description: `Welcome ${user.email}`,
				status: "success",
				duration: 5000,
				isClosable: true
			});

			router.push("/");
		} catch (error) {
			toast({
				title: "Error while creating account",
				description: `Error: ${error}`,
				status: "error",
				duration: 5000,
				isClosable: true
			});
		} finally {
			setGoogleLoading(false);
		}
	};

	return (
		<div className="bg-gray-800 h-screen">
			<div className="h-screen max-w-2xl mx-auto flex flex-col items-center justify-center">
				<div className="bg-white rounded-lg p-8 shadow-md w-[80%]">
					<Box className="text-center">
						<Heading className="text-center text-4xl">Welcome to Caspr</Heading>
						<Text className="pt-2">Create a new account</Text>

						<form>
							<FormControl>
								<FormLabel className="pt-7">Email</FormLabel>

								<Input
									className="w-full p-2 border rounded-lg"
									placeholder="Enter email"
									_placeholder={{ opacity: 1, color: "gray.600" }}
									type="username"
									onChange={(e) => setEmail(e.target.value)}
									value={email}
								/>

								<FormLabel className="pt-7">Username</FormLabel>

								<Input
									className="w-full p-2 border rounded-lg"
									placeholder="Enter username"
									_placeholder={{ opacity: 1, color: "gray.600" }}
									type="username"
									onChange={(e) => setUsername(e.target.value)}
									value={username}
								/>

								<FormLabel className="pt-7">Password</FormLabel>

								<InputGroup size="md">
									<Input
										className="w-full p-2 border rounded-lg"
										pr="4.5rem"
										type={showPassword ? "text" : "password"}
										placeholder="Enter password"
										_placeholder={{ opacity: 1, color: "gray.600" }}
										onChange={(e) => {
											setPassword(e.target.value);
											const strengthResult = checkPasswordStrength(
												e.target.value
											);
											setPasswordStrength(strengthResult.strength);
											setPasswordColor(strengthResult.color);
											setPasswordChecklist(strengthResult.checklist);
										}}
										value={password}
									/>

									<InputRightElement width="4.5rem">
										<Button
											variant="ghost"
											h="1.75rem"
											size="sm"
											onClick={() => {
												setShowPassword(!showPassword);
											}}
										>
											{showPassword ? "Hide" : "Show"}
										</Button>
									</InputRightElement>
								</InputGroup>

								{password && (
									<Text
										fontSize="sm"
										color={passwordColor}
										mt={2}
										textAlign="left"
										pl={1}
										fontWeight="medium"
									>
										Password Strength: {passwordStrength}
									</Text>
								)}

								<List spacing={1} mt={2} fontSize="sm">
									<ListItem
										color={
											passwordChecklist.sufficientLength
												? "green.500"
												: "gray.500"
										}
										display="flex"
										alignItems="center"
									>
										<ListIcon
											as={
												passwordChecklist.sufficientLength
													? CheckIcon
													: CloseIcon
											}
											color={
												passwordChecklist.sufficientLength
													? "green.500"
													: "gray.500"
											}
										/>
										At least 8 characters
									</ListItem>
									<ListItem
										color={
											passwordChecklist.hasUpperCase ? "green.500" : "gray.500"
										}
										display="flex"
										alignItems="center"
									>
										<ListIcon
											as={
												passwordChecklist.hasUpperCase ? CheckIcon : CloseIcon
											}
											color={
												passwordChecklist.hasUpperCase
													? "green.500"
													: "gray.500"
											}
										/>
										Contains uppercase letter
									</ListItem>
									<ListItem
										color={
											passwordChecklist.hasLowerCase ? "green.500" : "gray.500"
										}
										display="flex"
										alignItems="center"
									>
										<ListIcon
											as={
												passwordChecklist.hasLowerCase ? CheckIcon : CloseIcon
											}
											color={
												passwordChecklist.hasLowerCase
													? "green.500"
													: "gray.500"
											}
										/>
										Contains lowercase letter
									</ListItem>
									<ListItem
										color={
											passwordChecklist.hasNumbers ? "green.500" : "gray.500"
										}
										display="flex"
										alignItems="center"
									>
										<ListIcon
											as={passwordChecklist.hasNumbers ? CheckIcon : CloseIcon}
											color={
												passwordChecklist.hasNumbers ? "green.500" : "gray.500"
											}
										/>
										Contains number
									</ListItem>
									<ListItem
										color={
											passwordChecklist.hasSpecialChar
												? "green.500"
												: "gray.500"
										}
										display="flex"
										alignItems="center"
									>
										<ListIcon
											as={
												passwordChecklist.hasSpecialChar ? CheckIcon : CloseIcon
											}
											color={
												passwordChecklist.hasSpecialChar
													? "green.500"
													: "gray.500"
											}
										/>
										Contains special character
									</ListItem>
								</List>

								<FormLabel className="pt-7">Confirm Password</FormLabel>

								<InputGroup size="md">
									<Input
										className="w-full p-2 border rounded-lg"
										pr="4.5rem"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Enter password"
										_placeholder={{ opacity: 1, color: "gray.600" }}
										onChange={(e) => setConfirmPassword(e.target.value)}
										value={confirmPassword}
									/>
									<InputRightElement width="4.5rem">
										<Button
											variant="ghost"
											h="1.75rem"
											size="sm"
											onClick={() => {
												setShowConfirmPassword(!showConfirmPassword);
											}}
										>
											{showConfirmPassword ? "Hide" : "Show"}
										</Button>
									</InputRightElement>
								</InputGroup>

								<hr className="mt-4" />

								<div className="flex flex-col gap-3 justify-center mt-7">
									<Button
										rightIcon={<ArrowForwardIcon />}
										className="border rounded-lg p-2"
										type="submit"
										isLoading={loading}
										loadingText="Creating Account"
										onClick={handleSubmit}
									>
										Create Account
									</Button>

									<Button
										rightIcon={<ArrowForwardIcon />}
										className="border rounded-lg p-2"
										type="submit"
										onClick={() => {
											router.push("/login");
										}}
									>
										Login Instead
									</Button>

									<Button
										colorScheme="blue"
										className="w-full"
										isLoading={googleLoading}
										onClick={handleGoogleCreateAccount}
									>
										Sign-up with Google
									</Button>
								</div>
							</FormControl>
						</form>
					</Box>
				</div>
			</div>
		</div>
	);
}
