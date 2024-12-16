/**
 * Providers component
 * Defines the Providers component that wraps the entire application
 * @param {React.ReactNode} children
 * @returns {React.ReactNode} The Providers component
 */
"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "@/context";
import { GraphsProvider } from "@/context";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ChakraProvider>
			<AuthProvider>
				<GraphsProvider> {children} </GraphsProvider>
			</AuthProvider>
		</ChakraProvider>
	);
}
