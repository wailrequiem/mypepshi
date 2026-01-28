import { supabase } from "../supabase";

export interface PeptideExplanation {
  why_this: string[];
  how_to_use_safely: string[];
  what_to_expect: string;
  warnings: string[];
}

export interface ExplainPeptideParams {
  peptide: {
    name: string;
    fit_score?: number;
    tags?: string[];
    summary?: string;
  };
  userContext?: {
    scanScores?: {
      skinQuality?: number;
      jawline?: number;
      eyeArea?: number;
      symmetry?: number;
      overall?: number;
    };
    notes?: Record<string, unknown>;
    goals?: string[];
  };
}

// In-memory cache for explanations
const explanationCache = new Map<string, PeptideExplanation>();

export async function explainPeptide(
  params: ExplainPeptideParams
): Promise<PeptideExplanation> {
  try {
    const cacheKey = params.peptide.name;

    // Check cache first
    if (explanationCache.has(cacheKey)) {
      console.log(`[explainPeptide] Cache hit for: ${cacheKey}`);
      return explanationCache.get(cacheKey)!;
    }

    console.log(`[explainPeptide] Fetching explanation for: ${cacheKey}`);

    // Call the edge function
    const response = await supabase.functions.invoke("explain-peptide", {
      body: params,
    });

    if (response.error) {
      console.error("[explainPeptide] Edge function error:", response.error);
      throw response.error;
    }

    if (!response.data || !response.data.ok) {
      console.error("[explainPeptide] Invalid response:", response.data);
      throw new Error("Invalid response from explanation service");
    }

    const explanation = response.data.explanation;

    // Validate and provide defaults
    const validatedExplanation: PeptideExplanation = {
      why_this: Array.isArray(explanation.why_this)
        ? explanation.why_this
        : ["This peptide may support your wellness goals."],
      how_to_use_safely: Array.isArray(explanation.how_to_use_safely)
        ? explanation.how_to_use_safely
        : [
            "This is for educational purposes only.",
            "Consult a healthcare professional before use.",
          ],
      what_to_expect:
        typeof explanation.what_to_expect === "string"
          ? explanation.what_to_expect
          : "Results vary by individual. Professional guidance is recommended.",
      warnings: Array.isArray(explanation.warnings)
        ? explanation.warnings
        : [
            "Not medical advice.",
            "Consult a healthcare professional before use.",
          ],
    };

    // Cache the result
    explanationCache.set(cacheKey, validatedExplanation);

    return validatedExplanation;
  } catch (error) {
    console.error("[explainPeptide] Error:", error);

    // Return soft fallback - no scary error UI
    return {
      why_this: [
        "This peptide has been selected based on your goals and scan results.",
        "It may support various aspects of your wellness journey.",
      ],
      how_to_use_safely: [
        "This information is for educational purposes only.",
        "Always consult a qualified healthcare professional before using any peptide.",
        "Follow professional guidance for proper administration and dosing.",
      ],
      what_to_expect:
        "Individual results vary. Peptides typically require consistent use over weeks to months. Professional monitoring is recommended.",
      warnings: [
        "Not intended as medical advice.",
        "Not recommended for individuals under 18 or pregnant/nursing.",
        "Consult your healthcare provider about potential interactions with medications or existing conditions.",
      ],
    };
  }
}
