import {
	createContext,
	useContext,
	useState,
	ReactNode
} from "react";
import { Graph, GraphContextType } from "@/types"

// Create Context
const graphContext = createContext<GraphContextType>({
    graphs: [],
    setGraphs: () => {
      throw new Error("setGraphs function must be used within a GraphsProvider");
    }, // Placeholder to prevent undefined issues
  });

// Create a provider component

export const GraphsProvider = ({ children }: { children: ReactNode }) => {
  const [graphs, setGraphs] = useState<Graph[]>([])


  return (
    <graphContext.Provider value={{ graphs, setGraphs }}>
      {children}
    </graphContext.Provider>
  );
};

// Create a custom hook to use the context
export const useGraph = () => useContext(graphContext);
