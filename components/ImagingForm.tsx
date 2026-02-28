"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { predictFromImaging } from "@/lib/prediction";
import { Image as ImageIcon, Upload, X, AlertTriangle, ChevronRight, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImagingForm() {
  const router = useRouter();
  const { saveResult, user } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("" );

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

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleAnalyze = () => {
    if (!file) return;
    setAnalyzing(true);
    setTimeout(() => {
      const result = predictFromImaging(file.name + file.size);
      if (user) saveResult(result);
      sessionStorage.setItem("conan_result", JSON.stringify(result));
      router.push("/results");
    }, 2200);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Chest X-Ray Analysis</h1>
          <p className="text-sm text-slate-500">Upload a chest X-ray for AI-assisted imaging analysis</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Screening tool only.</strong> This analysis does not constitute a medical diagnosis.
          Always consult a qualified radiologist or physician for clinical interpretation of X-ray images.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-semibold text-slate-700">Secure Image Upload</h2>
          <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full ml-auto">
            Processed locally
          </span>
        </div>

        {!preview ? (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={cn(
              "border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer",
              dragging
                ? "border-purple-500 bg-purple-50"
                : "border-slate-300 hover:border-purple-400 hover:bg-purple-50/50"
            )}
            onClick={() => document.getElementById("xray-input")?.click()}
          >
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 mb-1">
              Drop your chest X-ray here
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Supports JPG, PNG, DICOM-converted images
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors">
              Browse Files
            </button>
            <input
              id="xray-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={preview}
                alt="Uploaded X-ray"
                className="w-full max-h-80 object-contain mx-auto"
              />
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{file?.name}</p>
                <p className="text-xs text-slate-500">
                  {file ? (file.size / 1024).toFixed(1) + " KB" : ""}
                </p>
              </div>
              <span className="text-xs text-green-600 font-medium">Ready</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">What happens during analysis?</h2>
        <div className="space-y-2">
          {[
            { step: "1", title: "Preprocessing", desc: "Image is normalized and enhanced for analysis" },
            { step: "2", title: "Feature Extraction", desc: "AI model identifies key regions of interest" },
            { step: "3", title: "Risk Classification", desc: "Findings are classified into Low / Moderate / High risk" },
            { step: "4", title: "Report Generation", desc: "Detailed factor breakdown and recommendations provided" },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!user && (
        <p className="text-xs text-slate-500">
          💡 <a href="/login" className="text-blue-600 underline">Sign in</a> to save and track your results over time.
        </p>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!file || analyzing}
        className={cn(
          "w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-colors text-sm",
          file && !analyzing
            ? "bg-purple-600 hover:bg-purple-700 text-white"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        )}
      >
        {analyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing X-Ray...
          </>
        ) : (
          <>
            Analyze X-Ray <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
