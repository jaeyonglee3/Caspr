import { Timestamp } from "firebase-admin/firestore";
import { ViewPosition } from "./camera";

/**
 * Represents a graph object from a Firebase document.
 * @Samuel @Terry
 */
export interface Graph {
	id?: string;
	owner: string; // UID of the owner
	graphName: string;
	graphDescription: string;
	graphVisibility: boolean;
	graphTags: string[],
	graphFilePath: string;
	graphFileURL: string;
	graphURL: string;
	createdAt: Timestamp;
	sharing?: SharedUser[];
	sharedEmails?: string[];
	presets?: Preset[];
}

/**
 * Props for GraphList component used in home page
 * @Jaeyong
 */
export interface GraphListProps {
	isLoading: boolean;
	graphs: Graph[] | undefined;
	page: string;
	sortOptions?: { value: string; label: string }[];
	filterOptions?: { value: string; label: string }[];
	sortType?: string;
	setSortType?: React.Dispatch<React.SetStateAction<string>>;
	filterType?: string;
	setFilterType?: React.Dispatch<React.SetStateAction<string>>;
	search: string
}

/**
 * Props for MyGraphObject component used in home page
 * @Jaeyong @Samuel
 */
interface MyGraphCardProps {
	graph: Graph;
	owner: User;
}

/**
 * Represents a preset for graph viewing and manipulation.
 * @Samuel
 */
export interface Preset {
	name: string;
	updated: Timestamp;
	filters: string[] | null;
	pathways: string[] | null;
	view: ViewPosition | null;
}


/**
 * Represents possible roles for shared access
 * @Samuel
 */
export enum GraphRole {
	VIEWER = 0
}

/**
 * SharedUser interface
 * @Samuel
 */
interface SharedUser {
	uid?: string;
	email: string;
	status: "pending" | "accepted";
	role: GraphRole;
	presetAccess: string[];
	addedAt: Timestamp;
	addedBy: string;
	acceptedAt?: Timestamp;
}

/**
 * Graph Context Type
 * @Terry
 */
interface GraphContextType {
	graphs: Graph[];
	setGraphs: Dispatch<SetStateAction<Graph[]>>;
}
