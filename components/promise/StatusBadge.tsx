import { PromiseStatus } from "@/lib/types/promise";
import { statusColors, statusBgColors } from "@/lib/utils/colors";

const statusLabels: Record<PromiseStatus, string> = {
  verified: "Verified",
  declared: "Declared",
  degraded: "Degraded",
  violated: "Violated",
  unverifiable: "Unverifiable",
};

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: PromiseStatus;
  size?: "xs" | "sm" | "md";
}) {
  const color = statusColors[status];
  const bg = statusBgColors[status];

  const sizeClasses = {
    xs: "text-xs px-1.5 py-0.5",
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]}`}
      style={{ color, backgroundColor: bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: color }}
      />
      {statusLabels[status]}
    </span>
  );
}
