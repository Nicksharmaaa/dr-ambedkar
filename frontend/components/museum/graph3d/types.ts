import { GraphCategory } from '@/types/museum';

export interface Graph3DNode {
  id: string;
  label: string;
  category: GraphCategory | string;
  shortDesc: string;
  year?: number | string;
  date?: string;
  linkedDocId?: string;
  imageUrl?: string;
  significance: string;
  color: string;
  aliases?: string[];
  bawsVolume?: string;
  provenanceCitation?: string;
  status?: 'VERIFIED' | 'CANDIDATE' | 'REJECTED' | string;
  degree?: number;
  isCenter?: boolean;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  __threeObj?: any;
}

export interface Graph3DLink {
  id: string;
  source: string | Graph3DNode;
  target: string | Graph3DNode;
  relation: string;
  confidence?: number;
  status?: string;
  has_evidence?: boolean;
  notes?: string;
}

export interface Graph3DData {
  nodes: Graph3DNode[];
  links: Graph3DLink[];
}

export type FilterCategory = 
  | 'ALL' 
  | 'person' 
  | 'work' 
  | 'organization' 
  | 'event' 
  | 'concept' 
  | 'place' 
  | 'media';

export interface ConnectedEntitySummary {
  node: Graph3DNode;
  relation: string;
  isOutgoing: boolean;
}
