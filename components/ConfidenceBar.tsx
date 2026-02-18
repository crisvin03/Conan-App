"use client";

import { cn } from "@/lib/utils";
import { RiskLevel } from "@/lib/types";

interface ConfidenceBarProps {
  confidence: number;
  riskLevel: RiskLevel;
}

const colorMap: Record<RiskLevel, string> = {
  low: "bg-green-500",
  moderate: "bg-amber-500",
  high: "bg-red-500",
};

export default function ConfidenceBar({ confidence, riskLevel }: ConfidenceBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600 font-medium">Confidence Score</span>
        <span className="font-bold text-slate-800">{confidence}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", colorMap[riskLevel])}
          style={{ width: `${confidence}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">
        Model confidence in this prediction based on provided inputs
      </p>
    </div>
  );
}
