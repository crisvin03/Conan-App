"use client";

import { useApp } from "@/lib/context";
import { WifiOff, BookOpen } from "lucide-react";
import Link from "next/link";

export default function OfflineBanner() {
  const { isOnline } = useApp();

  if (isOnline) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-3 text-sm text-amber-800">
      <WifiOff className="w-4 h-4 flex-shrink-0 text-amber-600" />
      <span className="flex-1">
        You are offline. Some features are unavailable. Symptom assessment is still accessible.
      </span>
      <Link
        href="/manual"
        className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2"
      >
        <BookOpen className="w-3.5 h-3.5" />
        Lung Cancer Info
      </Link>
    </div>
  );
}
