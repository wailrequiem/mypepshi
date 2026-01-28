/**
 * Photo Upload to Supabase Storage (PRIVATE bucket)
 * 
 * Handles uploading photos to a PRIVATE Supabase Storage bucket.
 * Photos are stored by user ID and scan ID.
 * Database stores PATHS (not URLs) for security.
 * UI generates signed URLs on-demand for display.
 */

import { supabase } from "./supabase";

interface UploadResult {
  frontImagePath: string;
  sideImagePath: string;
  frontImageUrl: string;  // Signed URL for immediate AI analysis
  sideImageUrl: string;   // Signed URL for immediate AI analysis
}

/**
 * Convert base64 to Blob for uploading
 */
function base64ToBlob(base64: string, mimeType: string = "image/jpeg"): Blob {
  // Remove data URL prefix if present
  const base64Data = base64.includes("base64,") 
    ? base64.split("base64,")[1] 
    : base64;

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Upload photos to PRIVATE Supabase Storage bucket
 * 
 * CRITICAL: Upload path format MUST be: ${userId}/${scanId}/front.jpg
 * 
 * @param userId - Authenticated user ID
 * @param scanId - Unique scan ID (use UUID)
 * @param frontPhotoBase64 - Front photo as base64 string
 * @param sidePhotoBase64 - Side photo as base64 string
 * @returns Paths (for DB) and signed URLs (for AI analysis)
 */
export async function uploadPhotosToStorage(
  userId: string,
  scanId: string,
  frontPhotoBase64: string,
  sidePhotoBase64: string
): Promise<UploadResult> {
  console.log("📤 [PhotoUpload] Starting upload to PRIVATE Supabase Storage", {
    userId,
    scanId,
    bucketName: "scan-photos",
    frontSize: frontPhotoBase64.length,
    sideSize: sidePhotoBase64.length,
  });

  try {
    // Convert base64 to blobs
    const frontBlob = base64ToBlob(frontPhotoBase64);
    const sideBlob = base64ToBlob(sidePhotoBase64);

    // CRITICAL: Upload paths must be ${userId}/${scanId}/filename.jpg
    const frontPath = `${userId}/${scanId}/front.jpg`;
    const sidePath = `${userId}/${scanId}/side.jpg`;

    console.log(`📤 [PhotoUpload] Uploading front photo to: ${frontPath}`);
    
    // Upload front photo to PRIVATE bucket
    const { data: frontData, error: frontError } = await supabase.storage
      .from("scan-photos")
      .upload(frontPath, frontBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (frontError) {
      console.error("❌ [PhotoUpload] Front photo upload failed:", frontError);
      console.error("❌ [PhotoUpload] Error details:", {
        message: frontError.message,
        statusCode: frontError.statusCode,
        path: frontPath,
      });
      throw new Error(`Failed to upload front photo: ${frontError.message}`);
    }

    console.log("✅ [PhotoUpload] Front photo uploaded successfully");
    console.log(`📤 [PhotoUpload] Uploading side photo to: ${sidePath}`);

    // Upload side photo to PRIVATE bucket
    const { data: sideData, error: sideError } = await supabase.storage
      .from("scan-photos")
      .upload(sidePath, sideBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (sideError) {
      console.error("❌ [PhotoUpload] Side photo upload failed:", sideError);
      console.error("❌ [PhotoUpload] Error details:", {
        message: sideError.message,
        statusCode: sideError.statusCode,
        path: sidePath,
      });
      throw new Error(`Failed to upload side photo: ${sideError.message}`);
    }

    console.log("✅ [PhotoUpload] Side photo uploaded successfully");
    console.log("🔐 [PhotoUpload] Generating signed URLs for AI analysis (60 min expiry)...");

    // Generate signed URLs for immediate AI analysis (60 min expiry)
    const { data: frontSignedData, error: frontSignedError } = await supabase.storage
      .from("scan-photos")
      .createSignedUrl(frontPath, 3600); // 60 minutes

    if (frontSignedError) {
      console.error("❌ [PhotoUpload] Failed to create signed URL for front photo:", frontSignedError);
      throw new Error(`Failed to create signed URL for front photo: ${frontSignedError.message}`);
    }

    const { data: sideSignedData, error: sideSignedError } = await supabase.storage
      .from("scan-photos")
      .createSignedUrl(sidePath, 3600); // 60 minutes

    if (sideSignedError) {
      console.error("❌ [PhotoUpload] Failed to create signed URL for side photo:", sideSignedError);
      throw new Error(`Failed to create signed URL for side photo: ${sideSignedError.message}`);
    }

    const frontImageUrl = frontSignedData.signedUrl;
    const sideImageUrl = sideSignedData.signedUrl;

    console.log("✅ [PhotoUpload] Upload complete", {
      frontPath,
      sidePath,
      frontSignedUrlLength: frontImageUrl.length,
      sideSignedUrlLength: sideImageUrl.length,
    });

    // Return PATHS for database storage + signed URLs for AI analysis
    return {
      frontImagePath: frontPath,
      sideImagePath: sidePath,
      frontImageUrl,
      sideImageUrl,
    };
  } catch (error) {
    console.error("❌ [PhotoUpload] Upload failed:", error);
    throw error;
  }
}

/**
 * Generate a signed URL for displaying a photo from PRIVATE bucket
 * 
 * @param path - Storage path (e.g., "userId/scanId/front.jpg")
 * @param expiresInSeconds - URL expiry time (default: 60 seconds)
 * @returns Signed URL or null if error
 */
export async function getSignedUrl(
  path: string,
  expiresInSeconds: number = 60
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("scan-photos")
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      console.error("❌ [PhotoUpload] Failed to create signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("❌ [PhotoUpload] Error creating signed URL:", error);
    return null;
  }
}
