/**
 * Login page
 * @returns {ReactElement} Login page
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
	Text,
	useToast
} from "@chakra-ui/react";
import { FormEvent, useEffect, useState } from "react";
import { handleGoogleRedirect, loginWithEmail, loginWithGoogle } from "@/api";

import { ArrowForwardIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

function Login() {
	const toast = useToast();
	const router = useRouter();
	const { firebaseUser } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [googleLoginLoading, setGoogleLoginLoading] = useState<boolean>(false);

	const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		try {
			await loginWithEmail(email, password);
			toast({
				title: "Login successful",
				status: "success",
				duration: 3000,
				isClosable: true
			});
			router.push("/");
		} catch (error: any) {
			toast({
				title: "Login failed",
				description: error.message,
				status: "error",
				duration: 3000,
				isClosable: true
			});
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setGoogleLoginLoading(true);
		try {
			await loginWithGoogle();
		} catch (error: any) {
			toast({
				title: "Google login failed",
				description: error.message,
				status: "error",
				duration: 3000,
				isClosable: true
			});
			setGoogleLoginLoading(false);
		}
	};

	useEffect(() => {
		const handleRedirect = async () => {
			setLoading(true);
			try {
				await handleGoogleRedirect();
				router.push("/");
			} catch (error: any) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		handleRedirect();
	}, [router]);

	if (firebaseUser) {
		router.push("/");
		return null;
	}

	return (
		<div className="bg-gray-800 h-screen">
			<div className="h-screen max-w-2xl mx-auto flex flex-col items-center justify-center">
				<div className="bg-white rounded-lg p-8 shadow-md w-[80%]">
					<Box className="text-center">
						<div className="flex flex-col items-center justify-center w-full">
							<img src="/favicon.ico" alt="Logo" style={{ height: "100px" }} />
						</div>
						<Heading className="text-center text-4xl">Welcome to Caspr</Heading>
						<Text className="pt-2">Log in to your account</Text>

						<form onSubmit={handleLogin}>
							<FormControl>
								<FormLabel className="pt-7">Email</FormLabel>

								<Input
									className="w-full p-2 border rounded-lg"
									placeholder="Enter email"
									_placeholder={{ opacity: 1, color: "gray.600" }}
									type="email"
									onChange={(e) => setEmail(e.target.value)}
									value={email}
								/>

								<FormLabel className="pt-7">Password</FormLabel>

								<InputGroup size="md">
									<Input
										className="w-full p-2 border rounded-lg"
										pr="4.5rem"
										type={show ? "text" : "password"}
										placeholder="Enter password"
										_placeholder={{ opacity: 1, color: "gray.600" }}
										onChange={(e) => setPassword(e.target.value)}
										value={password}
									/>
									<InputRightElement width="4.5rem">
										<Button
											variant="ghost"
											h="1.75rem"
											size="sm"
											onClick={() => {
												setShow(!show);
											}}
										>
											{show ? "Hide" : "Show"}
										</Button>
									</InputRightElement>
								</InputGroup>

								<div className="flex justify-end mt-2">
									<Link href="/forgot-password">
										<Text
											color="blue.500"
											_hover={{ textDecoration: "underline" }}
										>
											Forgot password?
										</Text>
									</Link>
								</div>

								<hr className="mt-4" />

								<div className="flex flex-col gap-3 justify-center mt-5">
									<Button
										rightIcon={<ArrowForwardIcon />}
										className="border rounded-lg p-2"
										type="submit"
										isLoading={loading}
										loadingText="Logging In"
									>
										Log In
									</Button>

									<Button
										rightIcon={<ArrowForwardIcon />}
										className="border rounded-lg p-2"
										type="button"
										onClick={() => {
											router.push("/create-account");
										}}
									>
										Create a new account
									</Button>

									<Button
										rightIcon={<ArrowForwardIcon />}
										colorScheme="blue"
										className="w-full"
										isLoading={googleLoginLoading}
										type="button"
										onClick={handleGoogleLogin}
									>
										Sign in with Google
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

export default Login;
