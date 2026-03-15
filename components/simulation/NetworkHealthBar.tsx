"use client";

interface NetworkHealthBarProps {
  score: number;
  label?: string;
  showLabel?: boolean;
}

function getHealthColor(score: number): string {
  if (score >= 80) return "#1a5f4a";
  if (score >= 60) return "#2563eb";
  if (score >= 40) return "#b45309";
  return "#b91c1c";
}

export function NetworkHealthBar({
  score,
  label = "Network Health",
  showLabel = true,
}: NetworkHealthBarProps) {
  const color = getHealthColor(score);

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="font-bold" style={{ color }}>
            {Math.round(score)}/100
          </span>
        </div>
      )}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
