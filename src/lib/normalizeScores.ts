/**
 * Score Normalization Utility
 * 
 * Handles key mapping between AI response format (snake_case) 
 * and UI display format, ensuring all aspects are properly mapped.
 */

export interface NormalizedScores {
  overall: number | null;
  skinQuality: number | null;
  jawline: number | null;
  cheekbones: number | null;
  symmetry: number | null;
  eyeArea: number | null;
  potential: number | null;
}

/**
 * Normalize scores from AI response or database
 * 
 * Handles multiple key formats:
 * - snake_case: skin_quality, jawline_definition, facial_symmetry, eye_area
 * - camelCase: skinQuality, jawline, symmetry, eyeArea
 * 
 * Returns all 7 canonical keys with values or null (never 0 by default)
 */
export function normalizeScores(rawScores: any): NormalizedScores {
  if (!rawScores || typeof rawScores !== 'object') {
    console.warn("[SCORES] Invalid scores object:", rawScores);
    return {
      overall: null,
      skinQuality: null,
      jawline: null,
      cheekbones: null,
      symmetry: null,
      eyeArea: null,
      potential: null,
    };
  }

  // Helper to get value with multiple possible keys
  const getValue = (...keys: string[]): number | null => {
    for (const key of keys) {
      const value = rawScores[key];
      // Use nullish coalescing - only reject null/undefined, not 0
      if (value !== null && value !== undefined) {
        const num = Number(value);
        return isNaN(num) ? null : num;
      }
    }
    return null;
  };

  const normalized: NormalizedScores = {
    overall: getValue('overall'),
    skinQuality: getValue('skinQuality', 'skin_quality'),
    jawline: getValue('jawline', 'jawline_definition', 'jawlineDefinition'),
    cheekbones: getValue('cheekbones'),
    symmetry: getValue('symmetry', 'facial_symmetry', 'facialSymmetry'),
    eyeArea: getValue('eyeArea', 'eye_area'),
    potential: getValue('potential'),
  };

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[SCORES_RAW] Input:", rawScores);
  console.log("[SCORES_NORM] Output:", normalized);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return normalized;
}

/**
 * Format score for display
 * Returns "—" for null/undefined, number otherwise
 */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return "—";
  }
  return String(Math.round(score));
}

/**
 * Get progress value for UI (0-100)
 * Returns 0 for null (disabled state), actual value otherwise
 */
export function getProgressValue(score: number | null | undefined): number {
  if (score === null || score === undefined) {
    return 0;
  }
  return Math.max(0, Math.min(100, score));
}
