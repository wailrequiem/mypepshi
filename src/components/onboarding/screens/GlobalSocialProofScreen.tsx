import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { OnboardingHeader } from "../OnboardingHeader";
import RotatingGlobe from "@/components/globe/RotatingGlobe";

interface GlobalSocialProofScreenProps {
  onNext: () => void;
  totalSteps: number;
  currentStep: number;
  onBack?: () => void;
}

export function GlobalSocialProofScreen({ onNext, totalSteps, currentStep, onBack }: GlobalSocialProofScreenProps) {
  return (
    <PageContainer className="px-6 py-8 safe-top safe-bottom">
      <OnboardingHeader 
        current={currentStep} 
        total={totalSteps} 
        onBack={onBack}
        showBack={!!onBack}
      />
      
      <div className="flex-1 flex flex-col justify-center items-center">
        {/* Rotating 3D Globe visualization */}
        <div className="mb-12">
          <RotatingGlobe />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">
            You're in good company
          </h1>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto">
            People from all over the world have started their glow-up journey with us.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pb-4"
      >
        <PrimaryButton onClick={onNext}>
          Continue
        </PrimaryButton>
      </motion.div>
    </PageContainer>
  );
}
