import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { OnboardingHeader } from "../OnboardingHeader";

interface FinalEngagementScreenProps {
  onNext: () => void;
  totalSteps: number;
  currentStep: number;
  onBack?: () => void;
}

export function FinalEngagementScreen({ onNext, totalSteps, currentStep, onBack }: FinalEngagementScreenProps) {
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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12"
        >
          {/* Animated glow background */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 w-32 h-32 rounded-full bg-primary/30 blur-2xl"
          />
          
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
            <Zap className="w-14 h-14 text-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Are you ready to see your results?
          </h1>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto">
            Your personalized analysis is complete
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pb-4"
      >
        <PrimaryButton onClick={() => {
          console.log("🔘 [FinalEngagementScreen] Button clicked!");
          onNext();
        }}>
          <Zap className="w-5 h-5" />
          Yes, show me my analysis
        </PrimaryButton>
      </motion.div>
    </PageContainer>
  );
}
