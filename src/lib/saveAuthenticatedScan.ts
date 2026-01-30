/**
 * Save Authenticated User Scan
 * 
 * Directly saves a scan for authenticated AND PAID users:
 * 1. Check payment status (REQUIRED)
 * 2. Upload photos to Supabase Storage
 * 3. Call analyze-face Edge Function
 * 4. Save scan to database
 * 5. Generate personalized glow-up plan
 * 
 * Used when authenticated users do "New Scan" from dashboard
 * 
 * IMPORTANT: This function BLOCKS if user has not paid.
 */

import { supabase } from "./supabase";
import { requirePaidAccess } from "./accessState";

export interface SaveScanResult {
  success: boolean;
  scanId?: string;
  error?: string;
  step?: string;
}

/**
 * Convert base64 dataURL to Blob
 */
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Main function: Save authenticated user scan directly to database
 * 
 * CRITICAL: This function ONLY runs if the user has paid.
 * If user has not paid, it returns early with PAYMENT_REQUIRED error.
 */
export async function saveAuthenticatedScan(
  frontPhotoBase64: string,
  sidePhotoBase64: string
): Promise<SaveScanResult> {
  console.log("🚀 [NEW_SCAN] Starting authenticated scan save...");

  try {
    // 0. PAYMENT GATE - Check if user has paid BEFORE any uploads
    const accessResult = await requirePaidAccess();
    if (!accessResult.allowed) {
      console.warn("🚫 [NEW_SCAN] BLOCKED: User has not paid - no uploads allowed");
      return { 
        success: false, 
        error: accessResult.reason || "PAYMENT_REQUIRED", 
        step: "payment_check" 
      };
    }

    console.log("✅ [NEW_SCAN] Payment verified, proceeding with scan save...");

    // 1. Get user (already verified in requirePaidAccess, but need the user object)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ [NEW_SCAN] User not authenticated:", authError);
      return { success: false, error: "Not authenticated", step: "auth" };
    }

    console.log("✅ [NEW_SCAN] User authenticated:", user.id);

    // 2. Generate NEW scan ID
    const scanId = crypto.randomUUID();
    console.log("📝 [NEW_SCAN] Generated NEW scanId:", scanId);

    // 3. Convert images to Blobs
    console.log("🖼️ [NEW_SCAN] Converting images to blobs...");
    const frontBlob = dataURLtoBlob(frontPhotoBase64);
    const sideBlob = dataURLtoBlob(sidePhotoBase64);
    console.log("✅ [NEW_SCAN] Images converted");

    // 4. Upload photos to Supabase Storage
    console.log("📤 [NEW_SCAN] Uploading photos to Storage...");
    
    const frontPath = `${user.id}/${scanId}/front.jpg`;
    const sidePath = `${user.id}/${scanId}/side.jpg`;

    console.log(`📤 [NEW_SCAN] Uploading front photo to: ${frontPath}`);
    const { error: frontUploadError } = await supabase.storage
      .from("scan-photos")
      .upload(frontPath, frontBlob, { upsert: true });

    if (frontUploadError) {
      console.error("❌ [NEW_SCAN] Front photo upload failed:", frontUploadError);
      return { success: false, error: frontUploadError.message, step: "upload_front" };
    }

    console.log(`📤 [NEW_SCAN] Uploading side photo to: ${sidePath}`);
    const { error: sideUploadError } = await supabase.storage
      .from("scan-photos")
      .upload(sidePath, sideBlob, { upsert: true });

    if (sideUploadError) {
      console.error("❌ [NEW_SCAN] Side photo upload failed:", sideUploadError);
      return { success: false, error: sideUploadError.message, step: "upload_side" };
    }

    console.log("✅ [NEW_SCAN] Photos uploaded successfully");

    // 5. Generate signed URLs for AI analysis (60 min expiry)
    console.log("🔗 [NEW_SCAN] Generating signed URLs for AI...");
    const { data: frontSignedData, error: frontSignedError } = await supabase.storage
      .from("scan-photos")
      .createSignedUrl(frontPath, 3600);

    const { data: sideSignedData, error: sideSignedError } = await supabase.storage
      .from("scan-photos")
      .createSignedUrl(sidePath, 3600);

    if (frontSignedError || sideSignedError || !frontSignedData || !sideSignedData) {
      console.error("❌ [NEW_SCAN] Failed to generate signed URLs");
      return { success: false, error: "Failed to generate signed URLs", step: "signed_urls" };
    }

    console.log("✅ [NEW_SCAN] Signed URLs generated");

    // 6. Get user's onboarding data for AI context
    console.log("📖 [NEW_SCAN] Fetching user profile...");
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_json")
      .eq("id", user.id)
      .single();

    const onboardingData = profile?.onboarding_json || {};
    console.log("✅ [NEW_SCAN] Profile loaded, age:", onboardingData.age, "gender:", onboardingData.gender);

    // 7. Call analyze-face Edge Function
    console.log("🤖 [NEW_SCAN] Calling analyze-face...");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: "No active session", step: "session" };
    }

    const analyzePayload = {
      front_image_url: frontSignedData.signedUrl,
      side_image_url: sideSignedData.signedUrl,
      age: onboardingData.age || 25,
      sex: onboardingData.gender || "male",
    };

    console.log("📤 [NEW_SCAN] analyze-face payload:", analyzePayload);

    const { data: aiData, error: aiError } = await supabase.functions.invoke("analyze-face", {
      body: analyzePayload,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (aiError) {
      console.error("❌ [NEW_SCAN] AI analysis failed:", aiError);
      return { success: false, error: aiError.message, step: "analyze" };
    }

    // Parse AI response
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[AI] Raw response from analyze-face:", JSON.stringify(aiData, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const parsed = typeof aiData === "string" ? JSON.parse(aiData) : aiData;
    const aiResult = parsed?.data || parsed;

    console.log("[AI] Parsed response structure:");
    console.log("  - parsed?.ok:", parsed?.ok);
    console.log("  - aiResult?.scores:", aiResult?.scores);
    console.log("  - aiResult?.gender:", aiResult?.gender);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (!parsed?.ok || !aiResult?.scores || !aiResult?.gender) {
      console.error("❌ [NEW_SCAN] Invalid AI response:", parsed);
      return { success: false, error: "Invalid AI response", step: "analyze_parse" };
    }

    console.log("✅ [NEW_SCAN] AI analysis completed");
    console.log("[AI] Scores being saved to database:", JSON.stringify(aiResult.scores, null, 2));

    // 8. Insert scan into database
    console.log("💾 [NEW_SCAN] Inserting scan into database...");
    const { error: insertError } = await supabase.from("scans").insert({
      id: scanId,
      user_id: user.id,
      front_image_path: frontPath,
      side_image_path: sidePath,
      scores_json: aiResult.scores,
      notes_json: aiResult.notes || {},
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("❌ [NEW_SCAN] Failed to insert scan:", insertError);
      return { success: false, error: insertError.message, step: "insert_scan" };
    }

    console.log("✅ [NEW_SCAN] Scan inserted successfully (scanId:", scanId, ")");

    // 9. Generate and save glow-up plan (non-blocking)
    try {
      console.log("🎯 [NEW_SCAN] Generating glow-up plan...");
      
      const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
        body: { scanId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (planError) {
        console.error("⚠️ [NEW_SCAN] Plan generation error:", planError);
      } else if (planData?.ok && planData?.plan) {
        console.log("✅ [NEW_SCAN] Glow-up plan generated");
        // Plan is already saved in the edge function
      } else {
        console.warn("⚠️ [NEW_SCAN] Plan API returned non-ok response:", planData);
      }
    } catch (planError) {
      console.warn("⚠️ [NEW_SCAN] Plan generation failed (non-blocking):", planError);
    }

    console.log("🎉 [NEW_SCAN] Save completed successfully!");
    return { success: true, scanId };

  } catch (error: any) {
    console.error("❌ [NEW_SCAN] Unexpected error during save:", error);
    return {
      success: false,
      error: error.message || "Unexpected error",
      step: "unexpected",
    };
  }
}
