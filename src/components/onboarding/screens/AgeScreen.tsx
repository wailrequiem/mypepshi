import { useState } from "react";
import { motion } from "framer-motion";
import { OnboardingOption } from "../OnboardingOption";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { OnboardingHeader } from "../OnboardingHeader";

interface AgeScreenProps {
  onNext: (age: string) => void;
  totalSteps: number;
  currentStep: number;
  onBack?: () => void;
}

const ageOptions = [
  { emoji: "🎯", label: "Under 18", value: "under18" },
  { emoji: "🧑", label: "18–24", value: "18-24" },
  { emoji: "🔥", label: "25–34", value: "25-34" },
  { emoji: "💼", label: "35–44", value: "35-44" },
  { emoji: "🧠", label: "45+", value: "45+" },
];

export function AgeScreen({ onNext, totalSteps, currentStep, onBack }: AgeScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <PageContainer className="px-6 py-8 safe-top safe-bottom">
      <OnboardingHeader 
        current={currentStep} 
        total={totalSteps} 
        onBack={onBack}
        showBack={!!onBack}
      />
      
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-foreground mb-3">
            How old are you?
          </h1>
          <p className="text-muted-foreground">
            Age helps us tailor your optimization plan
          </p>
        </motion.div>

        <div className="space-y-3">
          {ageOptions.map((option, index) => (
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
        transition={{ delay: 0.5 }}
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
