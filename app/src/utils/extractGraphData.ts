
import { NodeType, Timestamp} from "@/types"

// Checks if the data is in the timestamp format
const isTimestampFormat = (data: any): boolean => {
	// Check if data has timestamps and time_unit as a key
	const requiredKeys = ["timestamps", "time_unit"];
	const hasRequiredKeys = requiredKeys.every((key) => key in data);

	return hasRequiredKeys;
};

export const parseGraphData = (json: string) => {

    const data = JSON.parse(json);
    let parsed_data;

    if (isTimestampFormat(data)) {
        parsed_data =  new Set<string>(data.timestamps.flatMap((timestamp: Timestamp) => timestamp.nodes.map((node: NodeType) => node.label)))
    } else{
        parsed_data = new Set<string>(data.nodes.flatMap((node: NodeType) => node.label))
    }
    
    return [...parsed_data]
}
