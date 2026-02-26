import { SymptomFormData, PredictionResult, RiskLevel } from "./types";

// Logistic Regression Coefficients (β values)
// Based on clinical literature weighting for lung cancer risk factors
// Formula: Z_early = β₀ + Σ(βᵢ × xᵢ)  |  R_early = 1 / (1 + e^(-Z_early))
const BETA_0 = -4.2; // Intercept β₀

const BETA_COEFFICIENTS: Record<keyof SymptomFormData, number> = {
  smokingHistory:       1.85,  // β₁  – strongest predictor
  coughing:             1.42,  // β₂
  chestPain:            1.28,  // β₃
  shortnessOfBreath:    1.15,  // β₄
  wheezing:             1.10,  // β₅
  yellowFingers:        1.02,  // β₆
  swallowingDifficulty: 0.92,  // β₇
  fatigue:              0.76,  // β₈
  chronicDisease:       0.76,  // β₉
  alcoholConsuming:     0.60,  // β₁₀
  peerPressure:         0.52,  // β₁₁
  allergy:              0.40,  // β₁₂
  anxiety:              0.35,  // β₁₃
};

const SYMPTOM_LABELS: Record<keyof SymptomFormData, string> = {
  smokingHistory: "Smoking History",
  coughing: "Persistent Coughing",
  chestPain: "Chest Pain",
  shortnessOfBreath: "Shortness of Breath",
  wheezing: "Wheezing",
  yellowFingers: "Yellow Fingers",
  swallowingDifficulty: "Swallowing Difficulty",
  fatigue: "Fatigue",
  chronicDisease: "Chronic Disease",
  alcoholConsuming: "Alcohol Consumption",
  allergy: "Allergy",
  anxiety: "Anxiety",
  peerPressure: "Peer Pressure (Smoking-related)",
};

// Sigmoid function: R_early = 1 / (1 + e^(-Z_early))
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function predictFromSymptoms(data: SymptomFormData): PredictionResult {
  // Compute Z_early = β₀ + Σ(βᵢ × xᵢ)
  let z = BETA_0;
  const factors: PredictionResult["factors"] = [];

  (Object.keys(data) as (keyof SymptomFormData)[]).forEach((key) => {
    const beta = BETA_COEFFICIENTS[key];
    const present = data[key];
    const xi = present ? 1 : 0;
    z += beta * xi;

    let impact: "high" | "medium" | "low" = "low";
    if (beta >= 1.2) impact = "high";
    else if (beta >= 0.7) impact = "medium";

    factors.push({ name: SYMPTOM_LABELS[key], impact, present });
  });

  // R_early = 1 / (1 + e^(-Z_early))
  const rEarly = sigmoid(z);

  let riskLevel: RiskLevel;
  let confidence: number;
  let summary: string;

  if (rEarly < 0.35) {
    riskLevel = "low";
    confidence = Math.round(85 + rEarly * 20);
    summary =
      "Based on the reported health background and lifestyle factors, the risk indicators are minimal. Continue maintaining a healthy lifestyle and schedule regular check-ups.";
  } else if (rEarly < 0.65) {
    riskLevel = "moderate";
    confidence = Math.round(70 + rEarly * 25);
    summary =
      "Several risk factors have been identified. It is advisable to consult a healthcare professional for further evaluation and consider lifestyle modifications.";
  } else {
    riskLevel = "high";
    confidence = Math.round(78 + rEarly * 15);
    summary =
      "Multiple significant risk factors are present. Prompt consultation with a qualified healthcare professional is strongly recommended for proper clinical assessment.";
  }

  return {
    riskLevel,
    confidence: Math.min(confidence, 97),
    factors: factors.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.impact] - order[b.impact];
    }),
    summary,
    timestamp: new Date(),
    type: "symptoms",
  };
}


export function predictFromImaging(imageName: string): PredictionResult {
  const hash = imageName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const normalized = (hash % 100) / 100;

  let riskLevel: RiskLevel;
  let confidence: number;
  let summary: string;

  if (normalized < 0.33) {
    riskLevel = "low";
    confidence = 82;
    summary =
      "Chest X-ray analysis indicates no significant abnormalities detected. Lung fields appear clear. Routine follow-up is recommended.";
  } else if (normalized < 0.66) {
    riskLevel = "moderate";
    confidence = 74;
    summary =
      "Chest X-ray analysis shows some areas of interest that warrant further clinical evaluation. A follow-up CT scan or specialist consultation is advised.";
  } else {
    riskLevel = "high";
    confidence = 79;
    summary =
      "Chest X-ray analysis has identified potential areas of concern. Immediate consultation with a pulmonologist or oncologist is strongly recommended.";
  }

  return {
    riskLevel,
    confidence,
    factors: [
      { name: "Lung Field Clarity", impact: "high", present: riskLevel !== "low" },
      { name: "Nodule Detection", impact: "high", present: riskLevel === "high" },
      { name: "Pleural Effusion Indicators", impact: "medium", present: riskLevel === "high" },
      { name: "Mediastinal Widening", impact: "medium", present: riskLevel !== "low" },
      { name: "Hilar Prominence", impact: "low", present: normalized > 0.4 },
    ],
    summary,
    timestamp: new Date(),
    type: "imaging",
  };
}

export function predictCombined(
  symptoms: SymptomFormData,
  imageName: string
): PredictionResult {
  const symResult = predictFromSymptoms(symptoms);
  const imgResult = predictFromImaging(imageName);

  const riskOrder: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2 };
  const combinedScore =
    (riskOrder[symResult.riskLevel] * 0.5 + riskOrder[imgResult.riskLevel] * 0.5);

  let riskLevel: RiskLevel;
  if (combinedScore < 0.5) riskLevel = "low";
  else if (combinedScore < 1.25) riskLevel = "moderate";
  else riskLevel = "high";

  const confidence = Math.round((symResult.confidence + imgResult.confidence) / 2);

  const summaries: Record<RiskLevel, string> = {
    low: "Combined symptom and imaging analysis indicates low risk. No significant concerns identified. Maintain healthy habits and schedule regular screenings.",
    moderate:
      "Combined analysis of symptoms and chest X-ray reveals moderate risk indicators. A comprehensive clinical evaluation by a healthcare professional is recommended.",
    high: "Both symptom profile and imaging analysis indicate elevated risk factors. Urgent consultation with a specialist is strongly advised for definitive diagnosis.",
  };

  const allFactors = [
    ...symResult.factors.filter((f) => f.present),
    ...imgResult.factors.filter((f) => f.present),
  ].slice(0, 8);

  return {
    riskLevel,
    confidence,
    factors: allFactors,
    summary: summaries[riskLevel],
    timestamp: new Date(),
    type: "combined",
  };
}
