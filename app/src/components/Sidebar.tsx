import {
	ArrowForwardIcon,
	AttachmentIcon,
	ChevronRightIcon,
	ExternalLinkIcon,
	HamburgerIcon,
	LockIcon,
	Search2Icon,
	SearchIcon,
	UnlockIcon,
	ViewIcon
} from "@chakra-ui/icons";
import { Button, Link, Text } from "@chakra-ui/react";
import { RiArrowRightUpLine, RiLockPasswordLine } from "react-icons/ri";
import { useEffect, useState } from "react";

import { MdShowChart } from "react-icons/md";
import { universalLogout } from "@/api";
import { useAuth } from "@/context";
import { useRouter } from "next/router";

export default function Sidebar() {
	const { firebaseUser } = useAuth();
	const router = useRouter();
	const currentRoute = location.pathname;
	const [isCollapsed, setIsCollapsed] = useState<boolean>(
		JSON.parse(localStorage.getItem("sidebarCollapsed") || "false")
	);
	const [isFullyExpanded, setIsFullyExpanded] = useState(true);

	useEffect(() => {
		if (!isCollapsed) {
			const timer = setTimeout(() => setIsFullyExpanded(true), 100);
			return () => clearTimeout(timer);
		} else {
			setIsFullyExpanded(false);
		}
	}, [isCollapsed]);

	useEffect(() => {
		// Retrieve the collapsed state from localStorage
		const collapsedState = localStorage.getItem("sidebarCollapsed");
		if (collapsedState) {
			setIsCollapsed(JSON.parse(collapsedState));
		}
	}, []);

	const handleLogout = async () => {
		try {
			await universalLogout();
			router.push("/explore");
		} catch (error) {
			console.error(error);
		}
	};

	const handleLogin = () => {
		router.push("/login");
	};

	const toggleCollapse = () => {
		const newCollapsedState = !isCollapsed;
		setIsCollapsed(newCollapsedState);
		// Save the collapsed state to localStorage
		localStorage.setItem("sidebarCollapsed", JSON.stringify(newCollapsedState));
	};

	return (
		<div
			className={`bg-gray-800 text-white ${isCollapsed ? "w-20" : "w-60"} p-7 shadow-lg top-0 left-0 h-full transition-width duration-300 transition-ease`}
		>
			<div className="flex flex-col gap-4 h-full">
				<div className="flex flex-row justify-between items-start">
					{!isCollapsed && (
						<div className="flex flex-col justify-center ml-10">
							<img src="/favicon.ico" alt="Logo" style={{ height: "90px" }} />
							<img src="/logo.png" alt="Caspr" style={{ height: "30px" }} />
						</div>
					)}
					<Button
						onClick={toggleCollapse}
						variant="ghost"
						size="xl"
						colorScheme="white"
						className={`p-3 ${isCollapsed ? "justify-center w-full" : ""} hover:bg-gray-500 hover:bg-opacity-50`}
					>
						{isCollapsed ? (
							<ChevronRightIcon boxSize={5} />
						) : (
							<HamburgerIcon boxSize={5} />
						)}
					</Button>
				</div>
				{!isCollapsed && (
					<>
						{firebaseUser && (
							<>
								<Link href="/upload-file">
									<Button
										colorScheme="gray"
										size="md"
										className="w-full"
										rightIcon={<ArrowForwardIcon />}
									>
										{isFullyExpanded && "Upload a File"}
									</Button>
								</Link>

								<Link
									className={`hover:text-gray-400`}
									onClick={() => router.push("/")}
								>
									<Text
										className={`${currentRoute === "/" ? "text-gray-400" : ""}`}
									>
										{isFullyExpanded && "My Graphs"}
									</Text>
								</Link>

								<Link
									className={`hover:text-gray-400`}
									onClick={() => router.push("/sharedWithMe")}
								>
									<Text
										className={`${currentRoute === "/sharedWithMe" ? "text-gray-400" : ""}`}
									>
										{isFullyExpanded && "Shared with Me"}
									</Text>
								</Link>
							</>
						)}
						<Link
							className={`hover:text-gray-400`}
							onClick={() => router.push("/explore")}
						>
							<Text
								className={`${currentRoute === "/explore" ? "text-gray-400" : ""}`}
							>
								{isFullyExpanded && "Explore"}
							</Text>
						</Link>

						<div className="flex flex-col gap-2 mt-auto">
							{firebaseUser && (
								<>
									<Button
										colorScheme="blue"
										onClick={handleLogout}
										size="md"
										className="w-full"
									>
										Logout
									</Button>

									<Link href="/forgot-password">
										<Button size="md" className="w-full">
											Reset Password
										</Button>
									</Link>
								</>
							)}
							{!firebaseUser && (
								<>
									<Button
										colorScheme="blue"
										onClick={handleLogin}
										size="md"
										className="w-full"
									>
										Login
									</Button>
								</>
							)}
							<Button
								as="a"
								href="https://docs.google.com/document/d/1PY3aDcpMCG_7qnzSSssFF1nvCmY3Tb28pG5efoUcyBk/edit?usp=sharing"
								target="_blank"
								rel="noopener noreferrer"
								size="md"
								className="w-full mt-2"
								variant="link"
							>
								Open User Guide{" "}
								<RiArrowRightUpLine className="ml-2" size={16} />
							</Button>
						</div>
					</>
				)}
				{isCollapsed && (
					<>
						{firebaseUser && (
							<>
								<Link
									href="/upload-file"
									className={`hover:text-gray-400 justify-center w-full mt-4`}
								>
									<AttachmentIcon boxSize={5} />
								</Link>

								<Link
									className={`hover:text-gray-400 justify-center w-full mt-4`}
									onClick={() => router.push("/")}
								>
									<MdShowChart
										size={20}
										color={currentRoute === "/" ? "gray" : ""}
									/>
								</Link>

								<Link
									className={`hover:text-gray-400 justify-center w-full mt-4`}
									onClick={() => router.push("/sharedWithMe")}
								>
									<ViewIcon
										boxSize={5}
										color={currentRoute === "/sharedWithMe" ? "gray" : ""}
									/>
								</Link>
							</>
						)}
						<Link
							className={`hover:text-gray-400 justify-center w-full mt-4`}
							onClick={() => router.push("/explore")}
						>
							<SearchIcon
								boxSize={5}
								color={currentRoute === "/explore" ? "gray" : ""}
							/>
						</Link>

						<div className="flex flex-col gap-2 mt-auto justify-center w-full">
							{firebaseUser && (
								<>
									<Link
										className={`hover:text-gray-400 justify-center w-full mt-4`}
										onClick={handleLogout}
									>
										<UnlockIcon boxSize={5} />
									</Link>
									<Link
										href="/forgot-password"
										className={`hover:text-gray-400 justify-center w-full mb-4 mt-6`}
									>
										<RiLockPasswordLine size={20} />
									</Link>
								</>
							)}

							{!firebaseUser && (
								<Link
									className={`hover:text-gray-400 justify-center w-full mt-4 mb-4`}
									onClick={handleLogin}
								>
									<LockIcon boxSize={5} />
								</Link>
							)}

							<Link
								href="https://docs.google.com/document/d/1PY3aDcpMCG_7qnzSSssFF1nvCmY3Tb28pG5efoUcyBk/edit?usp=sharing"
								isExternal
								className="hover:text-gray-400 justify-center w-full mt-4"
							>
								<RiArrowRightUpLine size={20} />{" "}
							</Link>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
