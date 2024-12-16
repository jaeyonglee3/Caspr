import * as d3 from "d3";

export interface NodeType extends d3.SimulationNodeDatum {
	id: string;
	label: string;
	value: number;
	category: string;
}


export interface Timestamp {
	i: number,
	nodes: NodeType[]
}