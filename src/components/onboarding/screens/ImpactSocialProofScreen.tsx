import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { OnboardingHeader } from "../OnboardingHeader";

interface ImpactSocialProofScreenProps {
  onNext: () => void;
  totalSteps: number;
  currentStep: number;
  onBack?: () => void;
}

export function ImpactSocialProofScreen({ onNext, totalSteps, currentStep, onBack }: ImpactSocialProofScreenProps) {
  return (
    <PageContainer className="px-6 py-8 safe-top safe-bottom">
      <OnboardingHeader 
        current={currentStep} 
        total={totalSteps} 
        onBack={onBack}
        showBack={!!onBack}
      />
      
      <div className="flex-1 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Large percentage display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <span className="text-7xl md:text-8xl font-bold text-gradient">
              89%
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-foreground mb-4 max-w-xs mx-auto"
          >
            of our users feel more attractive after 8 weeks
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground/60 text-sm"
          >
            *Data collected from 50,000+ users of our app
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="pb-4"
      >
        <PrimaryButton onClick={onNext}>
          Continue
        </PrimaryButton>
      </motion.div>
    </PageContainer>
  );
}
