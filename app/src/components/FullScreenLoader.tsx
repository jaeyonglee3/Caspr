/**
 * FullScreenLoader component
 * @returns {ReactElement} FullScreenLoader component
 */
import { Center, Spinner } from "@chakra-ui/react";

function FullScreenLoader() {
	return (
		<Center
			bg={"bg-gray-800"}
			position="fixed"
			top="0"
			left="0"
			w="100%"
			h="100%"
			zIndex="1000"
		>
			<Spinner size="xl" />
		</Center>
	);
}

export default FullScreenLoader;
