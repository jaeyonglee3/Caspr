/**
 * Forgot password page
 * @returns {ReactElement} Forgot password page
 */
import "tailwindcss/tailwind.css";

import { ArrowBackIcon, CheckCircleIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Heading,
	Input,
	SlideFade,
	Text,
	useToast
} from "@chakra-ui/react";

import Link from "next/link";
import { sendResetPasswordEmail, universalLogout } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useState } from "react";

export default function ForgotPassword() {
	const { firebaseUser } = useAuth();
	const toast = useToast();

	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [isResetEmailSent, setIsResetEmailSent] = useState(false);
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await universalLogout();
			router.push("/login");
		} catch (error) {
			console.error(error);
		}
	};

	const handleResetPassword = async () => {
		setLoading(true);

		try {
			await sendResetPasswordEmail(email);
			if (firebaseUser) {
				handleLogout();
			}
			toast({
				title: "Email sent",
				status: "success",
				duration: 3000,
				isClosable: true
			});
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
			setIsResetEmailSent(true);
		}
	};

	const descriptionText =
		"Enter the email associated with your account. We will send you a link to change your password.";
	const descriptionTextAlternate =
		"Enter the email associated with your account. We will send you a link to change your password and you will be logged out.";
	const pageTitle = "Forgot Password";
	const pageTitleAlternate = "Reset Password";

	return (
		<div className="bg-gray-800 h-screen">
			<div className="h-screen max-w-2xl mx-auto flex flex-col items-center justify-center">
				<div className="bg-white rounded-lg p-8 shadow-md w-[80%]">
					<Box className="text-center">
						<Heading className="text-center text-4xl">
							{firebaseUser ? pageTitleAlternate : pageTitle}
						</Heading>
						<Text className="pt-2">
							{firebaseUser ? descriptionTextAlternate : descriptionText}
						</Text>

						<form>
							<FormControl>
								{/* Email */}
								<FormLabel className="pt-7">Email</FormLabel>
								<Input
									className="w-full p-2 border rounded-lg"
									placeholder="Enter your email"
									_placeholder={{ opacity: 1, color: "gray.600" }}
									type="email"
									onChange={(e) => setEmail(e.target.value)}
									value={email}
									isDisabled={isResetEmailSent}
								/>

								{isResetEmailSent && (
									<SlideFade
										in={isResetEmailSent}
										offsetY="20px"
										transition={{ enter: { duration: 0.6 } }}
									>
										<Box
											bg="green.100"
											color="green.800"
											borderRadius="md"
											p={4}
											mt={4}
											className="text-center"
										>
											<CheckCircleIcon mr={2} />
											An email has been sent to your inbox with a link to reset
											your password. Once you&apos;ve reset your password, you
											can close that tab, come back to this one, and log in with
											your new password.
										</Box>
									</SlideFade>
								)}

								{/* Buttons */}
								<div className="flex flex-row gap-4 justify-center mt-7">
									<Link href={firebaseUser ? "/" : "/login"}>
										<Button
											className="border rounded-lg p-2"
											leftIcon={<ArrowBackIcon />}
										>
											{firebaseUser ? "Back" : "Back to Login Page"}
										</Button>
									</Link>

									<Button
										colorScheme="blue"
										className="w-fit"
										onClick={handleResetPassword}
										isLoading={loading}
										loadingText="Sending..."
										isDisabled={isResetEmailSent}
									>
										Send Reset Link
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
