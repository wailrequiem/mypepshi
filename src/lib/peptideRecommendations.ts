import { supabase } from "./supabase";

export interface PeptideRecommendation {
  name: string;
  fit_score: number;
  tags: string[];
  summary: string;
  reasons?: string[]; // Optional: AI-generated reasons for recommendation
}

export interface PeptideRecommendationsData {
  generated_at: string;
  peptides: PeptideRecommendation[];
}

export async function getPeptideRecommendations(scanId: string) {
  try {
    // Validate scanId
    if (!scanId) {
      console.error('🔴 [CLIENT] ERROR: No scanId provided!');
      throw new Error('scanId is required');
    }
    
    console.log('🔴 [CLIENT] Starting peptide recommendations');
    console.log('🔴 [CLIENT] scanId:', scanId);
    console.log('🔴 [CLIENT] Payload being sent:', { scanId });
    
    const response = await supabase.functions.invoke('recommend-peptides', {
      body: { scanId }
    });
    
    console.log('🔴 [CLIENT] Raw response:', response);
    console.log('🔴 [CLIENT] Response status:', response.status);
    console.log('🔴 [CLIENT] Response data:', response.data);
    console.log('🔴 [CLIENT] Response error:', response.error);
    
    if (response.error) {
      console.error('🔴 [CLIENT] Edge Function returned error:');
      console.error('🔴 [CLIENT] Error type:', typeof response.error);
      console.error('🔴 [CLIENT] Error keys:', Object.keys(response.error));
      console.error('🔴 [CLIENT] Full error:', JSON.stringify(response.error, null, 2));
      throw response.error;
    }
    
    if (!response.data) {
      console.error('🔴 [CLIENT] No data in response');
      throw new Error('No data returned from Edge Function');
    }
    
    // Extract the peptides array
    // NEW format: { ok: true, recommended_peptides: [...], cached: boolean }
    // OLD format: { ok: true, data: { generated_at, peptides: [...] } }
    const responseData = response.data;
    
    let peptides: PeptideRecommendation[] = [];
    let generated_at = new Date().toISOString();
    
    // Handle new format (recommended_peptides at root level)
    if (Array.isArray(responseData.recommended_peptides)) {
      peptides = responseData.recommended_peptides;
      console.log('🔴 [CLIENT] Using NEW response format (recommended_peptides)');
    }
    // Handle old format (nested in data.peptides)
    else if (responseData.data?.peptides) {
      peptides = responseData.data.peptides;
      generated_at = responseData.data.generated_at || generated_at;
      console.log('🔴 [CLIENT] Using OLD response format (data.peptides)');
    }
    // Fallback: check root level peptides
    else if (Array.isArray(responseData.peptides)) {
      peptides = responseData.peptides;
      generated_at = responseData.generated_at || generated_at;
      console.log('🔴 [CLIENT] Using fallback format (root peptides)');
    }
    
    const normalizedResult: PeptideRecommendationsData = {
      generated_at,
      peptides
    };
    
    console.log('🔴 [CLIENT] ✅ SUCCESS - Normalized data:', normalizedResult);
    console.log('🔴 [CLIENT] Peptides count:', normalizedResult.peptides.length);
    console.log('🔴 [CLIENT] Cached:', responseData.cached);
    return normalizedResult;
    
  } catch (error) {
    console.error('🔴 [CLIENT] ❌ CATCH BLOCK - Final error:', error);
    console.error('🔴 [CLIENT] Error name:', error?.name);
    console.error('🔴 [CLIENT] Error message:', error?.message);
    console.error('🔴 [CLIENT] Error stack:', error?.stack);
    
    // Return empty array instead of throwing - allows UI to show gracefully
    return {
      generated_at: new Date().toISOString(),
      peptides: []
    };
  }
}
