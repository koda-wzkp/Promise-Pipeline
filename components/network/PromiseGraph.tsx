"use client";

import { useMemo, useState, useCallback } from "react";
import { Promise as PromiseType, Agent, Threat } from "@/lib/types/promise";
import { buildPromiseGraph, layoutGraph, countDependents } from "@/lib/simulation/graph";
import { identifyHighLeverageNodes } from "@/lib/simulation/scoring";
import { GraphNodeComponent } from "./GraphNode";
import { GraphEdgeComponent } from "./GraphEdge";

interface PromiseGraphProps {
  promises: PromiseType[];
  agents: Agent[];
  threats?: Threat[];
  width?: number;
  height?: number;
  selectedPromiseId?: string | null;
  affectedIds?: Set<string>;
  certaintyAffectedIds?: Set<string>;
  onNodeClick?: (promiseId: string) => void;
  showAgentNodes?: boolean;
}

export function PromiseGraphView({
  promises,
  agents,
  threats = [],
  width = 800,
  height = 600,
  selectedPromiseId,
  affectedIds = new Set(),
  certaintyAffectedIds = new Set(),
  onNodeClick,
  showAgentNodes = true,
}: PromiseGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const graph = useMemo(() => {
    const raw = buildPromiseGraph(promises, agents, threats);
    return layoutGraph(raw, width, height);
  }, [promises, agents, threats, width, height]);

  const depCounts = useMemo(() => countDependents(promises), [promises]);

  const leverageScores = useMemo(() => {
    const nodes = identifyHighLeverageNodes(promises);
    const map = new Map<string, number>();
    for (const n of nodes) map.set(n.promiseId, n.leverage);
    return map;
  }, [promises]);

  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes]
  );

  const handleNodeClick = useCallback(
    (id: string) => {
      const node = nodeMap.get(id);
      if (node?.type === "promise" && onNodeClick) {
        onNodeClick(id);
      }
    },
    [nodeMap, onNodeClick]
  );

  const filteredNodes = showAgentNodes
    ? graph.nodes
    : graph.nodes.filter((n) => n.type === "promise");

  const filteredEdges = showAgentNodes
    ? graph.edges
    : graph.edges.filter(
        (e) => e.type === "depends_on" || e.type === "threat" || e.type === "verification_dependency"
      );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      style={{ maxHeight: height }}
    >
      <defs>
        <marker
          id="arrowhead-dep"
          viewBox="0 0 10 7"
          refX="9"
          refY="3.5"
          markerWidth="8"
          markerHeight="6"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
        <marker
          id="arrowhead-threat"
          viewBox="0 0 10 7"
          refX="9"
          refY="3.5"
          markerWidth="8"
          markerHeight="6"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#b91c1c" />
        </marker>
        <marker
          id="arrowhead-active"
          viewBox="0 0 10 7"
          refX="9"
          refY="3.5"
          markerWidth="8"
          markerHeight="6"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
        </marker>
        <marker
          id="arrowhead-verification"
          viewBox="0 0 10 7"
          refX="9"
          refY="3.5"
          markerWidth="8"
          markerHeight="6"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed" />
        </marker>
        <marker
          id="arrowhead-agent"
          viewBox="0 0 10 7"
          refX="9"
          refY="3.5"
          markerWidth="6"
          markerHeight="5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
        </marker>
      </defs>

      {/* Edges */}
      {filteredEdges.map((edge, i) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode || !targetNode) return null;

        const isActive =
          affectedIds.has(edge.source) || affectedIds.has(edge.target);

        return (
          <GraphEdgeComponent
            key={`${edge.source}-${edge.target}-${i}`}
            edge={edge}
            sourceNode={sourceNode}
            targetNode={targetNode}
            isActive={isActive}
          />
        );
      })}

      {/* Nodes */}
      {filteredNodes.map((node) => {
        const baseSize = 12;
        const leverage = leverageScores.get(node.id) || 0;
        const size = node.type === "promise" ? baseSize + leverage * 15 : baseSize;

        return (
          <GraphNodeComponent
            key={node.id}
            node={node}
            size={size}
            isSelected={selectedPromiseId === node.id}
            isAffected={affectedIds.has(node.id)}
            isCertaintyAffected={certaintyAffectedIds.has(node.id)}
            onClick={handleNodeClick}
          />
        );
      })}

      {/* Legend */}
      <g transform={`translate(10, ${height - 95})`}>
        <text className="text-[10px] fill-gray-500 font-medium" y={0}>
          Legend
        </text>
        <line x1={0} y1={12} x2={20} y2={12} stroke="#6b7280" strokeWidth={1.5} />
        <text className="text-[9px] fill-gray-500" x={24} y={15}>
          Dependency
        </text>
        <line
          x1={0}
          y1={26}
          x2={20}
          y2={26}
          stroke="#7c3aed"
          strokeWidth={1.5}
          strokeDasharray="6,3"
        />
        <text className="text-[9px] fill-gray-500" x={24} y={29}>
          Verification Dep.
        </text>
        <line
          x1={0}
          y1={40}
          x2={20}
          y2={40}
          stroke="#b91c1c"
          strokeWidth={1.5}
          strokeDasharray="4,3"
        />
        <text className="text-[9px] fill-gray-500" x={24} y={43}>
          Threat
        </text>
        <circle cx={5} cy={56} r={5} fill="#1a5f4a" opacity={0.85} />
        <text className="text-[9px] fill-gray-500" x={14} y={59}>
          = Node size shows leverage
        </text>
      </g>
    </svg>
  );
}
