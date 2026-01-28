import { supabase } from "./supabase";

export interface PeptideRecommendation {
  name: string;
  fit_score: number;
  tags: string[];
  summary: string;
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
    
    // Extract the nested data structure
    // Backend returns: { ok: true, data: { generated_at, peptides: [...] } }
    const result = response.data.data || response.data;
    
    // Ensure peptides array exists
    const normalizedResult: PeptideRecommendationsData = {
      generated_at: result.generated_at || new Date().toISOString(),
      peptides: Array.isArray(result.peptides) ? result.peptides : []
    };
    
    console.log('🔴 [CLIENT] ✅ SUCCESS - Normalized data:', normalizedResult);
    console.log('🔴 [CLIENT] Peptides count:', normalizedResult.peptides.length);
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
