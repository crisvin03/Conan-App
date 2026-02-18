"use client";

import { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const config: Record<RiskLevel, { label: string; bg: string; text: string; ring: string; dot: string }> = {
  low: {
    label: "Low Risk",
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-200",
    dot: "bg-green-500",
  },
  moderate: {
    label: "Moderate Risk",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  high: {
    label: "High Risk",
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-200",
    dot: "bg-red-500",
  },
};

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
}

export default function RiskBadge({ level, size = "md" }: RiskBadgeProps) {
  const c = config[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full ring-1",
        c.bg, c.text, c.ring,
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-3 py-1",
        size === "lg" && "text-base px-4 py-1.5"
      )}
    >
      <span className={cn("rounded-full flex-shrink-0", c.dot, size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")} />
      {c.label}
    </span>
  );
}
