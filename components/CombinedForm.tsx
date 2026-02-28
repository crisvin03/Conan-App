"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { SymptomFormData } from "@/lib/types";
import { predictCombined } from "@/lib/prediction";
import { Layers, Activity, Image as ImageIcon, Upload, X, AlertTriangle, ChevronRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const symptoms: { key: keyof SymptomFormData; label: string }[] = [
  { key: "smokingHistory", label: "Smoking History" },
  { key: "coughing", label: "Persistent Coughing" },
  { key: "chestPain", label: "Chest Pain" },
  { key: "shortnessOfBreath", label: "Shortness of Breath" },
  { key: "wheezing", label: "Wheezing" },
  { key: "yellowFingers", label: "Yellow Fingers" },
  { key: "swallowingDifficulty", label: "Swallowing Difficulty" },
  { key: "fatigue", label: "Fatigue" },
  { key: "chronicDisease", label: "Chronic Disease" },
  { key: "alcoholConsuming", label: "Alcohol Consumption" },
  { key: "peerPressure", label: "Peer Pressure" },
  { key: "allergy", label: "Allergy" },
  { key: "anxiety", label: "Anxiety" },
];

const defaultForm: SymptomFormData = {
  coughing: false, shortnessOfBreath: false, swallowingDifficulty: false,
  chestPain: false, wheezing: false, fatigue: false, allergy: false,
  smokingHistory: false, yellowFingers: false, anxiety: false,
  peerPressure: false, chronicDisease: false, alcoholConsuming: false,
};

export default function CombinedForm() {
  const router = useRouter();
  const { saveResult, user } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<SymptomFormData>(defaultForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");

  const toggle = (key: keyof SymptomFormData) => setForm((p) => ({ ...p, [key]: !p[key] }));

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleAnalyze = () => {
    if (!file) return;
    setAnalyzing(true);
    setTimeout(() => {
      const result = predictCombined(form, file.name + file.size);
      if (user) saveResult(result);
      sessionStorage.setItem("conan_result", JSON.stringify(result));
      router.push("/results");
    }, 2500);
  };

  const selectedCount = Object.values(form).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Combined Assessment</h1>
          <p className="text-sm text-slate-500">Symptom history + chest X-ray for comprehensive analysis</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Screening tool only.</strong> Combined analysis provides a more comprehensive risk picture
          but is not a substitute for professional medical evaluation.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        {[
          { n: 1, label: "Symptoms", icon: Activity },
          { n: 2, label: "X-Ray Upload", icon: ImageIcon },
        ].map(({ n, label, icon: Icon }, idx) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                step > n ? "bg-teal-600 text-white" : step === n ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"
              )}
            >
              {step > n ? <CheckCircle className="w-4 h-4" /> : n}
            </div>
            <span className={cn("text-sm font-medium", step >= n ? "text-teal-700" : "text-slate-400")}>{label}</span>
            {idx === 0 && <div className="flex-1 h-0.5 bg-slate-200 mx-2"><div className={cn("h-full bg-teal-500 transition-all", step > 1 ? "w-full" : "w-0")} /></div>}
          </div>
        ))}
      </div>

      {/* Step 1: Symptoms */}
      {step === 1 && (
        <>
          {/* Personal Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-100">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Age</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g., 25"
                  className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female")}
                  className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-semibold text-slate-700">Step 1: Symptom Checklist</h2>
              <span className="ml-auto text-xs text-slate-500">{selectedCount}/{symptoms.length} selected</span>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {symptoms.map(({ key, label }) => {
              const isYes = form[key];
              return (
                <div
                  key={key}
                  onClick={() => toggle(key)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer transition-all",
                    isYes ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/30"
                  )}
                >
                  <span className={cn("text-sm font-medium", isYes ? "text-teal-800" : "text-slate-700")}>{label}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (!isYes) toggle(key); }}
                      className={cn("px-2.5 py-1 rounded-lg text-xs font-bold", isYes ? "bg-teal-600 text-white" : "bg-white border border-slate-300 text-slate-500")}
                    >YES</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (isYes) toggle(key); }}
                      className={cn("px-2.5 py-1 rounded-lg text-xs font-bold", !isYes ? "bg-slate-600 text-white" : "bg-white border border-slate-300 text-slate-500")}
                    >NO</button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setStep(2)}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            Continue to X-Ray Upload <ChevronRight className="w-4 h-4" />
          </button>
          </div>
        </>
      )}

      {/* Step 2: X-Ray */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-semibold text-slate-700">Step 2: Upload Chest X-Ray</h2>
            </div>

            {!preview ? (
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                className={cn(
                  "border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer",
                  dragging ? "border-teal-500 bg-teal-50" : "border-slate-300 hover:border-teal-400 hover:bg-teal-50/50"
                )}
                onClick={() => document.getElementById("combined-xray")?.click()}
              >
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700 mb-1">Drop your chest X-ray here</p>
                <p className="text-xs text-slate-500 mb-4">JPG, PNG supported</p>
                <button className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                  Browse Files
                </button>
                <input id="combined-xray" type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  <img src={preview} alt="X-ray" className="w-full max-h-64 object-contain" />
                  <button onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center">{file?.name}</p>
              </div>
            )}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
            <p className="text-xs text-teal-800 font-medium">
              ✓ Symptom data captured: <strong>{selectedCount}</strong> risk factors marked as YES
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              ← Back to Symptoms
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!file || analyzing}
              className={cn(
                "flex-2 flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-colors text-sm",
                file && !analyzing ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              {analyzing ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
              ) : (
                <>Run Combined Analysis <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
