import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { OnboardingHeader } from "../OnboardingHeader";

interface PostScanTransitionScreenProps {
  onNext: () => void;
  totalSteps: number;
  currentStep: number;
  onBack?: () => void;
}

export function PostScanTransitionScreen({ onNext, totalSteps, currentStep, onBack }: PostScanTransitionScreenProps) {
  return (
    <PageContainer className="px-6 py-8 safe-top safe-bottom">
      <OnboardingHeader 
        current={currentStep} 
        total={totalSteps} 
        onBack={onBack}
        showBack={!!onBack}
      />
      
      <div className="flex-1 flex flex-col justify-center items-center">
        {/* Abstract face illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-48 h-48 mb-12"
        >
          {/* Glow background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-xl" />
          
          {/* Main circle */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-surface to-surface-elevated border border-border/50 flex items-center justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-16 h-16 text-primary" />
            </motion.div>
          </div>

          {/* Orbiting particles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 8 + i * 2, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute inset-0"
            >
              <div 
                className="absolute w-3 h-3 rounded-full bg-primary/60"
                style={{ 
                  top: "10%", 
                  left: "50%", 
                  transform: `rotate(${i * 120}deg) translateX(${60 + i * 20}px)` 
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Answer a few questions to get your personalized glow-up plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-xs mx-auto">
            Your answers help tailor recommendations to your goals and profile.
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
