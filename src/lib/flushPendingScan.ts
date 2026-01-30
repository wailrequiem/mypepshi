/**
 * Flush Pending Scan to Supabase
 * 
 * Processes guest scans ONLY AFTER PAYMENT:
 * 1. Check payment status (REQUIRED)
 * 2. Upload photos to Supabase Storage
 * 3. Call analyze-face Edge Function
 * 4. Save scan to database
 * 5. Clear pending scan from localStorage
 * 
 * IMPORTANT: This function BLOCKS if user has not paid.
 */

import { supabase } from "./supabase";
import { loadPendingScan, clearPendingScan } from "./pendingScan";
import { requirePaidAccess } from "./accessState";

export interface FlushResult {
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
 * Main function: Flush pending scan to Supabase
 * 
 * CRITICAL: This function ONLY runs if the user has paid.
 * If user has not paid, it returns early with PAYMENT_REQUIRED error.
 */
export async function flushPendingScanToSupabase(): Promise<FlushResult> {
  console.log("🚀 [PENDING] Starting flush to Supabase...");

  try {
    // 0. PAYMENT GATE - Check if user has paid BEFORE any uploads
    const accessResult = await requirePaidAccess();
    if (!accessResult.allowed) {
      console.warn("🚫 [PENDING] BLOCKED: User has not paid - no uploads allowed");
      return { 
        success: false, 
        error: accessResult.reason || "PAYMENT_REQUIRED", 
        step: "payment_check" 
      };
    }

    console.log("✅ [PENDING] Payment verified, proceeding with flush...");

    // 1. Load pending scan
    const pendingScan = loadPendingScan();
    if (!pendingScan) {
      console.log("ℹ️ [PENDING] No pending scan to flush");
      return { success: false, error: "No pending scan found", step: "load" };
    }

    // 2. Get user (already verified in requirePaidAccess, but need the user object)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ [PENDING] User not authenticated:", authError);
      return { success: false, error: "Not authenticated", step: "auth" };
    }

    console.log("✅ [PENDING] User authenticated:", user.id);

    // 3. Generate scan ID
    const scanId = crypto.randomUUID();
    console.log("📝 [PENDING] Generated scanId:", scanId);

    // 4. Convert images to Blobs
    console.log("🖼️ [PENDING] Converting images to blobs...");
    const frontBlob = dataURLtoBlob(pendingScan.frontImage);
    const sideBlob = dataURLtoBlob(pendingScan.sideImage);
    console.log("✅ [PENDING] Images converted");

    // 5. Upload photos to Supabase Storage
    console.log("📤 [PENDING] Uploading photos to Storage...");
    
    const frontPath = `${user.id}/${scanId}/front.jpg`;
    const sidePath = `${user.id}/${scanId}/side.jpg`;

    console.log(`📤 [PENDING] Uploading front photo to: ${frontPath}`);
    const { error: frontUploadError } = await supabase.storage
      .from("scan-photos")
      .upload(frontPath, frontBlob, { upsert: true });

    if (frontUploadError) {
      console.error("❌ [PENDING] Front photo upload failed:", frontUploadError);
      return { success: false, error: frontUploadError.message, step: "upload_front" };
    }

    console.log(`📤 [PENDING] Uploading side photo to: ${sidePath}`);
    const { error: sideUploadError } = await supabase.storage
      .from("scan-photos")
      .upload(sidePath, sideBlob, { upsert: true });

    if (sideUploadError) {
      console.error("❌ [PENDING] Side photo upload failed:", sideUploadError);
      return { success: false, error: sideUploadError.message, step: "upload_side" };
    }

    console.log("✅ [PENDING] Photos uploaded successfully");

    // 6. Generate signed URLs for AI analysis (60 min expiry)
    console.log("🔗 [PENDING] Generating signed URLs for AI...");
    const { data: frontSignedData, error: frontSignedError } = await supabase.storage
      .from("scan-photos")
      .createSignedUrl(frontPath, 3600);

    const { data: sideSignedData, error: sideSignedError } = await supabase.storage
      .from("scan-photos")
      .createSignedUrl(sidePath, 3600);

    if (frontSignedError || sideSignedError || !frontSignedData || !sideSignedData) {
      console.error("❌ [PENDING] Failed to generate signed URLs");
      return { success: false, error: "Failed to generate signed URLs", step: "signed_urls" };
    }

    console.log("✅ [PENDING] Signed URLs generated");

    // 7. Call analyze-face Edge Function
    console.log("🤖 [PENDING] Calling analyze-face...");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: "No active session", step: "session" };
    }

    // IMPORTANT: Use exact keys expected by analyze-face Edge Function
    const analyzePayload = {
      front_image_url: frontSignedData.signedUrl,
      side_image_url: sideSignedData.signedUrl,
      age: pendingScan.onboarding.age || 25,
      sex: pendingScan.onboarding.gender || "male",
    };

    console.log("📤 [PENDING] analyze-face payload keys:", Object.keys(analyzePayload));

    const { data: aiData, error: aiError } = await supabase.functions.invoke("analyze-face", {
      body: analyzePayload,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (aiError) {
      console.error("❌ [PENDING] AI analysis failed:", aiError);
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
      console.error("❌ [PENDING] Invalid AI response:", parsed);
      return { success: false, error: "Invalid AI response", step: "analyze_parse" };
    }

    console.log("✅ [PENDING] AI analysis completed");
    console.log("[AI] Scores being saved to database:", JSON.stringify(aiResult.scores, null, 2));

    // 8. Save onboarding data to profiles
    console.log("💾 [PENDING] Saving onboarding data...");
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        onboarding_json: pendingScan.onboarding,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.warn("⚠️ [PENDING] Failed to save onboarding (non-blocking):", profileError);
    } else {
      console.log("✅ [PENDING] Onboarding data saved");
    }

    // 9. Insert scan into database
    console.log("💾 [PENDING] Inserting scan into database...");
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
      console.error("❌ [PENDING] Failed to insert scan:", insertError);
      return { success: false, error: insertError.message, step: "insert_scan" };
    }

    console.log("✅ [PENDING] Scan inserted successfully (scanId:", scanId, ")");

    // 10. Generate and save glow-up plan (non-blocking)
    try {
      console.log("🎯 [PENDING] Generating glow-up plan...");
      
      const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
        body: { scanId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (planError) {
        console.error("⚠️ [PENDING] Plan generation error:", planError);
      } else if (planData?.ok && planData?.plan) {
        console.log("✅ [PENDING] Glow-up plan generated");
        // Plan is already saved in the edge function
      } else {
        console.warn("⚠️ [PENDING] Plan API returned non-ok response:", planData);
      }
    } catch (planError) {
      console.warn("⚠️ [PENDING] Plan generation failed (non-blocking):", planError);
    }

    // 11. Clear pending scan
    console.log("🗑️ [PENDING] Clearing pending_scan from localStorage...");
    clearPendingScan();

    console.log("🎉 [PENDING] Flush completed successfully!");
    return { success: true, scanId };

  } catch (error: any) {
    console.error("❌ [PENDING] Unexpected error during flush:", error);
    return {
      success: false,
      error: error.message || "Unexpected error",
      step: "unexpected",
    };
  }
}
