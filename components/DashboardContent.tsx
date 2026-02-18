"use client";

import { useApp } from "@/lib/context";
import { PredictionResult } from "@/lib/types";
import RiskBadge from "./RiskBadge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { BarChart2, Activity, Image as ImageIcon, Layers, LogIn, TrendingUp, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const RISK_COLORS = { low: "#16a34a", moderate: "#d97706", high: "#dc2626" };

export default function DashboardContent() {
  const { user } = useApp();

  if (!user) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Results Dashboard</h1>
            <p className="text-sm text-slate-500">Track your assessment history and trends</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Sign In to View Dashboard</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Create an account or sign in to save your assessment results and track risk trends over time.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              Sign In
            </Link>
            <Link href="/" className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              Take Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const results = user.results;

  if (results.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <DashboardHeader />
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">No Results Yet</h2>
          <p className="text-sm text-slate-500 mb-6">Complete an assessment to see your results and trends here.</p>
          <Link href="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
            Start Assessment
          </Link>
        </div>
      </div>
    );
  }

  const riskCounts = { low: 0, moderate: 0, high: 0 };
  results.forEach((r) => riskCounts[r.riskLevel]++);

  const pieData = [
    { name: "Low Risk", value: riskCounts.low, color: RISK_COLORS.low },
    { name: "Moderate Risk", value: riskCounts.moderate, color: RISK_COLORS.moderate },
    { name: "High Risk", value: riskCounts.high, color: RISK_COLORS.high },
  ].filter((d) => d.value > 0);

  const barData = results.slice(0, 10).reverse().map((r, i) => ({
    name: `#${i + 1}`,
    confidence: r.confidence,
    risk: r.riskLevel === "low" ? 1 : r.riskLevel === "moderate" ? 2 : 3,
    fill: RISK_COLORS[r.riskLevel],
  }));

  const trendData = results.slice(0, 10).reverse().map((r, i) => ({
    name: `#${i + 1}`,
    riskScore: r.riskLevel === "low" ? 1 : r.riskLevel === "moderate" ? 2 : 3,
    confidence: r.confidence,
  }));

  const latestResult = results[0];
  const typeIcons = { symptoms: Activity, imaging: ImageIcon, combined: Layers };
  const TypeIcon = typeIcons[latestResult.type];

  return (
    <div className="space-y-6 animate-fadeIn">
      <DashboardHeader />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Assessments", value: results.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Low Risk", value: riskCounts.low, color: "text-green-600", bg: "bg-green-50" },
          { label: "Moderate Risk", value: riskCounts.moderate, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "High Risk", value: riskCounts.high, color: "text-red-600", bg: "bg-red-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border border-slate-200`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Latest Result */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700">Latest Assessment</h2>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 capitalize">{latestResult.type} Assessment</p>
              <p className="text-xs text-slate-500">{new Date(latestResult.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <RiskBadge level={latestResult.riskLevel} />
        </div>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">{latestResult.summary}</p>
        <div className="mt-3 flex gap-2">
          <Link href="/results" className="text-xs text-blue-600 hover:underline font-medium">View Full Results →</Link>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Confidence Scores</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}%`, "Confidence"]} />
              <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Analysis */}
      {results.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-700">Risk Trend Analysis</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(v) => ["", "Low", "Mod", "High"][v]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v, name) => [name === "riskScore" ? ["Low", "Moderate", "High"][Number(v) - 1] : `${v}%`, name === "riskScore" ? "Risk Level" : "Confidence"]} />
              <Legend />
              <Line type="monotone" dataKey="riskScore" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Risk Level" />
              <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Confidence %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Assessment History</h2>
        <div className="space-y-2">
          {results.map((r, i) => {
            const Icon = typeIcons[r.type];
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 capitalize">{r.type} Assessment</p>
                  <p className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{r.confidence}%</span>
                  <RiskBadge level={r.riskLevel} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> New Assessment
        </Link>
      </div>
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
        <BarChart2 className="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-800">Results Dashboard</h1>
        <p className="text-sm text-slate-500">Interactive risk analysis and trend visualization</p>
      </div>
    </div>
  );
}
