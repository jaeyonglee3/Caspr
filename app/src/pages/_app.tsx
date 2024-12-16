/**
 * This file is used to wrap the entire application with the Providers component.
 * This is where the global styles are imported.
 * @param {AppProps} param0 - The props for the App component
 * @returns The wrapped application
 */
import { AppProps } from "next/app";
import { Providers } from "../app/providers";
import "../app/globals.css";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Flex, VStack, Text, Box } from "@chakra-ui/react";
import { MdDesktopMac } from "react-icons/md";

function MyApp({ Component, pageProps }: AppProps) {
	const [isViewportTooSmall, setIsViewportTooSmall] = useState(false);
	useEffect(() => {
		const checkViewportSize = () => {
		  setIsViewportTooSmall(window.innerWidth < 768);
		};
	
		checkViewportSize();
		window.addEventListener("resize", checkViewportSize);
	
		return () => {
		  window.removeEventListener("resize", checkViewportSize);
		};
	  }, []);
	
	  if (isViewportTooSmall) {
		return (
		  <Flex
			direction="column"
			align="center"
			justify="center"
			bg="blackAlpha.900"
			color="whiteAlpha.900"
			minH="100vh"
			textAlign="center"
			p={6}
		  >
			<VStack spacing={6}>
				<Box fontSize="20xl">
					<MdDesktopMac size="50px"/>
				</Box>
				<Text fontSize="3xl" fontWeight="bold">
					App Unavailable on Small Screens
				</Text>
				<Text fontSize="lg">
					Please resize your browser window or switch to a larger screen to
					access this application.
				</Text>
			</VStack>
		  </Flex>
		);
	  }
	return (
		<Providers>
			<Head>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<Component {...pageProps} />
		</Providers>
	);
}

export default MyApp;
