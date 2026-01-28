/**
 * Guest Photos Management
 * 
 * Stores photos locally BEFORE authentication.
 * Photos are saved in localStorage and memory, never uploaded until user logs in.
 */

interface GuestPhotos {
  frontPhotoBase64: string;
  sidePhotoBase64: string;
  timestamp: string;
}

const STORAGE_KEY = "guest_photos";

/**
 * Save guest photos to localStorage
 * Called after user confirms both photos but BEFORE authentication
 */
export function saveGuestPhotos(photos: { frontPhotoBase64: string; sidePhotoBase64: string }) {
  try {
    const data: GuestPhotos = {
      frontPhotoBase64: photos.frontPhotoBase64,
      sidePhotoBase64: photos.sidePhotoBase64,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("💾 [GuestPhotos] Saved guest photos to localStorage", {
      frontSize: photos.frontPhotoBase64.length,
      sideSize: photos.sidePhotoBase64.length,
      timestamp: data.timestamp,
    });

    return true;
  } catch (error) {
    console.error("❌ [GuestPhotos] Failed to save guest photos:", error);
    return false;
  }
}

/**
 * Load guest photos from localStorage
 * Called after user logs in on paywall
 */
export function loadGuestPhotos(): GuestPhotos | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      console.log("⚠️ [GuestPhotos] No guest photos found in localStorage");
      return null;
    }

    const data: GuestPhotos = JSON.parse(stored);
    
    console.log("✅ [GuestPhotos] Loaded guest photos from localStorage", {
      frontSize: data.frontPhotoBase64.length,
      sideSize: data.sidePhotoBase64.length,
      timestamp: data.timestamp,
      age: Math.round((Date.now() - new Date(data.timestamp).getTime()) / 1000) + "s",
    });

    return data;
  } catch (error) {
    console.error("❌ [GuestPhotos] Failed to load guest photos:", error);
    return null;
  }
}

/**
 * Clear guest photos from localStorage
 * Called after successful upload and analysis
 */
export function clearGuestPhotos() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🧹 [GuestPhotos] Cleared guest photos from localStorage");
  } catch (error) {
    console.error("❌ [GuestPhotos] Failed to clear guest photos:", error);
  }
}

/**
 * Check if guest photos exist
 */
export function hasGuestPhotos(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Get age of stored photos in seconds
 */
export function getGuestPhotosAge(): number | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: GuestPhotos = JSON.parse(stored);
    return Math.round((Date.now() - new Date(data.timestamp).getTime()) / 1000);
  } catch {
    return null;
  }
}
