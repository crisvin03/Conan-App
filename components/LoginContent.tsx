"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { LogIn, User, Mail, Eye, EyeOff, Activity } from "lucide-react";

export default function LoginContent() {
  const router = useRouter();
  const { user, login, logout } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    login(name.trim(), email.trim());
    router.push("/dashboard");
  };

  if (user) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Account</h1>
            <p className="text-sm text-slate-500">Manage your session</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">{user.name}</h2>
          <p className="text-sm text-slate-500 mb-1">{user.email}</p>
          <p className="text-xs text-slate-400 mb-6">{user.results.length} saved assessment(s)</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              View Dashboard
            </button>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <LogIn className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Sign In</h1>
          <p className="text-sm text-slate-500">Save and track your assessment results</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-semibold text-blue-800">Why sign in?</p>
        </div>
        <ul className="text-xs text-blue-700 space-y-0.5">
          <li>• Save assessment results for future reference</li>
          <li>• Track risk trends over time in the dashboard</li>
          <li>• Access your history from any device</li>
        </ul>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showEmail ? "text" : "email"}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="Enter your email"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowEmail(!showEmail)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            <LogIn className="w-4 h-4" />
            Sign In & Save Results
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-4">
          No password required. Data is stored locally on your device.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <p className="text-xs text-slate-600">
          🔒 <strong>Privacy:</strong> Your data is stored locally in your browser and never sent to external servers.
          You can delete all data at any time from{" "}
          <a href="/settings" className="text-blue-600 underline">Settings</a>.
        </p>
      </div>
    </div>
  );
}
