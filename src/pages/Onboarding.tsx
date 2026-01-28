import { useNavigate } from "react-router-dom";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import type { OnboardingData } from "@/components/onboarding/OnboardingFlow";

export default function Onboarding() {
  const navigate = useNavigate();

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("[ONBOARDING] 🎯 Onboarding complete!");
    console.log("[ONBOARDING] 📊 Data received:", data);
    console.log("[ONBOARDING] 🚀 Navigating to /paywall...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
      // Force navigation with replace to ensure clean transition
      navigate("/paywall", { replace: true });
      console.log("[ONBOARDING] ✅ Navigate called successfully (with replace: true)");
    } catch (error) {
      console.error("[ONBOARDING] ❌ Navigate failed:", error);
      // Fallback to window.location if React Router fails
      console.log("[ONBOARDING] 🔄 Attempting fallback navigation...");
      window.location.href = "/paywall";
    }
  };

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
}
