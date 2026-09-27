import { GraphCategory } from '@/types/museum';

export type MapState = 
  | 'IDLE' 
  | 'HOVERED' 
  | 'SELECTING' 
  | 'SELECTED' 
  | 'TRANSITIONING' 
  | 'DESELECTING';

export type QualityTier = 'HIGH' | 'MEDIUM' | 'LOW';

export const MUSEUM_PALETTE = {
  background: '#F4EBDD',
  secondary: '#EEECE5',
  surface: '#FFF9EF',
  parchment: '#E9DBC5',
  particleGold: '#DCC79D',
  particleGold2: '#C9AC72',
  particleFaded: '#E9DCC4',
  text: '#2F241C',
  secondaryText: '#756555',
  accentBrass: '#A47745',
  terracotta: '#9A5F43',
} as const;

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
  keyFacts?: string[];
  historicalContext?: string;
  whyItMatters?: string;
  cluster?: string;
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
  notes?: string;
}
