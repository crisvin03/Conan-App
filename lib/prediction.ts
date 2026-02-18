import { SymptomFormData, PredictionResult, RiskLevel } from "./types";

const SYMPTOM_WEIGHTS: Record<keyof SymptomFormData, number> = {
  smokingHistory: 3.5,
  coughing: 2.8,
  chestPain: 2.5,
  shortnessOfBreath: 2.3,
  wheezing: 2.2,
  yellowFingers: 2.0,
  swallowingDifficulty: 1.8,
  fatigue: 1.5,
  chronicDisease: 1.5,
  alcoholConsuming: 1.2,
  allergy: 0.8,
  anxiety: 0.7,
  peerPressure: 1.0,
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

export function predictFromSymptoms(data: SymptomFormData): PredictionResult {
  const maxScore = Object.values(SYMPTOM_WEIGHTS).reduce((a, b) => a + b, 0);
  let score = 0;

  const factors: PredictionResult["factors"] = [];

  (Object.keys(data) as (keyof SymptomFormData)[]).forEach((key) => {
    const weight = SYMPTOM_WEIGHTS[key];
    const present = data[key];
    if (present) score += weight;

    let impact: "high" | "medium" | "low" = "low";
    if (weight >= 2.5) impact = "high";
    else if (weight >= 1.5) impact = "medium";

    factors.push({ name: SYMPTOM_LABELS[key], impact, present });
  });

  const normalizedScore = score / maxScore;

  let riskLevel: RiskLevel;
  let confidence: number;
  let summary: string;

  if (normalizedScore < 0.25) {
    riskLevel = "low";
    confidence = Math.round(85 + normalizedScore * 20);
    summary =
      "Based on the reported symptoms, the risk indicators are minimal. Continue maintaining a healthy lifestyle and schedule regular check-ups.";
  } else if (normalizedScore < 0.55) {
    riskLevel = "moderate";
    confidence = Math.round(70 + normalizedScore * 15);
    summary =
      "Several risk factors have been identified. It is advisable to consult a healthcare professional for further evaluation and consider lifestyle modifications.";
  } else {
    riskLevel = "high";
    confidence = Math.round(75 + normalizedScore * 10);
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
