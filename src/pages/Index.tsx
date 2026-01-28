import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { OnboardingData } from "@/components/onboarding/OnboardingFlow";

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (isLoading) return; // Wait for auth to load

      if (import.meta.env.DEV) {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("[INDEX] Checking authentication and onboarding status");
        console.log("[INDEX] User authenticated:", !!user);
      }

      if (user) {
        try {
          // Check if user has any scans
          const { data: scans, error } = await supabase
            .from("scans")
            .select("id")
            .eq("user_id", user.id)
            .limit(1);

          if (error) {
            console.error("[INDEX] Error checking scans:", error);
            setIsChecking(false);
            return;
          }

          if (scans && scans.length > 0) {
            // User has scans → redirect to dashboard
            if (import.meta.env.DEV) {
              console.log("[INDEX] ✅ User has scans, redirecting to dashboard");
              console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            }
            navigate("/dashboard", { replace: true });
          } else {
            // User has no scans → redirect to new scan
            if (import.meta.env.DEV) {
              console.log("[INDEX] ⚠️ User has no scans, redirecting to /scan/new");
              console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            }
            navigate("/scan/new", { replace: true });
          }
        } catch (error) {
          console.error("[INDEX] Unexpected error:", error);
          setIsChecking(false);
        }
      } else {
        // Not authenticated → show onboarding
        if (import.meta.env.DEV) {
          console.log("[INDEX] ℹ️ No user, showing onboarding");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }
        setIsChecking(false);
      }
    };

    checkAuthAndRedirect();
  }, [user, isLoading, navigate]);

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[INDEX] 🎯 Onboarding complete!");
    console.log("[INDEX] 📊 Data received:", data);
    console.log("[INDEX] 🚀 Navigating to /paywall...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
      // Force navigation with replace to ensure clean transition
      navigate("/paywall", { replace: true });
      console.log("[INDEX] ✅ Navigate called successfully (with replace: true)");
    } catch (error) {
      console.error("[INDEX] ❌ Navigate failed:", error);
      // Fallback to window.location if React Router fails
      console.log("[INDEX] 🔄 Attempting fallback navigation...");
      window.location.href = "/paywall";
    }
  };

  // Show loading while checking
  if (isLoading || (user && isChecking)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show onboarding for non-authenticated users
  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
}
