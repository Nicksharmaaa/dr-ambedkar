"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search,
  Layers,
  Sparkles,
  BookOpen,
  Calendar,
  Share2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
  GitBranch,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  CytoscapeNode,
  CytoscapeEdge,
  CytoscapeNodeData,
  WhyConnectedResponse,
  EntityItem,
} from "@/lib/types";
import WhyConnectedModal from "@/components/graph/WhyConnectedModal";

// Load Cytoscape dynamically on client only to avoid SSR issues
const CytoscapeCanvas = dynamic(() => import("@/components/graph/CytoscapeCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[550px] bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500">
      <RefreshCw className="w-6 h-6 animate-spin mr-2" />
      <span>Loading Archival Knowledge Canvas...</span>
    </div>
  ),
});

const ROOT_ENTITY_ID = "person-ambedkar";

const FILTER_TYPES = [
  "ALL",
  "WORK",
  "CONCEPT",
  "EVENT",
  "PERSON",
  "PLACE",
  "ORGANIZATION",
];

export default function KnowledgeMapPage() {
  const [centerId, setCenterId] = useState<string>(ROOT_ENTITY_ID);
  const [nodes, setNodes] = useState<CytoscapeNode[]>([]);
  const [edges, setEdges] = useState<CytoscapeEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<CytoscapeNodeData | null>(null);
  const [selectedEntityDetails, setSelectedEntityDetails] = useState<EntityItem | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [whyModalOpen, setWhyModalOpen] = useState<boolean>(false);
  const [whyData, setWhyData] = useState<WhyConnectedResponse | null>(null);
  const [whyLoading, setWhyLoading] = useState<boolean>(false);

  // Load neighborhood
  const loadNeighborhood = useCallback(async (entityId: string) => {
    setIsLoading(true);
    try {
      const data = await api.getGraphNeighborhood(entityId, 1, 40);
      setNodes(data.nodes);
      setEdges(data.edges);

      // Select center node by default
      const rootNode = data.nodes.find((n) => n.data.id === entityId);
      if (rootNode) {
        setSelectedNode(rootNode.data);
      }
      // Also fetch full entity details
      const ent = await api.getEntity(entityId);
      setSelectedEntityDetails(ent);
    } catch (err) {
      console.error("Failed to load knowledge graph neighborhood", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNeighborhood(centerId);
  }, [centerId, loadNeighborhood]);

  // Handle node selection from canvas
  const handleSelectNode = async (nodeData: CytoscapeNodeData) => {
    setSelectedNode(nodeData);
    try {
      const ent = await api.getEntity(nodeData.id);
      setSelectedEntityDetails(ent);
    } catch (err) {
      console.error("Failed to fetch entity details", err);
    }
  };

  // Expand selected node to become the new center
  const handleExpandNode = (nodeId: string) => {
    setCenterId(nodeId);
  };

  // Execute Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await api.searchGraph(searchQuery, filterType !== "ALL" ? filterType : undefined, 8);
      setSearchResults(res.entities);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  // Trigger "Why Are These Connected?" feature
  const handleExplainConnection = async (targetId: string) => {
    setWhyLoading(true);
    try {
      const source = centerId === targetId ? ROOT_ENTITY_ID : centerId;
      const res = await api.whyConnected(source, targetId);
      setWhyData(res);
      setWhyModalOpen(true);
    } catch (err) {
      console.error("Why connected failed", err);
      alert("No direct archival relationship recorded between these entities.");
    } finally {
      setWhyLoading(false);
    }
  };

  // Filter nodes for canvas
  const filteredNodes = filterType === "ALL"
    ? nodes
    : nodes.filter((n) => n.data.type === filterType || n.data.id === centerId);

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.data.id));
  const filteredEdges = edges.filter(
    (e) => filteredNodeIds.has(e.data.source) && filteredNodeIds.has(e.data.target)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Intelligent Knowledge Map
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Archival Provenance
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Evidence-grounded semantic graph connecting Dr. Ambedkar&apos;s works, speeches, and concepts
              </p>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph (e.g. Caste, Dewey, Rupee)..."
              className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition w-64 md:w-80"
            />
          </form>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Canvas & Filter Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800/80">
            <div className="flex flex-wrap gap-1">
              {FILTER_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    filterType === type
                      ? "bg-amber-500 text-slate-950 font-semibold shadow"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 px-2">
              Viewing {filteredNodes.length} nodes • {filteredEdges.length} verified connections
            </div>
          </div>

          {/* Search Results Dropdown (if search active) */}
          {searchResults.length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Search Matches ({searchResults.length})</span>
                <button
                  onClick={() => setSearchResults([])}
                  className="text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {searchResults.map((ent) => (
                  <button
                    key={ent.id}
                    onClick={() => {
                      setCenterId(ent.id);
                      setSearchResults([]);
                    }}
                    className="p-2 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
                  >
                    <div className="text-xs font-medium text-white truncate">
                      {ent.canonical_name}
                    </div>
                    <div className="text-[10px] text-amber-400">
                      {ent.entity_type} • {ent.connection_count} links
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cytoscape Graph Canvas */}
          <div className="flex-1 min-h-[580px]">
            <CytoscapeCanvas
              nodes={filteredNodes}
              edges={filteredEdges}
              selectedNodeId={selectedNode?.id || null}
              onSelectNode={handleSelectNode}
            />
          </div>
        </div>

        {/* Right Column: Node Inspector & Evidence Explainability (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {selectedNode ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col space-y-5">
              {/* Type & Status Header */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {selectedNode.type}
                </span>
                <span className="flex items-center text-xs text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified Provenance
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedNode.label}
                </h2>
                {selectedNode.year && (
                  <div className="flex items-center text-xs text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    <span>{selectedNode.year}</span>
                  </div>
                )}
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {selectedNode.description || selectedEntityDetails?.description || "No archival abstract available."}
                </p>
              </div>

              {/* Aliases / Variant Spellings */}
              {selectedEntityDetails?.aliases && selectedEntityDetails.aliases.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Archival Variations & Aliases
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEntityDetails.aliases.map((alias, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Signature Feature: Why Are These Connected? */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => handleExplainConnection(selectedNode.id)}
                  disabled={whyLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>
                    {whyLoading
                      ? "Resolving Archival Evidence..."
                      : selectedNode.id === ROOT_ENTITY_ID
                      ? "Explain Core Relationships"
                      : "Why is this connected?"}
                  </span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <button
                  onClick={() => handleExpandNode(selectedNode.id)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition text-center flex items-center justify-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Expand Node</span>
                </button>

                <Link
                  href={`/assistant?q=${encodeURIComponent(`Tell me about ${selectedNode.label} in Dr. Ambedkar's corpus with archival citations.`)}`}
                  className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-medium transition text-center flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Assistant</span>
                </Link>
              </div>

              {/* Primary Document Deep Link */}
              {selectedEntityDetails?.object_id && (
                <div className="pt-3 border-t border-slate-800">
                  <Link
                    href={`/documents/${selectedEntityDetails.object_id}/viewer`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition text-xs group"
                  >
                    <div className="flex items-center space-x-2 text-slate-300">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Open Primary Archival Volume</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-500 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-medium">Select any node on the canvas</p>
              <p className="text-xs text-slate-600">
                Click a node to inspect verified provenance, aliases, and evidence-backed relations.
              </p>
            </div>
          )}

          {/* Quick Context Card */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Evidence-First Principles
            </div>
            <p className="leading-relaxed">
              Every edge in this knowledge graph is anchored to verified archival passages in Babasaheb Ambedkar: Writings and Speeches (BAWS).
            </p>
          </div>
        </div>
      </div>

      {/* Signature "Why Are These Connected?" Modal */}
      <WhyConnectedModal
        data={whyData}
        isOpen={whyModalOpen}
        onClose={() => setWhyModalOpen(false)}
      />
    </div>
  );
}
