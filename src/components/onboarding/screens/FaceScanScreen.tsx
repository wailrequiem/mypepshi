import { ScanFlow } from "@/components/scan/ScanFlow";

interface FaceScanScreenProps {
  onNext: () => void;
  totalSteps: number;
  currentStep: number;
  onBack?: () => void;
}

export function FaceScanScreen({ onNext, totalSteps, currentStep, onBack }: FaceScanScreenProps) {
  // ScanFlow in "onboarding" mode:
  // 1. Captures front and side photos
  // 2. Saves photos to localStorage
  // 3. Calls onNext to continue the onboarding flow
  // 4. Does NOT redirect to paywall (continues onboarding)
  
  return <ScanFlow mode="onboarding" onComplete={onNext} onBack={onBack} />;
}
