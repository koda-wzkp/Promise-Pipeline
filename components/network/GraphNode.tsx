"use client";

import { GraphNode as GraphNodeType } from "@/lib/types/simulation";
import { getStatusColor, agentColors } from "@/lib/utils/colors";

interface GraphNodeProps {
  node: GraphNodeType;
  size: number;
  isSelected: boolean;
  isAffected: boolean;
  isCertaintyAffected?: boolean;
  onClick: (id: string) => void;
}

export function GraphNodeComponent({
  node,
  size,
  isSelected,
  isAffected,
  isCertaintyAffected = false,
  onClick,
}: GraphNodeProps) {
  const x = node.x || 0;
  const y = node.y || 0;

  if (node.type === "agent") {
    const color = agentColors[node.label.toLowerCase()] || "#6b7280";
    return (
      <g>
        <rect
          x={x - 20}
          y={y - 12}
          width={40}
          height={24}
          rx={4}
          fill="white"
          stroke={color}
          strokeWidth={1.5}
          className="cursor-default"
        />
        <text
          x={x}
          y={y + 4}
          textAnchor="middle"
          className="text-[9px] font-mono fill-gray-600 pointer-events-none"
        >
          {node.label.length > 6 ? node.id : node.label}
        </text>
      </g>
    );
  }

  const color = node.status ? getStatusColor(node.status) : "#6b7280";
  const radius = Math.max(12, size);

  return (
    <g
      onClick={() => onClick(node.id)}
      className="cursor-pointer"
      role="button"
      aria-label={`Promise ${node.id}: ${node.label}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(node.id);
        }
      }}
    >
      <circle
        cx={x}
        cy={y}
        r={radius + 4}
        fill="transparent"
        stroke={isSelected ? "#2563eb" : isCertaintyAffected ? "#7c3aed" : "transparent"}
        strokeWidth={2}
        strokeDasharray={isCertaintyAffected && !isSelected ? "4,3" : "none"}
      />
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        opacity={isAffected ? 1 : 0.85}
        className={isAffected ? "cascade-pulse" : ""}
      />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        className="text-[10px] font-mono fill-white pointer-events-none font-bold"
      >
        {node.id}
      </text>

      {/* Tooltip on hover */}
      <title>
        {node.id}: {node.label}
        {node.status ? ` (${node.status})` : ""}
      </title>
    </g>
  );
}
