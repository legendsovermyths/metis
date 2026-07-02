export type StructureKind = "array" | "tree" | "graph" | "hash";

export interface ArrayPointer {
  id: string;
  label: string;
  index: number;
}

export interface ArrayData {
  cells: string[];
  pointers: ArrayPointer[];
  boxes: number[];
  highlights: number[];
}

export interface TreeNode {
  id: string;
  label: string;
  parent: string | null;
}

export interface TreePointer {
  id: string;
  nodeId: string;
  label: string;
}

export interface TreeArrow {
  id: string;
  from: string;
  to: string;
}

export interface TreeData {
  nodes: TreeNode[];
  root: string | null;
  boxes: string[];
  highlights: string[];
  folded: string[];
  pointers: TreePointer[];
  arrows: TreeArrow[];
  /** Weight of the edge to a node's parent, keyed by child node id. */
  weights: Record<string, string>;
}

export interface GraphNode {
  id: string;
  label: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  directed: boolean;
  weight: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  boxes: string[];
  highlights: string[];
  pointers: TreePointer[];
}

export interface HashEntry {
  id: string;
  key: string;
  value: string;
}

export interface HashPointer {
  id: string;
  entryId: string;
  label: string;
}

export interface HashData {
  entries: HashEntry[];
  size: number;
  highlights: string[];
  pointers: HashPointer[];
}

export function defaultData(kind: StructureKind): unknown {
  switch (kind) {
    case "array":
      return { cells: ["", "", ""], pointers: [], boxes: [], highlights: [] } satisfies ArrayData;
    case "tree":
      return {
        nodes: [{ id: "root", label: "", parent: null }],
        root: "root",
        boxes: [],
        highlights: [],
        folded: [],
        pointers: [],
        arrows: [],
        weights: {},
      } satisfies TreeData;
    case "graph":
      return {
        nodes: [{ id: "n1", label: "" }],
        edges: [],
        boxes: [],
        highlights: [],
        pointers: [],
      } satisfies GraphData;
    case "hash":
      return { entries: [], size: 8, highlights: [], pointers: [] } satisfies HashData;
    default:
      return {};
  }
}
