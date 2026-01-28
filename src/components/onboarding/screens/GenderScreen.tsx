import { useState } from "react";
import { motion } from "framer-motion";
import { OnboardingOption } from "../OnboardingOption";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { OnboardingHeader } from "../OnboardingHeader";

interface GenderScreenProps {
  onNext: (gender: string) => void;
  totalSteps: number;
  currentStep: number;
  onBack?: () => void;
  onLoginClick?: () => void;
}

const genderOptions = [
  { emoji: "👨", label: "Man", value: "man" },
  { emoji: "👩", label: "Woman", value: "woman" },
  { emoji: "🙂", label: "Prefer not to say", value: "other" },
];

export function GenderScreen({ onNext, totalSteps, currentStep, onBack, onLoginClick }: GenderScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <PageContainer className="px-6 py-8 safe-top safe-bottom">
      <OnboardingHeader 
        current={currentStep} 
        total={totalSteps} 
        onBack={onBack}
        showBack={!!onBack}
        onLoginClick={onLoginClick}
      />
      
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-foreground mb-3">
            What's your gender?
          </h1>
          <p className="text-muted-foreground">
            This helps us personalize your experience
          </p>
        </motion.div>

        <div className="space-y-3">
          {genderOptions.map((option, index) => (
            <OnboardingOption
              key={option.value}
              emoji={option.emoji}
              label={option.label}
              selected={selected === option.value}
              onClick={() => setSelected(option.value)}
              delay={0.1 + index * 0.1}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pb-4"
      >
        <PrimaryButton
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
        >
          Continue
        </PrimaryButton>
      </motion.div>
    </PageContainer>
  );
}
