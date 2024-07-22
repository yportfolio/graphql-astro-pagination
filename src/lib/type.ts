// The type for the allPeople field
export interface AllPeople {
  edges: Edge[];
  pageInfo: PageInfo;
  totalCount: number;
}

// The type for each edge in the edges array
export interface Edge {
  cursor: string;
  node: Node;
}

// The type for the node within each edge
export interface Node {
  name: string;
}

// The type for the pageInfo field
export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
}
