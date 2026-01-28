/**
 * Pending Scan Management
 * 
 * Handles guest onboarding + photos storage before authentication,
 * and automatic flush to Supabase after login/signup.
 */

export interface PendingScan {
  onboarding: Record<string, any>;
  frontImage: string; // base64 dataURL
  sideImage: string; // base64 dataURL
  timestamp: number;
}

const STORAGE_KEY = "pending_scan";

/**
 * Save guest onboarding + photos to localStorage
 */
export function savePendingScan(data: {
  onboarding: Record<string, any>;
  frontImage: string;
  sideImage: string;
}): boolean {
  try {
    const payload: PendingScan = {
      onboarding: data.onboarding,
      frontImage: data.frontImage,
      sideImage: data.sideImage,
      timestamp: Date.now(),
    };

    const serialized = JSON.stringify(payload);
    const sizeKB = Math.round(serialized.length / 1024);

    console.log(`💾 [PENDING] Saving pending_scan (${sizeKB} KB)`);

    localStorage.setItem(STORAGE_KEY, serialized);
    
    console.log("✅ [PENDING] Saved pending_scan successfully");
    return true;
  } catch (error) {
    console.error("❌ [PENDING] Failed to save pending_scan:", error);
    
    // If localStorage is full, try to clear old data
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("⚠️ [PENDING] localStorage quota exceeded, attempting cleanup...");
      try {
        // Clear old guest photos if they exist
        localStorage.removeItem("guest_photos");
        // Try again
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          onboarding: data.onboarding,
          frontImage: data.frontImage,
          sideImage: data.sideImage,
          timestamp: Date.now(),
        }));
        console.log("✅ [PENDING] Saved after cleanup");
        return true;
      } catch (retryError) {
        console.error("❌ [PENDING] Failed even after cleanup:", retryError);
      }
    }
    
    return false;
  }
}

/**
 * Load pending scan from localStorage
 */
export function loadPendingScan(): PendingScan | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log("ℹ️ [PENDING] No pending_scan found");
      return null;
    }

    const parsed = JSON.parse(stored) as PendingScan;
    
    // Validate structure
    if (!parsed.frontImage || !parsed.sideImage || !parsed.onboarding) {
      console.warn("⚠️ [PENDING] Invalid pending_scan structure, clearing...");
      clearPendingScan();
      return null;
    }

    const ageMinutes = Math.round((Date.now() - parsed.timestamp) / 60000);
    console.log(`✅ [PENDING] Found pending_scan (${ageMinutes} minutes old)`);
    
    return parsed;
  } catch (error) {
    console.error("❌ [PENDING] Failed to load pending_scan:", error);
    clearPendingScan(); // Clear corrupted data
    return null;
  }
}

/**
 * Check if pending scan exists
 */
export function hasPendingScan(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

/**
 * Clear pending scan from localStorage
 */
export function clearPendingScan(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ [PENDING] Cleared pending_scan");
  } catch (error) {
    console.error("❌ [PENDING] Failed to clear pending_scan:", error);
  }
}

/**
 * Get pending scan size in KB
 */
export function getPendingScanSize(): number | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return Math.round(stored.length / 1024);
  } catch {
    return null;
  }
}
