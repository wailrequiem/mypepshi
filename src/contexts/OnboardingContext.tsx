import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface OnboardingData {
  gender: "male" | "female" | null;
  age: number | null;
  struggles: string[];
  compliments: string;
  confidence: string;
  lifestyle: string[];
  mirror_thoughts: string;
  peptides_openness: string;
  peptides_knowledge: string;
  peptides_goals: string[];
  peptides_risk_tolerance: string;
  peptides_past_experience: string;
  peptides_timing: string;
  created_at: string;
  last_scan_id: string | null;
  current_step?: string;  // Track current onboarding step
  completed?: boolean;    // Track if onboarding is completed
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  setAnswer: (key: keyof OnboardingData, value: any) => void;
  toggleMultiAnswer: (key: keyof OnboardingData, value: string) => void;
  setScanId: (scanId: string) => void;
  setCurrentStep: (step: string) => void;
  markCompleted: () => void;
  resetOnboarding: () => void;
  syncToSupabase: () => Promise<void>;
  completeAndSync: () => Promise<void>;
}

const defaultData: OnboardingData = {
  gender: null,
  age: null,
  struggles: [],
  compliments: "",
  confidence: "",
  lifestyle: [],
  mirror_thoughts: "",
  peptides_openness: "",
  peptides_knowledge: "",
  peptides_goals: [],
  peptides_risk_tolerance: "",
  peptides_past_experience: "",
  peptides_timing: "",
  created_at: new Date().toISOString(),
  last_scan_id: null,
  current_step: "gender",
  completed: false,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = "onboarding_data";

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultData;
      }
    }
    return defaultData;
  });

  // Persist to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingData));
  }, [onboardingData]);

  // Memoized functions to prevent infinite re-renders in consumers
  const setAnswer = useCallback((key: keyof OnboardingData, value: any) => {
    setOnboardingData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const toggleMultiAnswer = useCallback((key: keyof OnboardingData, value: string) => {
    setOnboardingData((prev) => {
      const current = prev[key] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        [key]: updated,
      };
    });
  }, []);

  const setScanId = useCallback((scanId: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      last_scan_id: scanId,
    }));
  }, []);

  const setCurrentStep = useCallback((step: string) => {
    setOnboardingData((prev) => {
      // Guard: only update if step actually changed (prevents infinite loops)
      if (prev.current_step === step) return prev;
      return {
        ...prev,
        current_step: step,
      };
    });
  }, []);

  const markCompleted = useCallback(() => {
    setOnboardingData((prev) => ({
      ...prev,
      completed: true,
    }));
  }, []);

  const syncToSupabase = useCallback(async () => {
    if (!user) return;

    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        onboarding_json: onboardingData,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to sync onboarding data:", error);
    }
  }, [user, onboardingData]);

  // Complete onboarding and sync to Supabase in one call
  // This ensures completed: true is saved to the database immediately
  const completeAndSync = useCallback(async () => {
    const completedData = {
      ...onboardingData,
      completed: true,
    };
    
    // Update local state
    setOnboardingData(completedData);
    
    // Sync to Supabase immediately with the completed flag
    if (user) {
      try {
        console.log("[OnboardingContext] Syncing completed onboarding to Supabase...");
        await supabase.from("profiles").upsert({
          id: user.id,
          onboarding_json: completedData,
          updated_at: new Date().toISOString(),
        });
        console.log("[OnboardingContext] ✅ Onboarding synced with completed: true");
      } catch (error) {
        console.error("[OnboardingContext] Failed to sync completed onboarding:", error);
      }
    } else {
      console.log("[OnboardingContext] No user, skipping Supabase sync");
    }
  }, [user, onboardingData]);

  const resetOnboarding = useCallback(() => {
    setOnboardingData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Sync to Supabase when user logs in (only once per user change)
  useEffect(() => {
    if (user) {
      syncToSupabase();
    }
  }, [user, syncToSupabase]);

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        setAnswer,
        toggleMultiAnswer,
        setScanId,
        setCurrentStep,
        markCompleted,
        resetOnboarding,
        syncToSupabase,
        completeAndSync,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return {
    onboardingData: context.onboardingData,
    setAnswer: context.setAnswer,
    toggleMultiAnswer: context.toggleMultiAnswer,
    setScanId: context.setScanId,
    setCurrentStep: context.setCurrentStep,
    markCompleted: context.markCompleted,
    resetOnboarding: context.resetOnboarding,
    syncToSupabase: context.syncToSupabase,
    completeAndSync: context.completeAndSync,
  };
}
