"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PredictionResult } from "@/lib/types";
import RiskBadge from "./RiskBadge";
import ConfidenceBar from "./ConfidenceBar";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, ArrowLeft, BarChart2, CheckCircle, ExternalLink,
  Heart, Cigarette, Stethoscope, TrendingUp, RefreshCw, Home
} from "lucide-react";
import Link from "next/link";

const riskConfig = {
  low: {
    gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: "✅",
    title: "Low Risk Detected",
    action: "Continue maintaining your healthy lifestyle and schedule regular check-ups.",
  },
  moderate: {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "⚠️",
    title: "Moderate Risk Detected",
    action: "Consult a healthcare professional for further evaluation and consider lifestyle modifications.",
  },
  high: {
    gradient: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "🚨",
    title: "High Risk Detected",
    action: "Seek prompt consultation with a qualified healthcare professional for proper clinical assessment.",
  },
};

const impactColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const resources = [
  { name: "WHO – Lung Cancer", url: "https://www.who.int/news-room/fact-sheets/detail/cancer", desc: "World Health Organization lung cancer facts" },
  { name: "American Cancer Society", url: "https://www.cancer.org/cancer/types/lung-cancer.html", desc: "Comprehensive lung cancer information" },
  { name: "National Cancer Institute", url: "https://www.cancer.gov/types/lung", desc: "Research-backed lung cancer resources" },
  { name: "Lung Cancer Research Foundation", url: "https://www.lungcancerresearchfoundation.org", desc: "Latest research and patient support" },
];

export default function ResultsContent() {
  const router = useRouter();
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("conan_result");
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.timestamp = new Date(parsed.timestamp);
      setResult(parsed);
    }
  }, []);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <BarChart2 className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No results found</p>
        <p className="text-sm text-slate-500">Complete an assessment to see your results here.</p>
        <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Home className="w-4 h-4" /> Go to Home
        </Link>
      </div>
    );
  }

  const cfg = riskConfig[result.riskLevel];
  const presentFactors = result.factors.filter((f) => f.present);
  const absentFactors = result.factors.filter((f) => !f.present);

  const typeLabel = {
    symptoms: "Symptom-Based Assessment",
    imaging: "X-Ray Imaging Analysis",
    combined: "Combined Assessment",
  }[result.type];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-slate-300">|</span>
        <span className="text-sm text-slate-500">{typeLabel}</span>
        <span className="ml-auto text-xs text-slate-400">
          {result.timestamp.toLocaleDateString()} {result.timestamp.toLocaleTimeString()}
        </span>
      </div>

      {/* Risk Level Hero Card */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.gradient} text-white p-6`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">{typeLabel}</p>
              <h1 className="text-2xl font-bold">{cfg.icon} {cfg.title}</h1>
            </div>
            <RiskBadge level={result.riskLevel} size="lg" />
          </div>
          <p className="text-white/90 text-sm leading-relaxed mb-4">{result.summary}</p>
          <div className="bg-white/10 border border-white/20 rounded-xl p-4">
            <ConfidenceBar confidence={result.confidence} riskLevel={result.riskLevel} />
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Medical Disclaimer:</strong> These results are for <strong>screening and awareness purposes only</strong>.
          They do not constitute a medical diagnosis. Always consult a qualified healthcare professional for clinical evaluation.
        </p>
      </div>

      {/* Risk Factor Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">Risk Factor Breakdown</h2>
        {presentFactors.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Present Risk Factors</p>
            <div className="flex flex-wrap gap-2">
              {presentFactors.map((f) => (
                <span
                  key={f.name}
                  className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border", impactColors[f.impact])}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {f.name}
                  <span className="opacity-60 capitalize">({f.impact})</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {absentFactors.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Not Present</p>
            <div className="flex flex-wrap gap-2">
              {absentFactors.map((f) => (
                <span key={f.name} className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {f.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actionable Insights */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">Actionable Insights & Recommendations</h2>
        <div className="space-y-3">
          <div className={cn("rounded-xl border p-4", cfg.bg, cfg.border)}>
            <p className={cn("text-sm font-semibold mb-1", cfg.text)}>Primary Recommendation</p>
            <p className="text-sm text-slate-700">{cfg.action}</p>
          </div>

          {result.riskLevel !== "low" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-700">Screening Recommendations</p>
              </div>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Low-dose CT (LDCT) scan for high-risk individuals aged 50–80</li>
                <li>• Annual chest X-ray monitoring if recommended by your physician</li>
                <li>• Pulmonary function tests to assess lung health</li>
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-green-700">Lifestyle Modifications</p>
            </div>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Quit smoking or avoid secondhand smoke exposure</li>
              <li>• Maintain a healthy BMI through balanced diet and exercise</li>
              <li>• Reduce alcohol consumption</li>
              <li>• Avoid exposure to radon, asbestos, and air pollutants</li>
            </ul>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cigarette className="w-4 h-4 text-orange-600" />
              <p className="text-sm font-semibold text-orange-700">Smoking Cessation Guidance</p>
            </div>
            <p className="text-sm text-slate-700">
              Quitting smoking is the single most effective way to reduce lung cancer risk. Seek support
              through nicotine replacement therapy, counseling, or cessation programs. Consult your
              healthcare provider for personalized cessation strategies.
            </p>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <p className="text-sm font-semibold text-purple-700">Early Detection Information</p>
            </div>
            <p className="text-sm text-slate-700">
              Early-stage lung cancer often has no symptoms. Regular screening for high-risk individuals
              can detect cancer at a more treatable stage. When to consult a doctor: persistent cough
              over 3 weeks, unexplained weight loss, coughing blood, or worsening breathlessness.
            </p>
          </div>
        </div>
      </div>

      {/* Expert Resources */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">Expert Guidance & Trusted Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resources.map(({ name, url, desc }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">{name}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <BarChart2 className="w-4 h-4" /> View Dashboard
        </Link>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> New Assessment
        </Link>
      </div>
    </div>
  );
}
