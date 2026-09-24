"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Share2,
  Filter,
  Search,
  BookOpen,
  Info,
  ChevronRight,
  ExternalLink,
  Layers,
} from "lucide-react";

interface GraphNode {
  id: string;
  name: string;
  category: "person" | "institution" | "concept" | "event" | "publication";
  details: string;
  connections: { targetId: string; relation: string }[];
  linkedDocId?: string;
}

const GRAPH_NODES: GraphNode[] = [
  {
    id: "ambedkar",
    name: "Dr. B.R. Ambedkar",
    category: "person",
    details: "Jurist, economist, social reformer, Chairman of Constitution Drafting Committee.",
    connections: [
      { targetId: "columbia", relation: "Studied At (M.A., Ph.D.)" },
      { targetId: "dewey", relation: "Mentored By" },
      { targetId: "lse", relation: "Doctoral Degree (D.Sc.)" },
      { targetId: "annihilation", relation: "Authored (1936)" },
      { targetId: "rupee", relation: "Authored (1923)" },
      { targetId: "cad", relation: "Chaired Drafting Committee" },
      { targetId: "mahad", relation: "Led Satyagraha (1927)" },
      { targetId: "rbi", relation: "Foundational Intellectual Guide" },
    ],
  },
  {
    id: "columbia",
    name: "Columbia University",
    category: "institution",
    details: "New York institution where Dr. Ambedkar studied economics, politics, and sociology (1913–1916).",
    connections: [
      { targetId: "ambedkar", relation: "Alumnus" },
      { targetId: "dewey", relation: "Faculty of Philosophy" },
    ],
  },
  {
    id: "dewey",
    name: "Prof. John Dewey",
    category: "person",
    details: "American pragmatist philosopher whose democratic theories profoundly shaped Dr. Ambedkar's conception of democracy as associated living.",
    connections: [{ targetId: "ambedkar", relation: "Intellectual Mentor" }],
  },
  {
    id: "lse",
    name: "London School of Economics",
    category: "institution",
    details: "Premier British institution where Dr. Ambedkar earned his Master of Science and Doctor of Science degrees in economics.",
    connections: [
      { targetId: "ambedkar", relation: "Alumnus (D.Sc.)" },
      { targetId: "rupee", relation: "Dissertation Venue" },
    ],
  },
  {
    id: "annihilation",
    name: "Annihilation of Caste",
    category: "publication",
    details: "1936 monumental monograph analyzing caste endogamy, religious orthodoxy, and human equality.",
    connections: [{ targetId: "ambedkar", relation: "Authored By" }],
    linkedDocId: "baws-vol01-annihilation",
  },
  {
    id: "rupee",
    name: "The Problem of the Rupee",
    category: "publication",
    details: "1923 doctoral dissertation examining monetary policy, exchange standards, and currency stability.",
    connections: [
      { targetId: "ambedkar", relation: "Authored By" },
      { targetId: "rbi", relation: "Influenced RBI Genesis" },
    ],
    linkedDocId: "baws-vol06-rupee",
  },
  {
    id: "rbi",
    name: "Reserve Bank of India",
    category: "institution",
    details: "Central banking institution formed in 1935 following the recommendations of the Hilton Young Commission, which drew heavily on Dr. Ambedkar's treatise.",
    connections: [{ targetId: "rupee", relation: "Conceptual Foundation" }],
  },
  {
    id: "mahad",
    name: "Mahad Satyagraha (1927)",
    category: "event",
    details: "Pioneering civil rights movement asserting public access to water at Chhadar Tank.",
    connections: [{ targetId: "ambedkar", relation: "Led By" }],
  },
  {
    id: "cad",
    name: "Constitution of India",
    category: "concept",
    details: "Supreme law of the Republic of India, drafted under Dr. Ambedkar's chairmanship between 1947 and 1949.",
    connections: [{ targetId: "ambedkar", relation: "Chief Architect" }],
    linkedDocId: "baws-vol13-cad-final-speech",
  },
];

export default function KnowledgeMapPage() {
  const [selectedNode, setSelectedNode] = useState<GraphNode>(GRAPH_NODES[0]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNodes = GRAPH_NODES.filter((n) => {
    const matchesCat = filterCategory === "all" || n.category === filterCategory;
    const matchesSearch =
      searchQuery === "" || n.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "person":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "institution":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "publication":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "event":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "concept":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase">
            <Share2 className="h-3.5 w-3.5" />
            <span>Relational Intelligence</span>
          </div>
          <h1 className="mt-1 text-3xl font-serif font-bold text-slate-100">
            Archival Knowledge Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore interconnected entities, intellectual mentors, institutions, and legal treatises
            in Dr. Ambedkar&apos;s corpus.
          </p>
        </div>

        {/* Filter / Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80"
          />
        </div>
      </div>

      {/* Categories Filter */}
      <div className="my-4 flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="text-slate-400 text-[11px] font-mono uppercase mr-1">Filter:</span>
        {[
          { id: "all", label: "All Entities" },
          { id: "person", label: "Persons" },
          { id: "institution", label: "Institutions" },
          { id: "publication", label: "Treatises & Publications" },
          { id: "event", label: "Historical Events" },
          { id: "concept", label: "Legal Concepts" },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterCategory === c.id
                ? "bg-amber-500 text-slate-950 font-semibold"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Canvas & Entity Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Entity Node Matrix (Canvas Representation) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 min-h-[420px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 text-xs">
              <span className="font-mono text-slate-400 text-[11px] uppercase">
                Active Nodes ({filteredNodes.length})
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                Click any node to inspect relationships
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20 scale-105"
                        : `${getCategoryColor(node.category)} hover:scale-102`
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                    <span>{node.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Powered by Turso Graph schema (entities + relations tables)</span>
            <span className="font-mono">Sigma.js WebGL Ready</span>
          </div>
        </div>

        {/* Selected Node Details Sidebar */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${getCategoryColor(
                  selectedNode.category
                )}`}
              >
                {selectedNode.category}
              </span>
              <span className="font-mono text-slate-400 text-[10px]">ID: {selectedNode.id}</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-100">{selectedNode.name}</h2>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">{selectedNode.details}</p>
          </div>

          {/* Connected Edges */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-mono uppercase text-amber-400 font-semibold mb-3 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>Relations ({selectedNode.connections.length})</span>
            </h3>

            <div className="space-y-2">
              {selectedNode.connections.map((conn, idx) => {
                const targetNode = GRAPH_NODES.find((n) => n.id === conn.targetId);
                return (
                  <div
                    key={idx}
                    onClick={() => targetNode && setSelectedNode(targetNode)}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-amber-500/90 block">
                        {conn.relation}
                      </span>
                      <span className="text-slate-200 font-medium">
                        {targetNode?.name || conn.targetId}
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Linked Primary Record Link */}
          {selectedNode.linkedDocId && (
            <div className="pt-4 border-t border-slate-800">
              <Link
                href={`/documents/${selectedNode.linkedDocId}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Open Archival Record</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
