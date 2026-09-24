"use client";

import React, { useEffect, useRef } from "react";
import cytoscape, { Core, EventObject } from "cytoscape";
import { CytoscapeNode, CytoscapeEdge, CytoscapeNodeData, CytoscapeEdgeData } from "@/lib/types";
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";

interface CytoscapeCanvasProps {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeData: CytoscapeNodeData) => void;
  onSelectEdge?: (edgeData: CytoscapeEdgeData) => void;
}

const TYPE_COLORS: Record<string, string> = {
  PERSON: "#F59E0B", // amber
  WORK: "#3B82F6", // blue
  BOOK: "#3B82F6",
  SPEECH: "#06B6D4", // cyan
  MANUSCRIPT: "#60A5FA",
  DOCUMENT: "#93C5FD",
  CONCEPT: "#8B5CF6", // purple
  TOPIC: "#A855F7",
  EVENT: "#10B981", // emerald
  PLACE: "#EC4899", // pink
  ORGANIZATION: "#14B8A6", // teal
  CONSTITUENT_ASSEMBLY_DEBATE: "#F97316", // orange
  COLLECTION: "#EAB308",
};

export default function CytoscapeCanvas({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onSelectEdge,
}: CytoscapeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert nodes and edges into Cytoscape format
    const cyElements = [
      ...nodes.map((n) => ({
        group: "nodes" as const,
        data: {
          id: n.data.id,
          label: n.data.label,
          type: n.data.type,
          description: n.data.description,
          status: n.data.status,
          year: n.data.year,
          degree: n.data.degree || 1,
          color: TYPE_COLORS[n.data.type] || "#94A3B8",
        },
      })),
      ...edges.map((e) => ({
        group: "edges" as const,
        data: {
          id: e.data.id,
          source: e.data.source,
          target: e.data.target,
          label: e.data.label,
          status: e.data.status,
          confidence: e.data.confidence,
          has_evidence: e.data.has_evidence,
        },
      })),
    ];

    if (!cyRef.current) {
      const cy = cytoscape({
        container: containerRef.current,
        elements: cyElements,
        style: [
          {
            selector: "node",
            style: {
              label: "data(label)",
              "background-color": "data(color)",
              color: "#F8FAFC",
              "font-size": "12px",
              "font-weight": "bold",
              "text-valign": "bottom",
              "text-margin-y": 8,
              "text-outline-color": "#0F172A",
              "text-outline-width": 2,
              width: "mapData(degree, 1, 15, 34, 60)",
              height: "mapData(degree, 1, 15, 34, 60)",
              "border-width": 2,
              "border-color": "#1E293B",
              "transition-property": "background-color, border-color, width, height",
              "transition-duration": 0.2,
            },
          },
          {
            selector: "node:selected",
            style: {
              "border-width": 4,
              "border-color": "#F59E0B",
              "border-opacity": 1,
            },
          },
          {
            selector: "edge",
            style: {
              width: 1.5,
              "line-color": "#334155",
              "target-arrow-color": "#475569",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              label: "data(label)",
              "font-size": "9px",
              color: "#94A3B8",
              "text-rotation": "autorotate",
              "text-margin-y": -6,
              "text-background-color": "#0F172A",
              "text-background-opacity": 0.8,
              "text-background-padding": "2px",
            },
          },
          {
            selector: "edge:selected",
            style: {
              width: 3,
              "line-color": "#F59E0B",
              "target-arrow-color": "#F59E0B",
              color: "#FCD34D",
            },
          },
          {
            selector: "edge[?has_evidence]",
            style: {
              "line-style": "solid",
            },
          },
        ],
        layout: {
          name: "cose",
          idealEdgeLength: 120,
          nodeOverlap: 20,
          refresh: 20,
          fit: true,
          padding: 50,
          randomize: false,
          componentSpacing: 100,
          nodeRepulsion: 400000,
          edgeElasticity: 100,
          nestingFactor: 5,
          gravity: 80,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
        },
        minZoom: 0.3,
        maxZoom: 3.0,
        wheelSensitivity: 0.2,
      });

      cy.on("tap", "node", (evt: EventObject) => {
        const node = evt.target;
        onSelectNode(node.data());
      });

      cy.on("tap", "edge", (evt: EventObject) => {
        if (onSelectEdge) {
          const edge = evt.target;
          onSelectEdge(edge.data());
        }
      });

      cyRef.current = cy;
    } else {
      const cy = cyRef.current;
      cy.elements().remove();
      cy.add(cyElements);
      cy.layout({
        name: "cose",
        idealEdgeLength: 120,
        fit: true,
        padding: 50,
        randomize: false,
      }).run();
    }

    if (selectedNodeId && cyRef.current) {
      const selected = cyRef.current.$id(selectedNodeId);
      if (selected.length > 0) {
        selected.select();
      }
    }
  }, [nodes, edges, onSelectNode, onSelectEdge, selectedNodeId]);

  const handleZoomIn = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    if (cyRef.current) cyRef.current.fit(undefined, 50);
  };

  const handleResetLayout = () => {
    if (cyRef.current) {
      cyRef.current
        .layout({
          name: "cose",
          idealEdgeLength: 120,
          fit: true,
          padding: 50,
        })
        .run();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[550px] bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Cytoscape Container */}
      <div ref={containerRef} className="w-full h-full min-h-[550px]" />

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl p-1.5 shadow-lg z-10">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          title="Fit to Screen"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetLayout}
          title="Relayout Graph"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Type Legend Pill */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-xl bg-slate-900/85 backdrop-blur border border-slate-800/80 rounded-xl p-2 shadow-md z-10 text-[11px]">
        {Object.entries(TYPE_COLORS).slice(0, 7).map(([type, color]) => (
          <span key={type} className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-300">
            <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
            {type.replace(/_/g, " ")}
          </span>
        ))}
      </div>
    </div>
  );
}
